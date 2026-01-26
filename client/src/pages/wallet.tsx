import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, ArrowDownLeft, Zap, History, QrCode, Link as LinkIcon, Check } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { toast } from "sonner";
import { useNostr } from "@/contexts/nostr-context";

const data = [
  { name: 'Mon', sats: 4000 },
  { name: 'Tue', sats: 3000 },
  { name: 'Wed', sats: 2000 },
  { name: 'Thu', sats: 2780 },
  { name: 'Fri', sats: 1890 },
  { name: 'Sat', sats: 2390 },
  { name: 'Sun', sats: 3490 },
];

export default function Wallet() {
  const [zbdGamertag, setZbdGamertag] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { userStats } = useNostr();

  const handleConnectZBD = () => {
    if (!zbdGamertag) return;
    setIsConnected(true);
    toast.success("ZBD Gamertag Connected!", {
      description: `You can now receive automated rewards to ${zbdGamertag}`
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-muted-foreground">Lightning Wallet</h1>
          <Button variant="outline" size="sm" className="gap-2">
            <QrCode className="w-4 h-4" /> Scan
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-orange-400 to-yellow-500 text-white border-none shadow-xl overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-orange-600/20 rounded-full blur-3xl" />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <Zap className="w-5 h-5 fill-white" />
              <span className="font-medium text-sm tracking-wider uppercase">Total Balance</span>
            </div>
            <div className="text-4xl font-bold font-mono mb-6">
              {(userStats?.walletBalance || 0).toLocaleString()} <span className="text-lg opacity-80">sats</span>
            </div>
            
            <div className="flex gap-3">
              <Button className="flex-1 bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm">
                <ArrowDownLeft className="w-4 h-4 mr-2" /> Receive
              </Button>
              <Button className="flex-1 bg-white text-orange-600 hover:bg-white/90 border-none shadow-lg">
                <ArrowUpRight className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Connect ZBD Gamertag Section */}
        <Card className="border-none shadow-sm bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <span className="bg-orange-500/10 p-1.5 rounded-lg">
                <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
              </span>
              Connect ZBD Gamertag
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your ZBD gamertag to receive automated rewards and peer-to-peer zaps instantly.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {!isConnected ? (
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="gamertag" className="text-xs font-bold text-muted-foreground uppercase">ZBD Gamertag</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                    <Input 
                      id="gamertag" 
                      placeholder="gamertag" 
                      className="pl-8 font-medium"
                      value={zbdGamertag}
                      onChange={(e) => setZbdGamertag(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleConnectZBD}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold min-w-[120px]"
                  disabled={!zbdGamertag}
                >
                  <LinkIcon className="w-4 h-4 mr-2" /> Connect
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xs p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-green-700">Connected</p>
                    <p className="text-sm text-green-600/80">@{zbdGamertag}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsConnected(false)} className="text-muted-foreground hover:text-destructive">
                  Disconnect
                </Button>
              </div>
            )}
            <div className="mt-4 text-xs text-muted-foreground text-center">
              Don't have a gamertag? <a href="https://zbd.gg" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline font-bold">Get the ZBD App</a>
            </div>
            <div className="mt-6 pt-4 border-t border-border/40 text-center">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                Wallet services powered by <span className="font-bold">ZBD</span>. We do not hold user funds.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="sats" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSats)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <div>
          <h3 className="font-bold mb-4 flex items-center gap-2 text-muted-foreground">
            <History className="w-4 h-4" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xs bg-card border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Zapped post by @elena_r</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <span className="font-mono font-medium text-red-500">-100 sats</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
