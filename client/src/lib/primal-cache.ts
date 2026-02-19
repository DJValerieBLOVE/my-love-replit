const PRIMAL_CACHE_URL = "wss://cache1.primal.net/v1";

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

type PrimalFeedResult = {
  events: PrimalEvent[];
  profiles: Map<string, PrimalProfile>;
};

type ExploreMode = "trending" | "most_zapped" | "media" | "latest";

function generateSubId(): string {
  return Math.random().toString(36).substring(2, 14);
}

function parsePrimalResponse(messages: any[]): PrimalFeedResult {
  const events: PrimalEvent[] = [];
  const profiles = new Map<string, PrimalProfile>();

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
      }
    }
  }

  events.sort((a, b) => b.created_at - a.created_at);
  return { events, profiles };
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
    return { events: [], profiles: new Map() };
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
    return { events: [], profiles: new Map() };
  }
}

export type { PrimalEvent, PrimalProfile, PrimalFeedResult, ExploreMode };
