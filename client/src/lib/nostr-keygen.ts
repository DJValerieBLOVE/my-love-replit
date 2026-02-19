import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

const STORAGE_KEY = "mymasterpiece_nostr_keys";

interface StoredKeyPair {
  pubkey: string;
  nsec: string;
  npub: string;
}

export function generateNostrKeyPair(): StoredKeyPair {
  const sk = generateSecretKey();
  const pubkey = getPublicKey(sk);
  const nsec = nip19.nsecEncode(sk);
  const npub = nip19.npubEncode(pubkey);
  return { pubkey, nsec, npub };
}

export function saveKeyPairToStorage(keyPair: StoredKeyPair): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keyPair));
  } catch (e) {
    console.error("[NostrKeygen] Failed to save keys:", e);
  }
}

export function loadKeyPairFromStorage(): StoredKeyPair | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StoredKeyPair;
  } catch (e) {
    console.error("[NostrKeygen] Failed to load keys:", e);
    return null;
  }
}

export function clearKeyPairFromStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getOrCreateKeyPair(): StoredKeyPair {
  const existing = loadKeyPairFromStorage();
  if (existing) return existing;

  const newPair = generateNostrKeyPair();
  saveKeyPairToStorage(newPair);
  return newPair;
}

export function getSecretKeyBytes(nsec: string): Uint8Array {
  const decoded = nip19.decode(nsec);
  if (decoded.type !== "nsec") {
    throw new Error("Invalid nsec");
  }
  return decoded.data as Uint8Array;
}

export function hasStoredKeys(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
