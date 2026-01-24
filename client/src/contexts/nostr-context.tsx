import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { nip19 } from "nostr-tools";

interface NostrProfile {
  npub: string;
  pubkey: string;
  name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string;
}

interface NostrContextType {
  isConnected: boolean;
  isLoading: boolean;
  profile: NostrProfile | null;
  loginMethod: "extension" | "bunker" | "ncryptsec" | null;
  error: string | null;
  connectWithExtension: () => Promise<boolean>;
  disconnect: () => void;
  signEvent: (event: any) => Promise<any>;
  isAdmin: boolean;
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
    };
  }
}

export function NostrProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<NostrProfile | null>(null);
  const [loginMethod, setLoginMethod] = useState<"extension" | "bunker" | "ncryptsec" | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          }
        } catch (e) {
          localStorage.removeItem("nostr_pubkey");
          localStorage.removeItem("nostr_login_method");
        }
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkExtension, 100);
    return () => clearTimeout(timer);
  }, [checkExtension]);

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
      
      localStorage.setItem("nostr_pubkey", pubkey);
      localStorage.setItem("nostr_login_method", "extension");
      
      setProfile({
        npub,
        pubkey,
      });
      setIsConnected(true);
      setLoginMethod("extension");
      setIsLoading(false);
      return true;
    } catch (e: any) {
      setError(e.message || "Failed to connect with extension");
      setIsLoading(false);
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem("nostr_pubkey");
    localStorage.removeItem("nostr_login_method");
    localStorage.removeItem("nostr_name");
    localStorage.removeItem("nostr_picture");
    setProfile(null);
    setIsConnected(false);
    setLoginMethod(null);
    setError(null);
  }, []);

  const signEvent = useCallback(async (event: any) => {
    if (!window.nostr) {
      throw new Error("No Nostr extension available");
    }
    return window.nostr.signEvent(event);
  }, []);

  const isAdmin = profile?.npub === import.meta.env.VITE_ADMIN_NPUB;

  return (
    <NostrContext.Provider
      value={{
        isConnected,
        isLoading,
        profile,
        loginMethod,
        error,
        connectWithExtension,
        disconnect,
        signEvent,
        isAdmin,
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
