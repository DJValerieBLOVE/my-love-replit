import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Radio, Plus, Shield, Check, X, Wifi, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNDK } from "@/contexts/ndk-context";
import { LAB_RELAY_URL, PUBLIC_RELAYS } from "@/lib/relays";

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

function StatusDot({ status }: { status: string }) {
  const isConnected = status === "connected";
  if (isConnected) {
    return (
      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0" data-testid="status-connected">
        <Check className="w-3 h-3 text-green-600" strokeWidth={2.5} />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0" data-testid="status-disconnected">
      <X className="w-3 h-3 text-red-500" strokeWidth={2.5} />
    </div>
  );
}

export default function RelaysPage() {
  const { ndk, isConnected } = useNDK();
  const [relayList, setRelayList] = useState<RelayInfo[]>([]);
  const [newRelay, setNewRelay] = useState("");

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
  const connectedCount = relayList.filter(r => r.status === "connected").length;
  const totalCount = relayList.length;

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto pb-20 md:pb-4">
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-[Marcellus] font-normal text-foreground mb-2" data-testid="text-relays-title">
              Nostr Relays
            </h1>
            <p className="text-muted-foreground font-[Marcellus]" data-testid="text-relays-subtitle">
              Relays store and distribute your data across the Nostr network
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xs border" data-testid="relay-stats">
            <Wifi className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-sm font-[Marcellus] text-foreground">
                {connectedCount} of {totalCount} relays connected
              </p>
              <p className="text-xs text-muted-foreground font-[Marcellus]">
                {isConnected ? "NDK connected" : "NDK disconnected"}
              </p>
            </div>
            {connectedCount > 0 ? (
              <div className="flex items-center gap-1.5 text-green-600 text-sm font-[Marcellus]" data-testid="badge-connection-status">
                <Check className="w-4 h-4" strokeWidth={2} />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-red-500 text-sm font-[Marcellus]" data-testid="badge-connection-status">
                <X className="w-4 h-4" strokeWidth={2} />
                <span>Offline</span>
              </div>
            )}
          </div>

          <Card className="rounded-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-[Marcellus] font-normal">
                <Plus className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                Add Relay
              </CardTitle>
              <CardDescription className="font-[Marcellus]">Connect to a new Nostr relay</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="wss://relay.example.com"
                  value={newRelay}
                  onChange={(e) => setNewRelay(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRelay()}
                  className="flex-1"
                  data-testid="input-relay-url"
                />
                <Button
                  onClick={handleAddRelay}
                  data-testid="button-add-relay"
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {labRelay && (
            <Card className="rounded-xs border-[#6600ff]/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-[Marcellus] font-normal">
                  <Shield className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  Private Relay
                </CardTitle>
                <CardDescription className="font-[Marcellus]">Your private LaB relay for encrypted data</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="flex items-center gap-3 p-3 rounded-xs border border-gray-100"
                  data-testid={`relay-row-lab`}
                >
                  <StatusDot status={labRelay.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-[Marcellus] font-normal text-foreground truncate" data-testid="text-lab-relay-url">
                      {labRelay.url}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-[Marcellus] shrink-0">read / write</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-[Marcellus] font-normal">
                <Radio className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                Public Relays
              </CardTitle>
              <CardDescription className="font-[Marcellus]">
                {publicRelays.filter(r => r.status === "connected").length} of {publicRelays.length} public relays connected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {publicRelays.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 font-[Marcellus]" data-testid="text-no-relays">
                  No public relays configured
                </p>
              )}
              {publicRelays.map((relay) => (
                <div
                  key={relay.url}
                  className="flex items-center gap-3 p-3 rounded-xs border border-gray-100 group"
                  data-testid={`relay-row-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}
                >
                  <StatusDot status={relay.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-[Marcellus] font-normal truncate" data-testid={`text-relay-url-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}>
                      {relay.url}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-[Marcellus] shrink-0">read / write</span>
                  {!relay.isDefault && (
                    <button
                      onClick={() => handleRemoveRelay(relay.url)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
                      data-testid={`button-remove-relay-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground font-[Marcellus]">
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
      </div>
    </Layout>
  );
}
