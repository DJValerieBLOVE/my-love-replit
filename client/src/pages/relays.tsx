import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Radio, Shield, Link2, Database, Info } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNDK } from "@/contexts/ndk-context";
import { LAB_RELAY_URL, PUBLIC_RELAYS } from "@/lib/relays";
import { reconnectPrimalCache } from "@/lib/primal-cache";

interface RelayInfo {
  url: string;
  status: "connected" | "connecting" | "disconnected";
  isLabRelay: boolean;
  isDefault: boolean;
}

function mapRelayStatus(statusCode: number): "connected" | "connecting" | "disconnected" {
  switch (statusCode) {
    case 5: return "connected";
    case 4:
    case 2: return "connecting";
    case 1:
    case 0:
    default: return "disconnected";
  }
}

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <div
      className={`w-2.5 h-2.5 rounded-full shrink-0 ${connected ? 'bg-green-500' : 'bg-red-400'}`}
      data-testid={connected ? "status-connected" : "status-disconnected"}
    />
  );
}

const DEFAULT_CACHE_SERVICE = "wss://cache2.primal.net/v1";

export default function RelaysPage() {
  const { ndk, isConnected } = useNDK();
  const [relayList, setRelayList] = useState<RelayInfo[]>([]);
  const [newRelay, setNewRelay] = useState("");
  const [cacheService, setCacheService] = useState(() => {
    try { return localStorage.getItem("lab-cache-service") || DEFAULT_CACHE_SERVICE; } catch { return DEFAULT_CACHE_SERVICE; }
  });
  const [cacheServiceInput, setCacheServiceInput] = useState("");
  const [enhancedPrivacy, setEnhancedPrivacy] = useState(() => {
    try { return localStorage.getItem("lab-enhanced-privacy") === "true"; } catch { return false; }
  });

  const defaultUrls = [LAB_RELAY_URL, ...PUBLIC_RELAYS].map(u => u.endsWith('/') ? u : u + '/');

  const buildRelayList = useCallback(() => {
    if (!ndk?.pool) return;

    const relays: RelayInfo[] = [];
    const poolRelays = ndk.pool.relays;

    poolRelays.forEach((ndkRelay, url) => {
      const normalizedUrl = url.endsWith('/') ? url : url + '/';
      relays.push({
        url,
        status: mapRelayStatus(ndkRelay.status),
        isLabRelay: normalizedUrl === (LAB_RELAY_URL.endsWith('/') ? LAB_RELAY_URL : LAB_RELAY_URL + '/'),
        isDefault: defaultUrls.includes(normalizedUrl),
      });
    });

    relays.sort((a, b) => {
      if (a.isLabRelay) return -1;
      if (b.isLabRelay) return 1;
      return a.url.localeCompare(b.url);
    });

    setRelayList(relays);
  }, [ndk]);

  useEffect(() => {
    buildRelayList();
    const interval = setInterval(buildRelayList, 5000);
    return () => clearInterval(interval);
  }, [buildRelayList]);

  const handleAddRelay = async () => {
    if (!newRelay || !newRelay.startsWith("wss://") || !ndk) return;

    try {
      const relay = ndk.pool.getRelay(newRelay, true);
      if (relay) {
        await relay.connect();
      }
      setNewRelay("");
      setTimeout(buildRelayList, 1000);
    } catch (err) {
      console.error("[Relays] Failed to add relay:", err);
    }
  };

  const handleRemoveRelay = async (url: string) => {
    if (!ndk?.pool) return;
    try {
      const relay = ndk.pool.relays.get(url);
      if (relay) {
        relay.disconnect();
        ndk.pool.relays.delete(url);
      }
      setTimeout(buildRelayList, 500);
    } catch (err) {
      console.error("[Relays] Failed to remove relay:", err);
    }
  };

  const labRelay = relayList.find(r => r.isLabRelay);
  const publicRelays = relayList.filter(r => !r.isLabRelay);
  const connectedRelays = relayList.filter(r => r.status === "connected");
  const connectedPublic = publicRelays.filter(r => r.status === "connected");

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto pb-20 md:pb-4">
        <div className="max-w-[940px] mx-auto p-4 md:p-6">
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-[Marcellus] font-normal text-foreground mb-8" data-testid="text-relays-title">
                Relays
              </h1>

              {labRelay && (
                <div className="mb-8">
                  <h2 className="text-base font-[Marcellus] font-normal text-foreground mb-1" data-testid="text-private-relay-heading">
                    Private relay
                  </h2>
                  <p className="text-xs text-muted-foreground font-[Marcellus] mb-4">Your encrypted LaB relay</p>

                  <div
                    className="flex items-center py-3 border-b border-gray-100"
                    data-testid="relay-row-lab"
                  >
                    <StatusDot connected={labRelay.status === "connected"} />
                    <Shield className="w-4 h-4 text-muted-foreground ml-3 mr-2 shrink-0" strokeWidth={1.5} />
                    <span className="text-sm font-[Marcellus] font-normal text-foreground truncate flex-1" data-testid="text-lab-relay-url">
                      {labRelay.url}
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-base font-[Marcellus] font-normal text-foreground mb-1" data-testid="text-my-relays-heading">
                  My relays
                </h2>
                <p className="text-xs text-muted-foreground font-[Marcellus] mb-4">
                  {connectedPublic.length} of {publicRelays.length} connected
                </p>

                <div className="divide-y divide-gray-100">
                  {publicRelays.map((relay) => (
                    <div
                      key={relay.url}
                      className="flex items-center py-3 group"
                      data-testid={`relay-row-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}
                    >
                      <StatusDot connected={relay.status === "connected"} />
                      <Radio className="w-4 h-4 text-muted-foreground ml-3 mr-2 shrink-0" strokeWidth={1.5} />
                      <span className="text-sm font-[Marcellus] font-normal truncate flex-1" data-testid={`text-relay-url-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}>
                        {relay.url}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveRelay(relay.url)}
                        className="text-xs h-7 px-3 text-muted-foreground hover:text-red-500 hover:border-red-200 border-gray-200 ml-3 shrink-0"
                        data-testid={`button-remove-relay-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}
                      >
                        remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-base font-[Marcellus] font-normal text-foreground mb-1">
                  Add a relay
                </h2>
                <p className="text-xs text-muted-foreground font-[Marcellus] mb-4">Connect to a new Nostr relay</p>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <Input
                      placeholder="wss://relay.example.com"
                      value={newRelay}
                      onChange={(e) => setNewRelay(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddRelay()}
                      className="pl-10"
                      data-testid="input-relay-url"
                    />
                  </div>
                  <Button
                    onClick={handleAddRelay}
                    className="shrink-0"
                    data-testid="button-add-relay"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-base font-[Marcellus] font-normal text-foreground mb-1" data-testid="text-caching-service-heading">
                  Caching Service
                </h2>
                <p className="text-xs text-muted-foreground font-[Marcellus] mb-4">Connected caching service for faster feed loading</p>

                <div className="flex items-center py-3 border-b border-gray-100">
                  <StatusDot connected={true} />
                  <Database className="w-4 h-4 text-muted-foreground ml-3 mr-2 shrink-0" strokeWidth={1.5} />
                  <span className="text-sm font-[Marcellus] font-normal text-foreground truncate flex-1" data-testid="text-cache-service-url">
                    {cacheService}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-muted-foreground font-[Marcellus] mb-2">Connect to a different caching service</p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      <Input
                        placeholder="wss://cachingservice.url"
                        value={cacheServiceInput}
                        onChange={(e) => setCacheServiceInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && cacheServiceInput.startsWith("wss://")) {
                            setCacheService(cacheServiceInput);
                            try { localStorage.setItem("lab-cache-service", cacheServiceInput); } catch {}
                            setCacheServiceInput("");
                            reconnectPrimalCache();
                          }
                        }}
                        className="pl-10"
                        data-testid="input-cache-service-url"
                      />
                    </div>
                  </div>
                  {cacheService !== DEFAULT_CACHE_SERVICE && (
                    <button
                      onClick={() => {
                        setCacheService(DEFAULT_CACHE_SERVICE);
                        try { localStorage.removeItem("lab-cache-service"); } catch {}
                        reconnectPrimalCache();
                      }}
                      className="text-xs text-[#6600ff] hover:underline font-[Marcellus] mt-2"
                      data-testid="button-restore-default-cache"
                    >
                      Restore default caching service
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-8 border-t border-gray-100 pt-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="enhanced-privacy"
                    checked={enhancedPrivacy}
                    onChange={(e) => {
                      setEnhancedPrivacy(e.target.checked);
                      try { localStorage.setItem("lab-enhanced-privacy", String(e.target.checked)); } catch {}
                    }}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-foreground focus:ring-0 accent-foreground"
                    data-testid="checkbox-enhanced-privacy"
                  />
                  <div>
                    <label htmlFor="enhanced-privacy" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-[Marcellus] font-normal text-foreground" data-testid="text-enhanced-privacy-label">
                        Use Enhanced Privacy
                      </span>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    </label>
                    <p className="text-xs text-muted-foreground font-[Marcellus] mt-1 leading-relaxed" data-testid="text-enhanced-privacy-description">
                      When enabled, your IP address will be visible to the caching service, but not to relays. Your content will be published to your specified relays using the caching service as a proxy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs text-muted-foreground font-[Marcellus]">
                  Need relay recommendations? Check out{" "}
                  <a
                    href="https://nostr.watch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6600ff] hover:underline"
                    data-testid="link-nostr-watch"
                  >
                    nostr.watch
                  </a>
                </p>
              </div>
            </div>

            <div className="hidden md:block w-[260px] shrink-0">
              <div className="sticky top-6 space-y-6">
                <div>
                  <h3 className="text-sm font-[Marcellus] font-normal text-foreground mb-3" data-testid="text-sidebar-relays-heading">
                    Connected Relays
                  </h3>
                  <div className="space-y-2">
                    {connectedRelays.length === 0 && (
                      <p className="text-xs text-muted-foreground font-[Marcellus]">No relays connected</p>
                    )}
                    {connectedRelays.map((relay) => (
                      <div key={relay.url} className="flex items-center gap-2">
                        <StatusDot connected={true} />
                        <span className="text-xs text-muted-foreground font-[Marcellus] truncate">
                          {relay.url}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-[Marcellus] font-normal text-foreground mb-3" data-testid="text-sidebar-private-heading">
                    Private Relay
                  </h3>
                  <div className="space-y-2">
                    {labRelay ? (
                      <div className="flex items-center gap-2">
                        <StatusDot connected={labRelay.status === "connected"} />
                        <span className="text-xs text-muted-foreground font-[Marcellus] truncate">
                          {labRelay.url}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground font-[Marcellus]">Not configured</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-[Marcellus] font-normal text-foreground mb-3" data-testid="text-sidebar-cache-heading">
                    Caching Services
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <StatusDot connected={true} />
                      <span className="text-xs text-muted-foreground font-[Marcellus] truncate">
                        {cacheService}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
