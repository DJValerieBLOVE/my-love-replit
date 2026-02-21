const DEFAULT_CACHE_URL = "wss://cache2.primal.net/v1";

const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const CACHE_TTL_MS = 60000;
const STALE_TTL_MS = 300000;
const CONNECTION_TIMEOUT_MS = 10000;
const REQUEST_TIMEOUT_MS = 10000;
const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

type PrimalEvent = {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
};

type PrimalProfile = {
  pubkey: string;
  name: string;
  display_name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string;
};

type PrimalEventStats = {
  likes: number;
  replies: number;
  reposts: number;
  zaps: number;
  zapAmount: number;
};

type ZapReceipt = {
  zapperPubkey: string;
  amount: number;
  eventId: string;
};

type PrimalFeedResult = {
  events: PrimalEvent[];
  profiles: Map<string, PrimalProfile>;
  stats: Map<string, PrimalEventStats>;
  zapReceipts: Map<string, ZapReceipt[]>;
};

type ExploreMode = "trending" | "most_zapped" | "media" | "latest";

type PendingRequest = {
  subId: string;
  messages: any[];
  resolve: (messages: any[]) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
};

type CacheEntry = {
  result: PrimalFeedResult;
  timestamp: number;
};

function generateSubId(): string {
  return Math.random().toString(36).substring(2, 14);
}

function getCacheUrl(): string {
  try {
    return localStorage.getItem("lab-cache-service") || DEFAULT_CACHE_URL;
  } catch {
    return DEFAULT_CACHE_URL;
  }
}

function isEnhancedPrivacyEnabled(): boolean {
  try {
    return localStorage.getItem("lab-enhanced-privacy") === "true";
  } catch {
    return false;
  }
}

function extractBolt11Amount(bolt11: string): number {
  const match = bolt11.match(/ln(?:bc|tb|tbs)(\d+)([munp]?)/i);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const unit = match[2]?.toLowerCase() || '';
  switch (unit) {
    case '': return num * 100_000_000;
    case 'm': return num * 100_000;
    case 'u': return num * 100;
    case 'n': return Math.round(num * 0.1);
    case 'p': return Math.round(num * 0.0001);
    default: return 0;
  }
}

function parsePrimalResponse(messages: any[]): PrimalFeedResult {
  const events: PrimalEvent[] = [];
  const profiles = new Map<string, PrimalProfile>();
  const stats = new Map<string, PrimalEventStats>();
  const zapReceipts = new Map<string, ZapReceipt[]>();

  for (const msg of messages) {
    if (!Array.isArray(msg)) continue;
    const [type, , eventData] = msg;

    if (type === "EVENT" && eventData) {
      if (eventData.kind === 0) {
        try {
          const meta = JSON.parse(eventData.content);
          profiles.set(eventData.pubkey, {
            pubkey: eventData.pubkey,
            name: meta.name || "",
            display_name: meta.display_name || meta.name || "",
            picture: meta.picture || "",
            about: meta.about || "",
            nip05: meta.nip05 || "",
            lud16: meta.lud16 || "",
          });
        } catch {}
      } else if (eventData.kind === 1) {
        events.push(eventData);
      } else if (eventData.kind === 9735) {
        try {
          const eTags = eventData.tags?.filter((t: string[]) => t[0] === "e");
          const descTag = eventData.tags?.find((t: string[]) => t[0] === "description");
          const bolt11Tag = eventData.tags?.find((t: string[]) => t[0] === "bolt11");

          if (eTags?.length > 0 && descTag) {
            const zapRequest = JSON.parse(descTag[1]);
            const zapperPubkey = zapRequest.pubkey;
            let amount = 0;

            if (bolt11Tag) {
              amount = extractBolt11Amount(bolt11Tag[1]);
            }
            if (amount === 0) {
              const amountTag = zapRequest.tags?.find((t: string[]) => t[0] === "amount");
              if (amountTag) {
                amount = Math.round(parseInt(amountTag[1], 10) / 1000);
              }
            }

            for (const eTag of eTags) {
              const eventId = eTag[1];
              if (!zapReceipts.has(eventId)) {
                zapReceipts.set(eventId, []);
              }
              const existing = zapReceipts.get(eventId)!;
              const isDupe = existing.some(r => r.zapperPubkey === zapperPubkey && r.amount === amount);
              if (!isDupe) {
                existing.push({ zapperPubkey, amount, eventId });
              }
            }
          }
        } catch {}
      } else if (eventData.kind === 10000100 || eventData.kind === 10000174) {
        try {
          const parsed = JSON.parse(eventData.content);
          if (parsed && typeof parsed === "object") {
            if (parsed.event_id) {
              const existing = stats.get(parsed.event_id) || { likes: 0, replies: 0, reposts: 0, zaps: 0, zapAmount: 0 };
              stats.set(parsed.event_id, {
                likes: parsed.likes || parsed.reactions || existing.likes,
                replies: parsed.replies || existing.replies,
                reposts: parsed.reposts || existing.reposts,
                zaps: parsed.zaps || existing.zaps,
                zapAmount: parsed.satszapped || parsed.sats_total || existing.zapAmount,
              });
            } else {
              for (const [eventId, counts] of Object.entries(parsed)) {
                if (typeof counts === "object" && counts !== null) {
                  const c = counts as any;
                  const existing = stats.get(eventId) || { likes: 0, replies: 0, reposts: 0, zaps: 0, zapAmount: 0 };
                  stats.set(eventId, {
                    likes: c.likes || c.reactions || existing.likes,
                    replies: c.replies || existing.replies,
                    reposts: c.reposts || existing.reposts,
                    zaps: c.zaps || existing.zaps,
                    zapAmount: c.satszapped || c.sats_total || existing.zapAmount,
                  });
                }
              }
            }
          }
        } catch {}
      }
    }
  }

  events.sort((a, b) => b.created_at - a.created_at);
  return { events, profiles, stats, zapReceipts };
}

class PrimalCacheConnection {
  private ws: WebSocket | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private connectPromise: Promise<void> | null = null;
  private reconnectAttempts = 0;
  private isDestroyed = false;
  private feedCache = new Map<string, CacheEntry>();
  private currentUrl: string = "";
  private consecutiveTimeouts = 0;

  async ensureConnected(): Promise<void> {
    const targetUrl = getCacheUrl();

    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentUrl === targetUrl) {
      return;
    }

    if (this.currentUrl !== targetUrl && this.ws) {
      console.log("[PrimalCache] Cache URL changed, reconnecting...");
      this.ws.close();
      this.ws = null;
      this.connectPromise = null;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.connect(targetUrl);
    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  private connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isDestroyed) {
        reject(new Error("Connection destroyed"));
        return;
      }

      try {
        this.ws = new WebSocket(url);
        this.currentUrl = url;
      } catch (err) {
        reject(new Error("Failed to create WebSocket"));
        return;
      }

      const timeout = setTimeout(() => {
        this.ws?.close();
        reject(new Error("Primal connection timeout"));
      }, CONNECTION_TIMEOUT_MS);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        this.reconnectAttempts = 0;
        this.consecutiveTimeouts = 0;
        console.log("[PrimalCache] Connected to", url);
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          if (!Array.isArray(data) || data.length < 2) return;

          const [msgType, subId] = data;
          const pending = this.pendingRequests.get(subId);
          if (!pending) return;

          if (msgType === "EVENT") {
            pending.messages.push(data);
          } else if (msgType === "EOSE") {
            clearTimeout(pending.timeout);
            this.pendingRequests.delete(subId);
            this.consecutiveTimeouts = 0;
            pending.resolve(pending.messages);
          }
        } catch {}
      };

      this.ws.onclose = () => {
        clearTimeout(timeout);
        console.log("[PrimalCache] Connection closed");
        this.rejectAllPending("Connection closed");
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        clearTimeout(timeout);
        this.rejectAllPending("WebSocket error");
        reject(new Error("Primal WebSocket error"));
      };
    });
  }

  private rejectAllPending(reason: string) {
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timeout);
      pending.reject(new Error(reason));
    });
    this.pendingRequests.clear();
  }

  private scheduleReconnect() {
    if (this.isDestroyed || this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }
    this.reconnectAttempts++;
    const delay = RECONNECT_DELAY_MS * Math.pow(1.5, this.reconnectAttempts - 1);
    console.log(`[PrimalCache] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.ensureConnected().catch(() => {});
      }
    }, delay);
  }

  async sendRequest(payload: any): Promise<any[]> {
    await this.ensureConnected();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const subId = generateSubId();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(subId);
        this.consecutiveTimeouts++;

        if (this.consecutiveTimeouts >= 3) {
          console.log("[PrimalCache] Too many timeouts, forcing reconnect");
          this.consecutiveTimeouts = 0;
          this.ws?.close();
          this.ws = null;
        }

        reject(new Error("Request timeout"));
      }, REQUEST_TIMEOUT_MS);

      this.pendingRequests.set(subId, {
        subId,
        messages: [],
        resolve,
        reject,
        timeout,
      });

      this.ws!.send(JSON.stringify(["REQ", subId, payload]));
    });
  }

  getCached(key: string, allowStale: boolean = false): PrimalFeedResult | null {
    const entry = this.feedCache.get(key);
    if (!entry) return null;
    const age = Date.now() - entry.timestamp;
    if (age <= CACHE_TTL_MS) {
      return entry.result;
    }
    if (allowStale && age <= STALE_TTL_MS) {
      return entry.result;
    }
    if (age > STALE_TTL_MS) {
      this.feedCache.delete(key);
    }
    return null;
  }

  setCache(key: string, result: PrimalFeedResult) {
    this.feedCache.set(key, { result, timestamp: Date.now() });
  }

  invalidateCache(keyPrefix?: string) {
    if (!keyPrefix) {
      this.feedCache.clear();
      return;
    }
    const keysToDelete: string[] = [];
    this.feedCache.forEach((_, key) => {
      if (key.startsWith(keyPrefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.feedCache.delete(key));
  }

  reconnect() {
    this.ws?.close();
    this.ws = null;
    this.connectPromise = null;
    this.reconnectAttempts = 0;
    this.ensureConnected().catch(() => {});
  }

  destroy() {
    this.isDestroyed = true;
    this.rejectAllPending("Connection destroyed");
    this.feedCache.clear();
    this.ws?.close();
    this.ws = null;
  }

  getStatus(): { url: string; connected: boolean; enhancedPrivacy: boolean } {
    return {
      url: this.currentUrl || getCacheUrl(),
      connected: this.ws?.readyState === WebSocket.OPEN,
      enhancedPrivacy: isEnhancedPrivacyEnabled(),
    };
  }
}

const primalCache = new PrimalCacheConnection();

export async function fetchPrimalFeed(
  mode: ExploreMode,
  options: { limit?: number; userPubkey?: string; skipCache?: boolean } = {}
): Promise<PrimalFeedResult> {
  const { limit = 30, userPubkey, skipCache = false } = options;

  const cacheKey = `explore:${mode}:${limit}:${userPubkey || "anon"}`;

  if (!skipCache) {
    const cached = primalCache.getCached(cacheKey);
    if (cached) {
      console.log(`[PrimalCache] Cache hit for ${cacheKey}`);
      return cached;
    }
  }

  try {
    const payload: any = { scope: "global", limit };

    switch (mode) {
      case "trending":
        payload.timeframe = "trending";
        payload.created_after = Math.floor((Date.now() - DAY_MS) / 1000);
        break;
      case "most_zapped":
        payload.timeframe = "mostzapped";
        payload.created_after = Math.floor((Date.now() - 4 * HOUR_MS) / 1000);
        break;
      case "media":
        payload.timeframe = "popular";
        payload.scope = "global";
        payload.content_type = "image";
        break;
      case "latest":
      default:
        payload.timeframe = "latest";
        break;
    }

    if (userPubkey) {
      payload.user_pubkey = userPubkey;
    }

    const messages = await primalCache.sendRequest({ cache: ["explore", payload] });
    const result = parsePrimalResponse(messages);

    primalCache.setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error("[PrimalCache] Error:", err);
    const stale = primalCache.getCached(cacheKey, true);
    if (stale) {
      console.log("[PrimalCache] Returning stale cache for", cacheKey);
      return stale;
    }
    return { events: [], profiles: new Map(), stats: new Map(), zapReceipts: new Map() };
  }
}

export async function fetchPrimalUserFeed(
  pubkey: string,
  options: { limit?: number; userPubkey?: string; until?: number; skipCache?: boolean } = {}
): Promise<PrimalFeedResult> {
  const { limit = 30, userPubkey, until, skipCache = false } = options;

  const cacheKey = `userfeed:${pubkey}:${limit}:${userPubkey || "anon"}:${until || "latest"}`;

  if (!skipCache) {
    const cached = primalCache.getCached(cacheKey);
    if (cached) {
      console.log(`[PrimalCache] Cache hit for userfeed:${pubkey.slice(0, 8)}`);
      return cached;
    }
  }

  try {
    const payload: any = { pubkey, limit };
    if (userPubkey) payload.user_pubkey = userPubkey;
    if (until && until > 0) payload.until = until;
    else payload.until = Math.ceil(Date.now() / 1000);

    const messages = await primalCache.sendRequest({ cache: ["feed", payload] });
    const result = parsePrimalResponse(messages);

    primalCache.setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error("[PrimalCache] User feed error:", err);
    const stale = primalCache.getCached(cacheKey, true);
    if (stale) {
      console.log("[PrimalCache] Returning stale cache for userfeed:", pubkey.slice(0, 8));
      return stale;
    }
    return { events: [], profiles: new Map(), stats: new Map(), zapReceipts: new Map() };
  }
}

export async function fetchPrimalEvent(eventId: string): Promise<{ event: PrimalEvent | null; profile: PrimalProfile | null }> {
  try {
    const messages = await primalCache.sendRequest({ cache: ["events", { event_ids: [eventId] }] });
    const result = parsePrimalResponse(messages);
    const event = result.events[0] || null;
    const profile = event ? result.profiles.get(event.pubkey) || null : null;
    return { event, profile };
  } catch (err) {
    console.error("[PrimalCache] Event fetch error:", err);
    return { event: null, profile: null };
  }
}

export type PrimalThreadResult = {
  mainEvent: PrimalEvent | null;
  replies: PrimalEvent[];
  parentEvents: PrimalEvent[];
  profiles: Map<string, PrimalProfile>;
  stats: Map<string, PrimalEventStats>;
  zapReceipts: Map<string, ZapReceipt[]>;
};

export async function fetchPrimalThread(eventId: string, options: { userPubkey?: string; limit?: number } = {}): Promise<PrimalThreadResult> {
  const { userPubkey, limit = 100 } = options;
  try {
    const payload: any = { event_id: eventId, limit };
    if (userPubkey) payload.user_pubkey = userPubkey;

    const messages = await primalCache.sendRequest({ cache: ["thread_view", payload] });
    const result = parsePrimalResponse(messages);

    const mainEvent = result.events.find(e => e.id === eventId) || null;

    const parentEventIds = new Set<string>();
    if (mainEvent) {
      for (const tag of mainEvent.tags) {
        if (tag[0] === "e" && tag[3] === "reply") {
          parentEventIds.add(tag[1]);
        } else if (tag[0] === "e" && !tag[3]) {
          parentEventIds.add(tag[1]);
        }
      }
    }

    const parentEvents: PrimalEvent[] = [];
    const replies: PrimalEvent[] = [];

    for (const event of result.events) {
      if (event.id === eventId) continue;
      if (parentEventIds.has(event.id)) {
        parentEvents.push(event);
      } else {
        const isDirectReply = event.tags.some(t =>
          t[0] === "e" && t[1] === eventId && (t[3] === "reply" || t[3] === "root" || !t[3])
        );
        if (isDirectReply) {
          replies.push(event);
        }
      }
    }

    replies.sort((a, b) => a.created_at - b.created_at);
    parentEvents.sort((a, b) => a.created_at - b.created_at);

    return {
      mainEvent,
      replies,
      parentEvents,
      profiles: result.profiles,
      stats: result.stats,
      zapReceipts: result.zapReceipts,
    };
  } catch (err) {
    console.error("[PrimalCache] Thread fetch error:", err);
    return {
      mainEvent: null,
      replies: [],
      parentEvents: [],
      profiles: new Map(),
      stats: new Map(),
      zapReceipts: new Map(),
    };
  }
}

export function invalidatePrimalCache(keyPrefix?: string) {
  primalCache.invalidateCache(keyPrefix);
}

export function reconnectPrimalCache() {
  primalCache.reconnect();
}

export function getPrimalCacheStatus() {
  return primalCache.getStatus();
}

export type { PrimalEvent, PrimalProfile, PrimalEventStats, PrimalFeedResult, ExploreMode, ZapReceipt };
