import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react";
import NDK, { NDKEvent, NDKFilter, NDKRelay, NDKRelaySet, NDKSubscription, NDKPrivateKeySigner, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { LAB_RELAY_URL, PUBLIC_RELAYS, getPublishRelays, NEVER_SHAREABLE_KINDS, canEverBeShared } from "@/lib/relays";
import { useNostr } from "@/contexts/nostr-context";
import { getSecretKeyBytes } from "@/lib/nostr-keygen";
import { bytesToHex } from "@noble/hashes/utils";

const USER_RELAYS_KEY = "lab-user-relays";

export function getUserRelays(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(USER_RELAYS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveUserRelays(relays: string[]) {
  try {
    localStorage.setItem(USER_RELAYS_KEY, JSON.stringify(relays));
  } catch {}
}

export function addUserRelay(url: string) {
  const current = getUserRelays();
  const normalized = url.endsWith('/') ? url.slice(0, -1) : url;
  if (!current.includes(normalized) && !current.includes(normalized + '/')) {
    current.push(normalized);
    saveUserRelays(current);
  }
}

export function removeUserRelay(url: string) {
  const normalized = url.endsWith('/') ? url.slice(0, -1) : url;
  const current = getUserRelays().filter(r => {
    const n = r.endsWith('/') ? r.slice(0, -1) : r;
    return n !== normalized;
  });
  saveUserRelays(current);
}

interface NDKContextType {
  ndk: NDK | null;
  isConnected: boolean;
  labRelay: NDKRelay | null;
  publishToLab: (event: NDKEvent) => Promise<void>;
  publishSmart: (event: NDKEvent, shareToPublic?: boolean) => Promise<void>;
  subscribe: (filter: NDKFilter, opts?: { closeOnEose?: boolean }) => NDKSubscription | null;
  fetchEvents: (filter: NDKFilter, relayUrls?: string[]) => Promise<NDKEvent[]>;
}

const NDKContext = createContext<NDKContextType | undefined>(undefined);

export function NDKProvider({ children }: { children: ReactNode }) {
  const { isConnected: nostrConnected, profile, loginMethod, emailKeyPair } = useNostr();
  const [ndk, setNdk] = useState<NDK | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [labRelay, setLabRelay] = useState<NDKRelay | null>(null);
  const ndkRef = useRef<NDK | null>(null);

  useEffect(() => {
    const userRelays = getUserRelays();
    const allRelays = [LAB_RELAY_URL, ...PUBLIC_RELAYS, ...userRelays];
    const uniqueRelays = Array.from(new Set(allRelays));
    console.log("[NDK] Initializing with relays:", uniqueRelays);

    let signer: NDKPrivateKeySigner | NDKNip07Signer | undefined;
    if (loginMethod === "email" && emailKeyPair?.nsec) {
      try {
        const skBytes = getSecretKeyBytes(emailKeyPair.nsec);
        const skHex = bytesToHex(skBytes);
        signer = new NDKPrivateKeySigner(skHex);
        console.log("[NDK] Created signer for email user");
      } catch (err) {
        console.error("[NDK] Failed to create signer from email keypair:", err);
      }
    } else if (loginMethod === "extension" && typeof window !== "undefined" && (window as any).nostr) {
      try {
        signer = new NDKNip07Signer();
        console.log("[NDK] Created NIP-07 signer for Nostr extension user");
      } catch (err) {
        console.error("[NDK] Failed to create NIP-07 signer:", err);
      }
    }

    const ndkInstance = new NDK({
      explicitRelayUrls: uniqueRelays,
      signer,
    });

    ndkRef.current = ndkInstance;
    setNdk(ndkInstance);

    ndkInstance.connect().then(() => {
      console.log("[NDK] connect() promise resolved");
    }).catch((err) => {
      console.error("[NDK] Connection error:", err);
    });

    const checkConnection = () => {
      if (!ndkRef.current) return;
      const relayStatuses: Record<string, number> = {};
      ndkRef.current.pool.relays.forEach((relay, url) => {
        relayStatuses[url] = relay.status;
      });
      console.log("[NDK] Relay statuses:", relayStatuses);
      const anyConnected = Array.from(ndkRef.current.pool.relays.values()).some(r => r.status === 5);
      if (anyConnected) {
        console.log("[NDK] At least one relay connected (status 5), setting isConnected=true");
        setIsConnected(true);
        const lab = ndkRef.current.pool.getRelay(LAB_RELAY_URL);
        if (lab && lab.status === 5) {
          setLabRelay(lab);
          console.log("[NDK] LAB relay connected");
        }
      }
    };

    const t1 = setTimeout(checkConnection, 2000);
    const t2 = setTimeout(checkConnection, 5000);
    const t3 = setTimeout(checkConnection, 10000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ndkInstance.pool.removeAllListeners();
    };
  }, [loginMethod, emailKeyPair]);

  const publishToLab = useCallback(async (event: NDKEvent) => {
    if (!ndkRef.current) throw new Error("NDK not initialized");

    event.ndk = ndkRef.current;
    const relaySet = NDKRelaySet.fromRelayUrls([LAB_RELAY_URL], ndkRef.current);
    await event.publish(relaySet);
  }, []);

  const publishSmart = useCallback(async (event: NDKEvent, shareToPublic: boolean = false) => {
    if (!ndkRef.current) throw new Error("NDK not initialized");

    event.ndk = ndkRef.current;

    const tags = event.tags || [];
    const kind = event.kind || 1;

    if (shareToPublic && NEVER_SHAREABLE_KINDS.includes(kind)) {
      console.error(`[NDK] BLOCKED: Kind ${kind} can NEVER be shared publicly.`);
      shareToPublic = false;
    }

    const relayUrls = getPublishRelays(kind, tags, shareToPublic && canEverBeShared(kind, tags));
    const relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndkRef.current);

    await event.publish(relaySet);
  }, []);

  const subscribe = useCallback((filter: NDKFilter, opts?: { closeOnEose?: boolean }): NDKSubscription | null => {
    if (!ndkRef.current) return null;

    return ndkRef.current.subscribe(filter, {
      closeOnEose: opts?.closeOnEose ?? true,
    });
  }, []);

  const fetchEvents = useCallback(async (filter: NDKFilter, relayUrls?: string[]): Promise<NDKEvent[]> => {
    if (!ndkRef.current) return [];

    let relaySet: NDKRelaySet | undefined;
    if (relayUrls) {
      relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndkRef.current);
    }

    const events = await ndkRef.current.fetchEvents(filter, undefined, relaySet);
    return Array.from(events);
  }, []);

  return (
    <NDKContext.Provider
      value={{
        ndk,
        isConnected,
        labRelay,
        publishToLab,
        publishSmart,
        subscribe,
        fetchEvents,
      }}
    >
      {children}
    </NDKContext.Provider>
  );
}

export function useNDK() {
  const context = useContext(NDKContext);
  if (context === undefined) {
    throw new Error("useNDK must be used within an NDKProvider");
  }
  return context;
}
