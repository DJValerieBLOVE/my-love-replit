export interface ShareablePost {
  source?: "nostr" | "community" | "learning";
  isOwnPost?: boolean;
  community?: string;
}

export function isGroupContent(post: ShareablePost): boolean {
  return post.source === "community" || post.source === "learning";
}

export function canSharePublicly(post: ShareablePost): boolean {
  const isGroup = isGroupContent(post);
  if (!isGroup) return true;
  return post.isOwnPost === true;
}

export function getGroupName(post: ShareablePost): string {
  return post.community || "the group";
}
