const LAB_RELAY_URL = 'wss://nostr-rs-relay-production-1569.up.railway.app';

const PUBLIC_RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
];

const ADMIN_PUBKEY = '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767';

const NEVER_SHAREABLE_KINDS = [
  9,
  11,
  12,
  1059,
  1060,
];

const PRIVATE_BY_DEFAULT_KINDS = [
  30078,
  30023,
  4,
];

const SHAREABLE_KINDS = [
  0,
  1,
  3,
  7,
  10002,
];

const PRIVATE_TAGS = [
  'journal',
  'lab-note',
  'big-dreams',
  'daily-practice',
  'experiment-progress',
  'magic-mentor',
  'tribe-message',
  'group-chat',
];

function canEverBeShared(kind: number, tags: string[][]): boolean {
  if (NEVER_SHAREABLE_KINDS.includes(kind)) {
    return false;
  }

  const hasTribeTag = tags.some(([name, value]) =>
    (name === 't' && (value === 'tribe-message' || value === 'group-chat')) ||
    (name === 'h')
  );

  if (hasTribeTag) {
    return false;
  }

  return true;
}

function requiresShareWarning(kind: number, tags: string[][]): boolean {
  if (PRIVATE_BY_DEFAULT_KINDS.includes(kind)) {
    return true;
  }

  const hasPrivateTag = tags.some(([name, value]) =>
    (name === 't' && PRIVATE_TAGS.includes(value || '')) ||
    (name === 'd' && value?.startsWith('lab-')) ||
    (name === 'd' && value?.startsWith('journal-')) ||
    (name === 'd' && value?.startsWith('progress-')) ||
    (name === 'd' && value?.startsWith('big-dreams-'))
  );

  return hasPrivateTag;
}

function shouldPublishToPublic(kind: number, tags: string[][]): boolean {
  if (!canEverBeShared(kind, tags)) {
    return false;
  }

  const hasLabTag = tags.some(([name, value]) =>
    (name === 't' && PRIVATE_TAGS.includes(value || '')) ||
    (name === 'd' && value?.startsWith('lab-')) ||
    (name === 'd' && value?.startsWith('journal-')) ||
    (name === 'd' && value?.startsWith('progress-'))
  );

  if (hasLabTag) {
    return false;
  }

  return SHAREABLE_KINDS.includes(kind);
}

function getPublishRelays(
  kind: number,
  tags: string[][],
  userWantsPublic: boolean = false
): string[] {
  const relays: string[] = [LAB_RELAY_URL];

  if (userWantsPublic && shouldPublishToPublic(kind, tags)) {
    relays.push(...PUBLIC_RELAYS);
  }

  return relays;
}

export {
  LAB_RELAY_URL,
  PUBLIC_RELAYS,
  ADMIN_PUBKEY,
  NEVER_SHAREABLE_KINDS,
  PRIVATE_BY_DEFAULT_KINDS,
  SHAREABLE_KINDS,
  PRIVATE_TAGS,
  canEverBeShared,
  requiresShareWarning,
  shouldPublishToPublic,
  getPublishRelays,
};
