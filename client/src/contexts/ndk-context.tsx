import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react";
import NDK, { NDKEvent, NDKFilter, NDKRelay, NDKRelaySet, NDKSubscription, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { LAB_RELAY_URL, PUBLIC_RELAYS, getPublishRelays, NEVER_SHAREABLE_KINDS, canEverBeShared } from "@/lib/relays";
import { useNostr } from "@/contexts/nostr-context";
import { getSecretKeyBytes } from "@/lib/nostr-keygen";
import { bytesToHex } from "@noble/hashes/utils";

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
    const allRelays = [LAB_RELAY_URL, ...PUBLIC_RELAYS];

    let signer: NDKPrivateKeySigner | undefined;
    if (loginMethod === "email" && emailKeyPair?.nsec) {
      try {
        const skBytes = getSecretKeyBytes(emailKeyPair.nsec);
        const skHex = bytesToHex(skBytes);
        signer = new NDKPrivateKeySigner(skHex);
      } catch (err) {
        console.error("[NDK] Failed to create signer from email keypair:", err);
      }
    }

    const ndkInstance = new NDK({
      explicitRelayUrls: allRelays,
      signer,
    });

    ndkInstance.connect().then(() => {
      setIsConnected(true);
      const lab = ndkInstance.pool.getRelay(LAB_RELAY_URL);
      if (lab) {
        setLabRelay(lab);
      }
    }).catch((err) => {
      console.error("[NDK] Connection error:", err);
    });

    ndkRef.current = ndkInstance;
    setNdk(ndkInstance);

    return () => {
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
