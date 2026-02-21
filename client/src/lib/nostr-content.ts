import { nip19 } from "nostr-tools";

const NOSTR_IMAGE_HOSTS = [
  'nostr.build',
  'image.nostr.build',
  'i.nostr.build',
  'blossom.primal.net',
  'cdn.nostr.build',
  'void.cat',
  'imgprxy.iris.to',
  'media.snort.social',
  'nosta.me',
];

const GENERIC_URL_REGEX = /(?:https?:\/\/\S+|\/uploads\/\S+)/gi;
const NOSTR_ENTITY_REGEX = /nostr:(npub1[a-z0-9]+|nprofile1[a-z0-9]+|nevent1[a-z0-9]+|note1[a-z0-9]+|naddr1[a-z0-9]+)/g;

function isImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(lower)) return true;
  if (lower.startsWith('/uploads/')) return true;
  for (const host of NOSTR_IMAGE_HOSTS) {
    if (lower.includes(host) && !lower.endsWith('.mp4') && !lower.endsWith('.webm')) return true;
  }
  return false;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url.toLowerCase());
}

export type NostrMention = {
  original: string;
  pubkey: string;
  displayName?: string;
};

export type NostrEntity = {
  original: string;
  type: "npub" | "nprofile" | "nevent" | "note" | "naddr";
  pubkey?: string;
  eventId?: string;
  bech32: string;
};

export interface ParsedContent {
  text: string;
  images: string[];
  videos: string[];
  links: string[];
  mentions: NostrMention[];
  entities: NostrEntity[];
}

export function decodeNostrEntity(bech32: string): NostrEntity | null {
  try {
    const decoded = nip19.decode(bech32);
    if (decoded.type === "npub") {
      return { original: `nostr:${bech32}`, type: "npub", pubkey: decoded.data as string, bech32 };
    }
    if (decoded.type === "nprofile") {
      return { original: `nostr:${bech32}`, type: "nprofile", pubkey: (decoded.data as { pubkey: string }).pubkey, bech32 };
    }
    if (decoded.type === "nevent") {
      const data = decoded.data as { id: string; author?: string };
      return { original: `nostr:${bech32}`, type: "nevent", eventId: data.id, pubkey: data.author, bech32 };
    }
    if (decoded.type === "note") {
      return { original: `nostr:${bech32}`, type: "note", eventId: decoded.data as string, bech32 };
    }
    if (decoded.type === "naddr") {
      const data = decoded.data as { pubkey: string };
      return { original: `nostr:${bech32}`, type: "naddr", pubkey: data.pubkey, bech32 };
    }
  } catch {}
  return null;
}

export function decodeMentionPubkey(bech32: string): string | null {
  try {
    const decoded = nip19.decode(bech32);
    if (decoded.type === "npub") {
      return decoded.data as string;
    }
    if (decoded.type === "nprofile") {
      return (decoded.data as { pubkey: string }).pubkey;
    }
  } catch {}
  return null;
}

export function parseNostrContent(content: string): ParsedContent {
  const allUrls = content.match(GENERIC_URL_REGEX) || [];
  const images: string[] = [];
  const videos: string[] = [];
  const links: string[] = [];

  for (const url of allUrls) {
    const cleanUrl = url.replace(/[)}\]]+$/, '');
    if (isImageUrl(cleanUrl)) {
      if (!images.includes(cleanUrl)) images.push(cleanUrl);
    } else if (isVideoUrl(cleanUrl)) {
      if (!videos.includes(cleanUrl)) videos.push(cleanUrl);
    } else {
      if (!links.includes(cleanUrl)) links.push(cleanUrl);
    }
  }

  const mentions: NostrMention[] = [];
  const entities: NostrEntity[] = [];
  let entityMatch;
  const entityRegex = new RegExp(NOSTR_ENTITY_REGEX.source, 'g');
  while ((entityMatch = entityRegex.exec(content)) !== null) {
    const bech32 = entityMatch[1];
    const entity = decodeNostrEntity(bech32);
    if (entity) {
      entities.push(entity);
      if (entity.type === "npub" || entity.type === "nprofile") {
        mentions.push({ original: entity.original, pubkey: entity.pubkey! });
      }
    }
  }

  let text = content;
  for (const img of images) {
    text = text.replace(img, '').trim();
  }
  for (const vid of videos) {
    text = text.replace(vid, '').trim();
  }

  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return { text, images, videos, links, mentions, entities };
}

export function resolveContentMentions(
  text: string,
  mentions: NostrMention[],
  profileLookup?: Map<string, { name?: string; display_name?: string }>
): string {
  let resolved = text;
  for (const mention of mentions) {
    let displayName = "";
    if (profileLookup) {
      const profile = profileLookup.get(mention.pubkey);
      if (profile) {
        displayName = profile.display_name || profile.name || "";
      }
    }
    if (!displayName) {
      displayName = mention.pubkey.slice(0, 8);
    }
    while (resolved.includes(mention.original)) {
      resolved = resolved.replace(mention.original, `@${displayName}`);
    }
  }
  return resolved;
}

export function truncateNpub(handle: string): string {
  if (handle.startsWith('@npub')) {
    return `@${handle.slice(1, 9)}...${handle.slice(-4)}`;
  }
  if (handle.length > 30) {
    return `${handle.slice(0, 15)}...`;
  }
  return handle;
}

export function formatDisplayName(name: string, pubkey?: string): string {
  if (name && name !== pubkey?.slice(0, 8) + '...' && name.length > 0) {
    return name;
  }
  if (pubkey) {
    return `${pubkey.slice(0, 8)}...`;
  }
  return name || 'Anonymous';
}
