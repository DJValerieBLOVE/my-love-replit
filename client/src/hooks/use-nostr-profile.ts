import { useState, useEffect, useCallback, useRef } from "react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNDK } from "@/contexts/ndk-context";
import { fetchPrimalUserStats, type PrimalUserStats } from "@/lib/primal-cache";

export interface NostrMetadata {
  name?: string;
  display_name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string;
  banner?: string;
  website?: string;
  location?: string;
  following_count?: number;
  followers_count?: number;
  note_count?: number;
  reply_count?: number;
  media_count?: number;
  total_zap_count?: number;
  relay_count?: number;
  time_joined?: number;
  long_form_note_count?: number;
  total_satszapped?: number;
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

      let metadata: NostrMetadata = {};

      if (events.length > 0) {
        const mostRecent = events.reduce((latest, event) =>
          (event.created_at ?? 0) > (latest.created_at ?? 0) ? event : latest
        );

        const parsed = JSON.parse(mostRecent.content);
        metadata = {
          name: parsed.name,
          display_name: parsed.display_name,
          picture: parsed.picture,
          about: parsed.about,
          nip05: parsed.nip05,
          lud16: parsed.lud16,
          banner: parsed.banner,
          website: parsed.website,
          location: parsed.location,
        };
      }

      setNostrProfile(metadata);

      try {
        const stats = await fetchPrimalUserStats(pubkey);
        setNostrProfile(prev => ({
          ...prev,
          following_count: stats.following_count,
          followers_count: stats.followers_count,
          note_count: stats.note_count,
          reply_count: stats.reply_count,
          media_count: stats.media_count,
          total_zap_count: stats.total_zap_count,
          relay_count: stats.relay_count,
          time_joined: stats.time_joined,
          long_form_note_count: stats.long_form_note_count,
          total_satszapped: stats.total_satszapped,
        }));
      } catch (err) {
        console.error("[useNostrProfile] Error fetching social counts:", err);
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
