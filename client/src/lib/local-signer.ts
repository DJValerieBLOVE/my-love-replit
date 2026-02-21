import { nip19, getPublicKey, finalizeEvent, verifyEvent } from "nostr-tools";
import { encrypt as nip04Enc, decrypt as nip04Dec } from "nostr-tools/nip04";
import { encrypt as nip44Enc, decrypt as nip44Dec, getConversationKey } from "nostr-tools/nip44";
import { hexToBytes } from "@noble/hashes/utils";

const NSEC_STORAGE_KEY = "mymasterpiece_nsec";

export function storeNsec(nsec: string): void {
  localStorage.setItem(NSEC_STORAGE_KEY, nsec);
}

export function readStoredNsec(): string | undefined {
  return localStorage.getItem(NSEC_STORAGE_KEY) || undefined;
}

export function clearStoredNsec(): void {
  localStorage.removeItem(NSEC_STORAGE_KEY);
}

function getSecretKey(nsecOrHex?: string): Uint8Array {
  const sec = nsecOrHex || readStoredNsec();
  if (!sec) throw new Error("No nsec available");

  if (sec.startsWith("nsec1")) {
    const decoded = nip19.decode(sec);
    if (decoded.type !== "nsec" || !decoded.data) {
      throw new Error("Invalid nsec");
    }
    return decoded.data as Uint8Array;
  }

  return hexToBytes(sec);
}

export function getPublicKeyFromNsec(nsec: string): string {
  const sk = getSecretKey(nsec);
  return getPublicKey(sk);
}

export function createLocalSigner(nsecOrHex?: string) {
  const getPublicKeyFn = async (): Promise<string> => {
    const sk = getSecretKey(nsecOrHex);
    return getPublicKey(sk);
  };

  const signEvent = async (event: any): Promise<any> => {
    const sk = getSecretKey(nsecOrHex);
    const evt = finalizeEvent({ ...event }, sk);
    const isVerified = verifyEvent(evt);
    if (!isVerified) throw new Error("Event signature verification failed");
    return evt;
  };

  const nip04Encrypt = async (pubkey: string, plaintext: string): Promise<string> => {
    const sk = getSecretKey(nsecOrHex);
    return nip04Enc(sk, pubkey, plaintext);
  };

  const nip04Decrypt = async (pubkey: string, ciphertext: string): Promise<string> => {
    const sk = getSecretKey(nsecOrHex);
    return nip04Dec(sk, pubkey, ciphertext);
  };

  const nip44Encrypt = async (pubkey: string, plaintext: string): Promise<string> => {
    const sk = getSecretKey(nsecOrHex);
    const key = getConversationKey(sk, pubkey);
    return nip44Enc(plaintext, key);
  };

  const nip44Decrypt = async (pubkey: string, ciphertext: string): Promise<string> => {
    const sk = getSecretKey(nsecOrHex);
    const key = getConversationKey(sk, pubkey);
    return nip44Dec(ciphertext, key);
  };

  return {
    getPublicKey: getPublicKeyFn,
    signEvent,
    nip04: {
      encrypt: nip04Encrypt,
      decrypt: nip04Decrypt,
    },
    nip44: {
      encrypt: nip44Encrypt,
      decrypt: nip44Decrypt,
    },
  };
}
