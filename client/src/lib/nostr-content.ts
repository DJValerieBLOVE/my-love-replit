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

export interface ParsedContent {
  text: string;
  images: string[];
  videos: string[];
  links: string[];
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

  let text = content;
  for (const img of images) {
    text = text.replace(img, '').trim();
  }
  for (const vid of videos) {
    text = text.replace(vid, '').trim();
  }

  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return { text, images, videos, links };
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
