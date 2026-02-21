const PRIMAL_CACHE_URL = "wss://cache2.primal.net/v1";

const DAY_MS = 86400000;
const HOUR_MS = 3600000;

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

function generateSubId(): string {
  return Math.random().toString(36).substring(2, 14);
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

function buildPrimalWebSocket(): Promise<{ ws: WebSocket; messages: any[]; waitForEose: () => Promise<any[]> }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(PRIMAL_CACHE_URL);
    const messages: any[] = [];
    let eoseResolve: ((msgs: any[]) => void) | null = null;

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Primal connection timeout"));
    }, 10000);

    ws.onopen = () => {
      clearTimeout(timeout);
      resolve({
        ws,
        messages,
        waitForEose: () =>
          new Promise((res) => {
            eoseResolve = res;
          }),
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        messages.push(data);
        if (data[0] === "EOSE" && eoseResolve) {
          eoseResolve(messages);
          eoseResolve = null;
        }
      } catch {}
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Primal WebSocket error"));
    };
  });
}

export async function fetchPrimalFeed(
  mode: ExploreMode,
  options: { limit?: number; userPubkey?: string } = {}
): Promise<PrimalFeedResult> {
  const { limit = 30, userPubkey } = options;

  try {
    const { ws, waitForEose } = await buildPrimalWebSocket();
    const subId = generateSubId();

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

    ws.send(JSON.stringify(["REQ", subId, { cache: ["explore", payload] }]));

    const eoseTimeout = new Promise<any[]>((resolve) =>
      setTimeout(() => resolve([]), 10000)
    );

    const messages = await Promise.race([waitForEose(), eoseTimeout]);
    ws.close();

    return parsePrimalResponse(messages);
  } catch (err) {
    console.error("[PrimalCache] Error:", err);
    return { events: [], profiles: new Map(), stats: new Map(), zapReceipts: new Map() };
  }
}

export async function fetchPrimalUserFeed(
  pubkey: string,
  options: { limit?: number; userPubkey?: string; until?: number } = {}
): Promise<PrimalFeedResult> {
  const { limit = 30, userPubkey, until } = options;

  try {
    const { ws, waitForEose } = await buildPrimalWebSocket();
    const subId = generateSubId();

    const payload: any = { pubkey, limit };
    if (userPubkey) payload.user_pubkey = userPubkey;
    if (until && until > 0) payload.until = until;
    else payload.until = Math.ceil(Date.now() / 1000);

    ws.send(JSON.stringify(["REQ", subId, { cache: ["feed", payload] }]));

    const eoseTimeout = new Promise<any[]>((resolve) =>
      setTimeout(() => resolve([]), 10000)
    );

    const messages = await Promise.race([waitForEose(), eoseTimeout]);
    ws.close();

    return parsePrimalResponse(messages);
  } catch (err) {
    console.error("[PrimalCache] User feed error:", err);
    return { events: [], profiles: new Map(), stats: new Map(), zapReceipts: new Map() };
  }
}

export type { PrimalEvent, PrimalProfile, PrimalEventStats, PrimalFeedResult, ExploreMode, ZapReceipt };
