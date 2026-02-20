import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Radio, Plus, Shield, CheckCircle, XCircle, Wifi } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNDK } from "@/contexts/ndk-context";
import { LAB_RELAY_URL, PUBLIC_RELAYS } from "@/lib/relays";

interface RelayInfo {
  url: string;
  status: "connected" | "connecting" | "disconnected";
  isLabRelay: boolean;
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

function StatusIcon({ status }: { status: string }) {
  if (status === "connected") {
    return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
  }
  if (status === "connecting") {
    return <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin shrink-0" />;
  }
  return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
}

export default function RelaysPage() {
  const { ndk, isConnected } = useNDK();
  const [relayList, setRelayList] = useState<RelayInfo[]>([]);
  const [newRelay, setNewRelay] = useState("");

  const buildRelayList = useCallback(() => {
    if (!ndk?.pool) return;

    const relays: RelayInfo[] = [];
    const poolRelays = ndk.pool.relays;

    poolRelays.forEach((ndkRelay, url) => {
      relays.push({
        url,
        status: mapRelayStatus(ndkRelay.status),
        isLabRelay: url === LAB_RELAY_URL,
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

          <div className="flex items-center gap-4 p-4 rounded-xs bg-muted/30 border" data-testid="relay-stats">
            <Wifi className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-[Marcellus] text-foreground">
                {connectedCount} of {totalCount} relays connected
              </p>
              <p className="text-xs text-muted-foreground font-[Marcellus]">
                {isConnected ? "NDK connected" : "NDK disconnected"}
              </p>
            </div>
            <Badge
              variant={connectedCount > 0 ? "default" : "destructive"}
              className={connectedCount > 0 ? "bg-foreground hover:bg-foreground/90" : ""}
              data-testid="badge-connection-status"
            >
              {connectedCount > 0 ? "Online" : "Offline"}
            </Badge>
          </div>

          <Card className="rounded-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-[Marcellus] font-normal">
                <Plus className="w-5 h-5 text-muted-foreground" />
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
                  className=""
                  data-testid="button-add-relay"
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {labRelay && (
            <Card className="rounded-xs border-[#6600ff]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-[Marcellus] font-normal">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  Private Relay
                </CardTitle>
                <CardDescription className="font-[Marcellus]">Your private LaB relay for secure data</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xs hover:bg-[#F0E6FF] transition-colors"
                  data-testid={`relay-row-${labRelay.url.replace(/[^a-z0-9]/gi, '-')}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <StatusIcon status={labRelay.status} />
                    <div className="min-w-0">
                      <p className="text-sm font-[Marcellus] font-normal text-[#6600ff]" data-testid="text-lab-relay-label">
                        Private LaB Relay
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-[Marcellus]" data-testid={`text-relay-url-${labRelay.url.replace(/[^a-z0-9]/gi, '-')}`}>
                        {labRelay.url}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 ${labRelay.status === "connected" ? "text-green-600" : labRelay.status === "connecting" ? "text-orange-500" : "text-red-500"}`}
                  >
                    {labRelay.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-[Marcellus] font-normal">
                <Radio className="w-5 h-5 text-muted-foreground" />
                Public Relays
              </CardTitle>
              <CardDescription className="font-[Marcellus]">
                {publicRelays.filter(r => r.status === "connected").length} of {publicRelays.length} public relays connected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {publicRelays.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 font-[Marcellus]" data-testid="text-no-relays">
                  No public relays configured
                </p>
              )}
              {publicRelays.map((relay) => (
                <div
                  key={relay.url}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xs hover:bg-[#F0E6FF] transition-colors"
                  data-testid={`relay-row-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <StatusIcon status={relay.status} />
                    <div className="min-w-0">
                      <p className="text-sm font-[Marcellus] font-normal truncate" data-testid={`text-relay-url-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}>
                        {relay.url}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 ${relay.status === "connected" ? "text-green-600" : relay.status === "connecting" ? "text-orange-500" : "text-red-500"}`}
                  >
                    {relay.status}
                  </Badge>
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
