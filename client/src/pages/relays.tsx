import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Radio, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

const defaultRelays = [
  { url: "wss://relay.damus.io", status: "connected", read: true, write: true },
  { url: "wss://relay.primal.net", status: "connected", read: true, write: true },
  { url: "wss://nos.lol", status: "connected", read: true, write: false },
  { url: "wss://relay.nostr.band", status: "disconnected", read: true, write: false },
];

export default function RelaysPage() {
  const [relays, setRelays] = useState(defaultRelays);
  const [newRelay, setNewRelay] = useState("");

  const handleAddRelay = () => {
    if (newRelay && newRelay.startsWith("wss://")) {
      setRelays([...relays, { url: newRelay, status: "connecting", read: true, write: true }]);
      setNewRelay("");
    }
  };

  const handleRemoveRelay = (url: string) => {
    setRelays(relays.filter(r => r.url !== url));
  };

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto pb-20 md:pb-4">
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2" data-testid="text-relays-title">
              Nostr Relays
            </h1>
            <p className="text-muted-foreground" data-testid="text-relays-subtitle">
              Relays store and distribute your data across the Nostr network
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5 text-muted-foreground" />
                Add Relay
              </CardTitle>
              <CardDescription>Connect to a new Nostr relay</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="wss://relay.example.com"
                  value={newRelay}
                  onChange={(e) => setNewRelay(e.target.value)}
                  className="flex-1"
                  data-testid="input-relay-url"
                />
                <Button onClick={handleAddRelay} data-testid="button-add-relay">
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Radio className="w-5 h-5 text-muted-foreground" />
                Connected Relays
              </CardTitle>
              <CardDescription>
                {relays.filter(r => r.status === "connected").length} of {relays.length} relays connected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {relays.map((relay) => (
                <div 
                  key={relay.url} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  data-testid={`relay-row-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {relay.status === "connected" ? (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    ) : relay.status === "connecting" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" data-testid={`text-relay-url-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}>{relay.url}</p>
                      <div className="flex gap-1 mt-1">
                        {relay.read && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0" data-testid={`badge-read-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}>
                            Read
                          </Badge>
                        )}
                        {relay.write && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0" data-testid={`badge-write-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}>
                            Write
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={() => handleRemoveRelay(relay.url)}
                    aria-label={`Remove relay ${relay.url}`}
                    data-testid={`button-remove-relay-${relay.url.replace(/[^a-z0-9]/gi, '-')}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Need relay recommendations? Check out{" "}
              <a 
                href="https://nostr.watch" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-love-body hover:underline"
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
