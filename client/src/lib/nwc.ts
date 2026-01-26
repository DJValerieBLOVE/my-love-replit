import { generateSecretKey, getPublicKey, nip04, finalizeEvent, SimplePool, type Filter } from "nostr-tools";

export interface NWCConnection {
  walletPubkey: string;
  relay: string;
  secret: string;
  lud16?: string;
}

export interface NWCInfo {
  alias?: string;
  color?: string;
  pubkey?: string;
  network?: string;
  block_height?: number;
  methods?: string[];
}

export interface NWCBalance {
  balance: number;
}

export interface NWCInvoice {
  type: string;
  invoice: string;
  description?: string;
  description_hash?: string;
  preimage?: string;
  payment_hash: string;
  amount: number;
  fees_paid?: number;
  created_at: number;
  expires_at?: number;
  settled_at?: number;
}

const NWC_STORAGE_KEY = "nwc_connection";

export function parseNWCUri(uri: string): NWCConnection | null {
  try {
    const url = new URL(uri.replace("nostr+walletconnect://", "https://"));
    const walletPubkey = url.hostname || url.pathname.replace("//", "");
    const relay = url.searchParams.get("relay");
    const secret = url.searchParams.get("secret");
    const lud16 = url.searchParams.get("lud16") || undefined;
    
    if (!walletPubkey || !relay || !secret) {
      console.error("Missing required NWC URI parameters");
      return null;
    }
    
    return { walletPubkey, relay, secret, lud16 };
  } catch (e) {
    console.error("Failed to parse NWC URI:", e);
    return null;
  }
}

export function saveNWCConnection(connection: NWCConnection): void {
  localStorage.setItem(NWC_STORAGE_KEY, JSON.stringify(connection));
}

export function loadNWCConnection(): NWCConnection | null {
  const stored = localStorage.getItem(NWC_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearNWCConnection(): void {
  localStorage.removeItem(NWC_STORAGE_KEY);
}

export function isNWCConnected(): boolean {
  return loadNWCConnection() !== null;
}

async function sendNWCRequest(
  connection: NWCConnection,
  method: string,
  params: Record<string, any> = {}
): Promise<any> {
  const pool = new SimplePool();
  
  try {
    const secretKey = Uint8Array.from(Buffer.from(connection.secret, "hex"));
    const pubkey = getPublicKey(secretKey);
    
    const content = JSON.stringify({ method, params });
    const encrypted = await nip04.encrypt(secretKey, connection.walletPubkey, content);
    
    const requestEvent = finalizeEvent({
      kind: 23194,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", connection.walletPubkey]],
      content: encrypted,
    }, secretKey);
    
    await pool.publish([connection.relay], requestEvent);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pool.close([connection.relay]);
        reject(new Error("NWC request timeout"));
      }, 30000);
      
      const filters = [{
        kinds: [23195],
        authors: [connection.walletPubkey],
        "#e": [requestEvent.id],
      }];
      
      // @ts-ignore - nostr-tools typing issue with tag filters
      const sub = pool.subscribeMany(
        [connection.relay],
        filters,
        {
          onevent: async (event) => {
            try {
              const decrypted = await nip04.decrypt(secretKey, connection.walletPubkey, event.content);
              const response = JSON.parse(decrypted);
              clearTimeout(timeout);
              sub.close();
              pool.close([connection.relay]);
              
              if (response.error) {
                reject(new Error(response.error.message || "NWC error"));
              } else {
                resolve(response.result);
              }
            } catch (e) {
              clearTimeout(timeout);
              sub.close();
              pool.close([connection.relay]);
              reject(e);
            }
          },
        }
      );
    });
  } catch (e) {
    pool.close([connection.relay]);
    throw e;
  }
}

export async function getWalletInfo(connection: NWCConnection): Promise<NWCInfo> {
  return sendNWCRequest(connection, "get_info");
}

export async function getWalletBalance(connection: NWCConnection): Promise<NWCBalance> {
  return sendNWCRequest(connection, "get_balance");
}

export async function makeInvoice(
  connection: NWCConnection,
  amount: number,
  description?: string
): Promise<NWCInvoice> {
  return sendNWCRequest(connection, "make_invoice", {
    amount: amount * 1000,
    description: description || "Receive sats",
  });
}

export async function payInvoice(
  connection: NWCConnection,
  invoice: string
): Promise<{ preimage: string }> {
  return sendNWCRequest(connection, "pay_invoice", { invoice });
}

export async function lookupInvoice(
  connection: NWCConnection,
  paymentHash: string
): Promise<NWCInvoice> {
  return sendNWCRequest(connection, "lookup_invoice", { payment_hash: paymentHash });
}

export interface LNURLPayInfo {
  callback: string;
  minSendable: number;
  maxSendable: number;
  metadata: string;
  tag: string;
  allowsNostr?: boolean;
  nostrPubkey?: string;
}

export interface LNURLPayResult {
  pr: string;
  routes?: any[];
  successAction?: {
    tag: string;
    message?: string;
    url?: string;
  };
}

export function lud16ToUrl(lud16: string): string | null {
  const [name, domain] = lud16.split("@");
  if (!name || !domain) return null;
  return `https://${domain}/.well-known/lnurlp/${name}`;
}

export async function fetchLNURLPayInfo(lud16: string): Promise<LNURLPayInfo> {
  const url = lud16ToUrl(lud16);
  if (!url) {
    throw new Error("Invalid Lightning address format");
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch Lightning address info");
  }
  
  const data = await response.json();
  if (data.status === "ERROR") {
    throw new Error(data.reason || "LNURL error");
  }
  
  return data as LNURLPayInfo;
}

export async function getInvoiceFromLNURL(
  lnurlPayInfo: LNURLPayInfo,
  amountSats: number,
  comment?: string
): Promise<string> {
  const amountMsat = amountSats * 1000;
  
  if (amountMsat < lnurlPayInfo.minSendable || amountMsat > lnurlPayInfo.maxSendable) {
    throw new Error(`Amount must be between ${lnurlPayInfo.minSendable / 1000} and ${lnurlPayInfo.maxSendable / 1000} sats`);
  }
  
  const url = new URL(lnurlPayInfo.callback);
  url.searchParams.set("amount", amountMsat.toString());
  if (comment) {
    url.searchParams.set("comment", comment);
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to get invoice from Lightning address");
  }
  
  const data: LNURLPayResult = await response.json();
  if (!data.pr) {
    throw new Error("No invoice returned from Lightning address");
  }
  
  return data.pr;
}

export async function zapViaLightning(
  connection: NWCConnection,
  recipientLud16: string,
  amountSats: number,
  comment?: string
): Promise<{ preimage: string; invoice: string }> {
  const lnurlInfo = await fetchLNURLPayInfo(recipientLud16);
  const invoice = await getInvoiceFromLNURL(lnurlInfo, amountSats, comment);
  const result = await payInvoice(connection, invoice);
  return { preimage: result.preimage, invoice };
}
