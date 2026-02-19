import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { nip19, generateSecretKey, getPublicKey } from "nostr-tools";
import { BunkerSigner, parseBunkerInput } from "nostr-tools/nip46";
import { SimplePool } from "nostr-tools/pool";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { loginWithNostr, getProfileStatus, getCurrentUser, registerWithEmail as apiRegister, loginWithEmail as apiLogin } from "@/lib/api";
import { getOrCreateKeyPair, hasStoredKeys, loadKeyPairFromStorage, getSecretKeyBytes } from "@/lib/nostr-keygen";

interface UserStats {
  sats: number;
  level: string;
  streak: number;
  walletBalance: number;
  satsGiven: number;
  satsReceived: number;
  badges: string[];
  tier?: string;
}

interface NostrProfile {
  npub: string;
  pubkey: string;
  userId?: string;
  name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string;
  buddyDescription?: string;
  lookingForBuddy?: boolean;
  labInterests?: string[];
}

interface NostrContextType {
  isConnected: boolean;
  isLoading: boolean;
  profile: NostrProfile | null;
  userStats: UserStats | null;
  loginMethod: "extension" | "bunker" | "ncryptsec" | "email" | null;
  error: string | null;
  connectWithExtension: () => Promise<boolean>;
  connectWithBunker: (bunkerUrl: string) => Promise<boolean>;
  connectWithEmail: (email: string, password: string, twoFactorCode?: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
  disconnect: () => void;
  signEvent: (event: any) => Promise<any>;
  isAdmin: boolean;
  needsProfileCompletion: boolean;
  markProfileComplete: () => void;
  refreshUserStats: () => Promise<void>;
  emailKeyPair: { pubkey: string; nsec: string; npub: string } | null;
}

const NostrContext = createContext<NostrContextType | undefined>(undefined);

declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
      signEvent: (event: any) => Promise<any>;
      getRelays?: () => Promise<Record<string, { read: boolean; write: boolean }>>;
      nip04?: {
        encrypt: (pubkey: string, plaintext: string) => Promise<string>;
        decrypt: (pubkey: string, ciphertext: string) => Promise<string>;
      };
      nip44?: {
        encrypt: (pubkey: string, plaintext: string) => Promise<string>;
        decrypt: (pubkey: string, ciphertext: string) => Promise<string>;
      };
    };
  }
}

export function NostrProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<NostrProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loginMethod, setLoginMethod] = useState<"extension" | "bunker" | "ncryptsec" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  
  const [emailKeyPair, setEmailKeyPair] = useState<{ pubkey: string; nsec: string; npub: string } | null>(null);
  
  const bunkerSignerRef = useRef<BunkerSigner | null>(null);
  const poolRef = useRef<SimplePool | null>(null);

  const refreshUserStats = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserStats({
          sats: user.sats || 0,
          level: user.level || "Explorer",
          streak: user.streak || 0,
          walletBalance: user.walletBalance || 0,
          satsGiven: user.satsGiven || 0,
          satsReceived: user.satsReceived || 0,
          badges: user.badges || [],
          tier: user.tier || "free",
        });
        if (profile) {
          setProfile(prev => prev ? {
            ...prev,
            lookingForBuddy: user.lookingForBuddy || false,
            buddyDescription: user.buddyDescription || "",
            labInterests: user.labInterests || [],
          } : prev);
        }
      }
    } catch (e) {
      console.error("Failed to refresh user stats:", e);
    }
  }, []);

  const checkBunkerSession = useCallback(async () => {
    const savedMethod = localStorage.getItem("nostr_login_method");
    const savedPubkey = localStorage.getItem("nostr_pubkey");
    const bunkerSession = localStorage.getItem("nostr_bunker_session");
    
    if (savedMethod === "bunker" && savedPubkey && bunkerSession) {
      try {
        const session = JSON.parse(bunkerSession);
        const localSecretKey = hexToBytes(session.localSecretKey);
        
        const pool = new SimplePool();
        poolRef.current = pool;
        
        const bunkerPointer = {
          pubkey: session.remotePubkey,
          relays: session.relays,
          secret: session.secret || "",
        };
        
        const signer = BunkerSigner.fromBunker(localSecretKey, bunkerPointer, { pool });
        await signer.connect();
        bunkerSignerRef.current = signer;
        
        const npub = nip19.npubEncode(savedPubkey);
        setProfile({
          npub,
          pubkey: savedPubkey,
          name: localStorage.getItem("nostr_name") || undefined,
          picture: localStorage.getItem("nostr_picture") || undefined,
        });
        setIsConnected(true);
        setLoginMethod("bunker");
        
        try {
          const status = await getProfileStatus();
          setNeedsProfileCompletion(!status.profileComplete);
        } catch {
          setNeedsProfileCompletion(false);
        }
        
        await refreshUserStats();
        return true;
      } catch (e) {
        console.error("Failed to restore bunker session:", e);
        localStorage.removeItem("nostr_bunker_session");
        localStorage.removeItem("nostr_pubkey");
        localStorage.removeItem("nostr_login_method");
      }
    }
    return false;
  }, [refreshUserStats]);

  const checkExtension = useCallback(async () => {
    if (typeof window !== "undefined" && window.nostr) {
      const savedPubkey = localStorage.getItem("nostr_pubkey");
      const savedMethod = localStorage.getItem("nostr_login_method");
      
      if (savedPubkey && savedMethod === "extension") {
        try {
          const pubkey = await window.nostr.getPublicKey();
          if (pubkey === savedPubkey) {
            const npub = nip19.npubEncode(pubkey);
            setProfile({
              npub,
              pubkey,
              name: localStorage.getItem("nostr_name") || undefined,
              picture: localStorage.getItem("nostr_picture") || undefined,
            });
            setIsConnected(true);
            setLoginMethod("extension");
            
            try {
              const status = await getProfileStatus();
              setNeedsProfileCompletion(!status.profileComplete);
            } catch {
              setNeedsProfileCompletion(false);
            }
            
            await refreshUserStats();
          }
        } catch (e) {
          localStorage.removeItem("nostr_pubkey");
          localStorage.removeItem("nostr_login_method");
        }
      }
    }
    setIsLoading(false);
  }, [refreshUserStats]);

  const checkEmailSession = useCallback(async () => {
    const savedMethod = localStorage.getItem("nostr_login_method");
    const authToken = localStorage.getItem("auth_token");

    if (savedMethod === "email" && authToken) {
      try {
        const user = await getCurrentUser();
        if (user) {
          setProfile({
            npub: user.nostrPubkey ? nip19.npubEncode(user.nostrPubkey) : "",
            pubkey: user.nostrPubkey || "",
            userId: user.id,
            name: user.name || user.username,
            picture: user.avatar || undefined,
            lookingForBuddy: user.lookingForBuddy || false,
            buddyDescription: user.buddyDescription || "",
            labInterests: user.labInterests || [],
          });
          setIsConnected(true);
          setLoginMethod("email");
          setNeedsProfileCompletion(false);
          await refreshUserStats();
          return true;
        }
      } catch (e) {
        console.error("Failed to restore email session:", e);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("nostr_login_method");
      }
    }
    return false;
  }, [refreshUserStats]);

  useEffect(() => {
    const initSession = async () => {
      const emailRestored = await checkEmailSession();
      if (emailRestored) {
        setIsLoading(false);
        return;
      }
      const bunkerRestored = await checkBunkerSession();
      if (!bunkerRestored) {
        await checkExtension();
      } else {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(initSession, 100);
    return () => clearTimeout(timer);
  }, [checkEmailSession, checkBunkerSession, checkExtension]);

  useEffect(() => {
    if (loginMethod === "email" && isConnected) {
      const keyPair = getOrCreateKeyPair();
      setEmailKeyPair(keyPair);
      setProfile((prev) => {
        if (!prev) return prev;
        if (prev.pubkey && prev.pubkey.length > 0) return prev;
        return {
          ...prev,
          pubkey: keyPair.pubkey,
          npub: keyPair.npub,
        };
      });
    } else {
      setEmailKeyPair(null);
    }
  }, [loginMethod, isConnected]);

  const connectWithExtension = useCallback(async (): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    if (!window.nostr) {
      setError("No Nostr extension found. Please install Alby, nos2x, or another NIP-07 compatible extension.");
      setIsLoading(false);
      return false;
    }

    try {
      const pubkey = await window.nostr.getPublicKey();
      const npub = nip19.npubEncode(pubkey);
      
      const user = await loginWithNostr(pubkey, {
        name: localStorage.getItem("nostr_name") || undefined,
        picture: localStorage.getItem("nostr_picture") || undefined,
      });
      
      localStorage.setItem("nostr_pubkey", pubkey);
      localStorage.setItem("nostr_login_method", "extension");
      localStorage.setItem("nostr_user_id", user.id);
      
      setProfile({
        npub,
        pubkey,
        userId: user.id,
        name: user.name,
        picture: user.avatar,
      });
      setIsConnected(true);
      setLoginMethod("extension");
      
      try {
        const status = await getProfileStatus();
        setNeedsProfileCompletion(!status.profileComplete);
      } catch {
        setNeedsProfileCompletion(!user.email);
      }
      
      await refreshUserStats();
      
      setIsLoading(false);
      return true;
    } catch (e: any) {
      setError(e.message || "Failed to connect with extension");
      setIsLoading(false);
      return false;
    }
  }, [refreshUserStats]);

  const connectWithBunker = useCallback(async (bunkerUrl: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      const bunkerPointer = await parseBunkerInput(bunkerUrl);
      if (!bunkerPointer) {
        setError("Invalid bunker URL. Please check your connection string from nsec.app.");
        setIsLoading(false);
        return false;
      }

      const localSecretKey = generateSecretKey();
      
      const pool = new SimplePool();
      poolRef.current = pool;
      
      const signer = BunkerSigner.fromBunker(localSecretKey, bunkerPointer, { pool });
      
      await signer.connect();
      bunkerSignerRef.current = signer;
      
      const pubkey = await signer.getPublicKey();
      const npub = nip19.npubEncode(pubkey);
      
      const user = await loginWithNostr(pubkey, {
        name: localStorage.getItem("nostr_name") || undefined,
        picture: localStorage.getItem("nostr_picture") || undefined,
      });
      
      const sessionData = {
        localSecretKey: bytesToHex(localSecretKey),
        remotePubkey: bunkerPointer.pubkey,
        relays: bunkerPointer.relays,
        secret: bunkerPointer.secret || "",
      };
      localStorage.setItem("nostr_bunker_session", JSON.stringify(sessionData));
      localStorage.setItem("nostr_pubkey", pubkey);
      localStorage.setItem("nostr_login_method", "bunker");
      localStorage.setItem("nostr_user_id", user.id);
      
      setProfile({
        npub,
        pubkey,
        userId: user.id,
        name: user.name,
        picture: user.avatar,
      });
      setIsConnected(true);
      setLoginMethod("bunker");
      
      try {
        const status = await getProfileStatus();
        setNeedsProfileCompletion(!status.profileComplete);
      } catch {
        setNeedsProfileCompletion(!user.email);
      }
      
      await refreshUserStats();
      
      setIsLoading(false);
      return true;
    } catch (e: any) {
      console.error("Bunker connection error:", e);
      setError(e.message || "Failed to connect with bunker. Please try again.");
      setIsLoading(false);
      return false;
    }
  }, [refreshUserStats]);

  const connectWithEmail = useCallback(async (email: string, password: string, twoFactorCode?: string): Promise<{ success: boolean; requires2FA?: boolean }> => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await apiLogin(email, password, twoFactorCode);

      if (result.requires2FA) {
        setIsLoading(false);
        return { success: false, requires2FA: true };
      }

      localStorage.setItem("auth_token", result.token);
      localStorage.setItem("nostr_login_method", "email");
      if (result.user.id) localStorage.setItem("nostr_user_id", result.user.id);

      setProfile({
        npub: result.user.nostrPubkey ? nip19.npubEncode(result.user.nostrPubkey) : "",
        pubkey: result.user.nostrPubkey || "",
        userId: result.user.id,
        name: result.user.name || result.user.username,
        picture: result.user.avatar || undefined,
      });
      setIsConnected(true);
      setLoginMethod("email");
      setNeedsProfileCompletion(false);
      await refreshUserStats();

      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setError(e.message || "Failed to login");
      setIsLoading(false);
      return { success: false };
    }
  }, [refreshUserStats]);

  const registerWithEmail = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await apiRegister(email, password, name);

      localStorage.setItem("auth_token", result.token);
      localStorage.setItem("nostr_login_method", "email");
      if (result.user.id) localStorage.setItem("nostr_user_id", result.user.id);

      setProfile({
        npub: "",
        pubkey: "",
        userId: result.user.id,
        name: result.user.name || result.user.username,
        picture: result.user.avatar || undefined,
      });
      setIsConnected(true);
      setLoginMethod("email");
      setNeedsProfileCompletion(false);
      await refreshUserStats();

      setIsLoading(false);
      return true;
    } catch (e: any) {
      setError(e.message || "Failed to register");
      setIsLoading(false);
      return false;
    }
  }, [refreshUserStats]);

  const disconnect = useCallback(() => {
    if (bunkerSignerRef.current) {
      bunkerSignerRef.current.close();
      bunkerSignerRef.current = null;
    }
    if (poolRef.current) {
      poolRef.current.close([]);
      poolRef.current = null;
    }
    
    localStorage.removeItem("nostr_pubkey");
    localStorage.removeItem("nostr_login_method");
    localStorage.removeItem("nostr_name");
    localStorage.removeItem("nostr_picture");
    localStorage.removeItem("nostr_user_id");
    localStorage.removeItem("nostr_bunker_session");
    localStorage.removeItem("auth_token");
    setProfile(null);
    setUserStats(null);
    setIsConnected(false);
    setLoginMethod(null);
    setError(null);
  }, []);

  const signEvent = useCallback(async (event: any) => {
    if (bunkerSignerRef.current) {
      return bunkerSignerRef.current.signEvent(event);
    }
    if (window.nostr) {
      return window.nostr.signEvent(event);
    }
    throw new Error("No Nostr signer available");
  }, []);

  const markProfileComplete = useCallback(() => {
    setNeedsProfileCompletion(false);
  }, []);

  const isAdmin = profile?.npub === import.meta.env.VITE_ADMIN_NPUB;

  return (
    <NostrContext.Provider
      value={{
        isConnected,
        isLoading,
        profile,
        userStats,
        loginMethod,
        error,
        connectWithExtension,
        connectWithBunker,
        connectWithEmail,
        registerWithEmail,
        disconnect,
        signEvent,
        isAdmin,
        needsProfileCompletion,
        markProfileComplete,
        refreshUserStats,
        emailKeyPair,
      }}
    >
      {children}
    </NostrContext.Provider>
  );
}

export function useNostr() {
  const context = useContext(NostrContext);
  if (context === undefined) {
    throw new Error("useNostr must be used within a NostrProvider");
  }
  return context;
}
