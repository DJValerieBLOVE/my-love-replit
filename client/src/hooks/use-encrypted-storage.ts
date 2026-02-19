import { useCallback } from 'react';
import { useNostr } from '@/contexts/nostr-context';

interface EncryptedStorageResult {
  encrypt: (data: unknown) => Promise<string>;
  decrypt: (encryptedData: string) => Promise<unknown>;
  isAvailable: boolean;
  isLoggedIn: boolean;
  error: string | null;
}

function checkNip44Available(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!(window.nostr?.nip44);
  } catch {
    return false;
  }
}

function useEncryptedStorage(): EncryptedStorageResult {
  const { isConnected, profile } = useNostr();

  const isLoggedIn = isConnected && !!profile;
  const nip44Available = checkNip44Available();
  const nip04Available = !!(window.nostr?.nip04);
  const isAvailable = nip44Available || nip04Available;

  const error = !isLoggedIn
    ? 'Not logged in'
    : !isAvailable
      ? 'NIP-44 encryption not available — data stored as plaintext on private relay'
      : null;

  const encrypt = useCallback(async (data: unknown): Promise<string> => {
    const jsonString = JSON.stringify(data);

    if (!isLoggedIn || !profile) {
      return jsonString;
    }

    if (nip44Available && window.nostr?.nip44) {
      try {
        const encrypted = await window.nostr.nip44.encrypt(profile.pubkey, jsonString);
        return encrypted;
      } catch {
        console.warn('[useEncryptedStorage] NIP-44 encrypt failed, trying NIP-04');
      }
    }

    if (nip04Available && window.nostr?.nip04) {
      try {
        const encrypted = await window.nostr.nip04.encrypt(profile.pubkey, jsonString);
        return encrypted;
      } catch {
        console.warn('[useEncryptedStorage] NIP-04 encrypt failed, storing as plaintext');
      }
    }

    return jsonString;
  }, [isLoggedIn, profile, nip44Available, nip04Available]);

  const decrypt = useCallback(async (encryptedData: string): Promise<unknown> => {
    try {
      return JSON.parse(encryptedData);
    } catch {
      // not valid JSON — assume encrypted
    }

    if (!isLoggedIn || !profile) {
      throw new Error('Content appears encrypted but decryption is not available');
    }

    if (nip44Available && window.nostr?.nip44) {
      try {
        const decrypted = await window.nostr.nip44.decrypt(profile.pubkey, encryptedData);
        return JSON.parse(decrypted);
      } catch {
        // try NIP-04 fallback
      }
    }

    if (nip04Available && window.nostr?.nip04) {
      try {
        const decrypted = await window.nostr.nip04.decrypt(profile.pubkey, encryptedData);
        return JSON.parse(decrypted);
      } catch (err) {
        throw new Error(`Failed to decrypt content: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    throw new Error('No decryption method available');
  }, [isLoggedIn, profile, nip44Available, nip04Available]);

  return {
    encrypt,
    decrypt,
    isAvailable,
    isLoggedIn,
    error,
  };
}

function isEncrypted(content: string): boolean {
  try {
    JSON.parse(content);
    return false;
  } catch {
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    return base64Regex.test(content.replace(/\s/g, ''));
  }
}

export { useEncryptedStorage, isEncrypted };
export type { EncryptedStorageResult };
