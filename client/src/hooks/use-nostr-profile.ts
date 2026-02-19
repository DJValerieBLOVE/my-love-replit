import { useState, useEffect, useCallback, useRef } from "react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNDK } from "@/contexts/ndk-context";

export interface NostrMetadata {
  name?: string;
  display_name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string;
  banner?: string;
  website?: string;
}

export function useNostrProfile(pubkey: string | undefined) {
  const { fetchEvents, isConnected } = useNDK();
  const [nostrProfile, setNostrProfile] = useState<NostrMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchedPubkey = useRef<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!pubkey || !isConnected) return;

    setIsLoading(true);
    try {
      const events: NDKEvent[] = await fetchEvents({
        kinds: [0],
        authors: [pubkey],
      });

      if (events.length > 0) {
        const mostRecent = events.reduce((latest, event) =>
          (event.created_at ?? 0) > (latest.created_at ?? 0) ? event : latest
        );

        const parsed = JSON.parse(mostRecent.content);
        const metadata: NostrMetadata = {
          name: parsed.name,
          display_name: parsed.display_name,
          picture: parsed.picture,
          about: parsed.about,
          nip05: parsed.nip05,
          lud16: parsed.lud16,
          banner: parsed.banner,
          website: parsed.website,
        };
        setNostrProfile(metadata);
      }
    } catch (err) {
      console.error("[useNostrProfile] Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pubkey, isConnected, fetchEvents]);

  useEffect(() => {
    if (!pubkey || !isConnected) {
      if (!pubkey && nostrProfile) {
        setNostrProfile(null);
        lastFetchedPubkey.current = null;
      }
      return;
    }
    if (lastFetchedPubkey.current === pubkey) return;

    lastFetchedPubkey.current = pubkey;
    fetchProfile();
  }, [pubkey, isConnected, fetchProfile]);

  const refresh = useCallback(() => {
    lastFetchedPubkey.current = null;
    fetchProfile();
  }, [fetchProfile]);

  return { nostrProfile, isLoading, refresh };
}
