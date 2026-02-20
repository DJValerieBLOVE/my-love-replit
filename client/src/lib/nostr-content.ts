import { nip19 } from "nostr-tools";

const IMAGE_REGEX = /https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp|svg|bmp)(?:\?\S*)?/gi;
const VIDEO_REGEX = /https?:\/\/\S+\.(?:mp4|webm|mov|avi)(?:\?\S*)?/gi;
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

const GENERIC_URL_REGEX = /https?:\/\/\S+/gi;
const NOSTR_MENTION_REGEX = /nostr:(npub1[a-z0-9]+|nprofile1[a-z0-9]+)/g;

function isImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(lower)) return true;
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

export interface ParsedContent {
  text: string;
  images: string[];
  videos: string[];
  links: string[];
  mentions: NostrMention[];
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
  let mentionMatch;
  const mentionRegex = new RegExp(NOSTR_MENTION_REGEX.source, 'g');
  while ((mentionMatch = mentionRegex.exec(content)) !== null) {
    const bech32 = mentionMatch[1];
    const pubkey = decodeMentionPubkey(bech32);
    if (pubkey) {
      mentions.push({ original: mentionMatch[0], pubkey });
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

  return { text, images, videos, links, mentions };
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
