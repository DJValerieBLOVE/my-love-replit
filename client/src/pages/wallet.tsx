import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, ArrowDownLeft, Zap, History, QrCode, Link as LinkIcon, Check, Wallet as WalletIcon, AlertCircle, Copy, X } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNostr } from "@/contexts/nostr-context";
import { 
  parseNWCUri, 
  saveNWCConnection, 
  loadNWCConnection, 
  clearNWCConnection, 
  getWalletBalance,
  getWalletInfo,
  makeInvoice,
  NWCConnection 
} from "@/lib/nwc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [nwcUri, setNwcUri] = useState("");
  const [nwcConnection, setNwcConnection] = useState<NWCConnection | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [receiveAmount, setReceiveAmount] = useState("");
  const [invoice, setInvoice] = useState("");
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const { userStats } = useNostr();

  useEffect(() => {
    const saved = loadNWCConnection();
    if (saved) {
      setNwcConnection(saved);
      fetchWalletData(saved);
    }
  }, []);

  const fetchWalletData = async (connection: NWCConnection) => {
    try {
      const [balance, info] = await Promise.all([
        getWalletBalance(connection),
        getWalletInfo(connection).catch(() => null),
      ]);
      setWalletBalance(Math.floor(balance.balance / 1000));
      if (info) setWalletInfo(info);
    } catch (e) {
      console.error("Failed to fetch wallet data:", e);
      toast.error("Failed to fetch wallet balance");
    }
  };

  const handleConnectNWC = async () => {
    if (!nwcUri) return;
    
    setIsConnecting(true);
    const connection = parseNWCUri(nwcUri);
    
    if (!connection) {
      toast.error("Invalid NWC connection string", {
        description: "Please paste a valid nostr+walletconnect:// URI"
      });
      setIsConnecting(false);
      return;
    }

    try {
      await fetchWalletData(connection);
      saveNWCConnection(connection);
      setNwcConnection(connection);
      setNwcUri("");
      toast.success("Wallet Connected!", {
        description: "Your Lightning wallet is now connected for P2P zaps"
      });
    } catch (e: any) {
      toast.error("Failed to connect wallet", {
        description: e.message || "Check your connection string and try again"
      });
    }
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    clearNWCConnection();
    setNwcConnection(null);
    setWalletBalance(null);
    setWalletInfo(null);
    toast.success("Wallet disconnected");
  };

  const handleGenerateInvoice = async () => {
    if (!nwcConnection || !receiveAmount) return;
    
    setIsGeneratingInvoice(true);
    try {
      const result = await makeInvoice(nwcConnection, parseInt(receiveAmount), "Receive sats via My Masterpiece");
      setInvoice(result.invoice);
      toast.success("Invoice generated!");
    } catch (e: any) {
      toast.error("Failed to generate invoice", { description: e.message });
    }
    setIsGeneratingInvoice(false);
  };

  const copyInvoice = () => {
    navigator.clipboard.writeText(invoice);
    toast.success("Invoice copied to clipboard");
  };

  const displayBalance = nwcConnection ? walletBalance : (userStats?.walletBalance || 0);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-muted-foreground">Lightning Wallet</h1>
          <Button variant="outline" size="sm" className="gap-2" data-testid="button-scan">
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
              <span className="font-medium text-sm tracking-wider uppercase">
                {nwcConnection ? "Wallet Balance" : "Community Sats"}
              </span>
            </div>
            <div className="text-4xl font-bold font-mono mb-6" data-testid="text-wallet-balance">
              {displayBalance !== null ? displayBalance.toLocaleString() : "---"} <span className="text-lg opacity-80">sats</span>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm"
                onClick={() => setShowReceiveDialog(true)}
                disabled={!nwcConnection}
                data-testid="button-receive"
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" /> Receive
              </Button>
              <Button 
                className="flex-1 bg-white text-orange-600 hover:bg-white/90 border-none shadow-lg"
                disabled={!nwcConnection}
                data-testid="button-send"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold font-mono text-green-600" data-testid="text-sats-received">
                {(userStats?.satsReceived || 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Sats Received</div>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">from community</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold font-mono text-orange-500" data-testid="text-sats-given">
                {(userStats?.satsGiven || 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Sats Given</div>
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">to community</div>
            </CardContent>
          </Card>
        </div>

        {/* Connect Wallet Section */}
        <Card className="border-none shadow-sm bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <span className="bg-purple-500/10 p-1.5 rounded-lg">
                <WalletIcon className="w-5 h-5 text-purple-500" />
              </span>
              Connect Lightning Wallet
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Connect any NWC-compatible wallet (Alby, Phoenix, Mutiny, etc.) to send & receive zaps peer-to-peer.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {!nwcConnection ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nwc-uri" className="text-xs font-bold text-muted-foreground uppercase">
                    NWC Connection String
                  </Label>
                  <Input 
                    id="nwc-uri" 
                    placeholder="nostr+walletconnect://..." 
                    className="font-mono text-sm"
                    value={nwcUri}
                    onChange={(e) => setNwcUri(e.target.value)}
                    data-testid="input-nwc-uri"
                  />
                </div>
                <Button 
                  onClick={handleConnectNWC}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  disabled={!nwcUri || isConnecting}
                  data-testid="button-connect-wallet"
                >
                  {isConnecting ? (
                    <>Connecting...</>
                  ) : (
                    <><LinkIcon className="w-4 h-4 mr-2" /> Connect Wallet</>
                  )}
                </Button>
                
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>How to get your NWC string:</strong>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li><strong>Alby:</strong> Go to Settings → Wallet Connections → Add new connection</li>
                      <li><strong>Phoenix:</strong> Settings → Wallet info → Show Nostr Wallet Connect</li>
                      <li><strong>Mutiny:</strong> Settings → Wallet Connections → Create</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-green-700 dark:text-green-400" data-testid="text-wallet-connected">
                        Wallet Connected
                      </p>
                      <p className="text-sm text-green-600/80 dark:text-green-500/80">
                        {walletInfo?.alias || "Lightning Wallet"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDisconnect} 
                    className="text-muted-foreground hover:text-destructive"
                    data-testid="button-disconnect-wallet"
                  >
                    Disconnect
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => fetchWalletData(nwcConnection)}
                  data-testid="button-refresh-balance"
                >
                  Refresh Balance
                </Button>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-border/40 text-center">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                Non-custodial. Your keys, your coins. We never hold your funds.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Zap Activity (Last 7 Days)</CardTitle>
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
            <History className="w-4 h-4" /> Recent Community Zaps
          </h3>
          <div className="space-y-3">
            {userStats?.satsGiven || userStats?.satsReceived ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Zapped post by community member</p>
                      <p className="text-xs text-muted-foreground">Recent activity</p>
                    </div>
                  </div>
                  <span className="font-mono font-medium text-orange-500">⚡ sats</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No zap activity yet</p>
                <p className="text-xs mt-1">Start zapping posts to see your activity here!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receive Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5" />
              Receive Sats
            </DialogTitle>
            <DialogDescription>
              Generate a Lightning invoice to receive sats
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!invoice ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (sats)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000"
                    value={receiveAmount}
                    onChange={(e) => setReceiveAmount(e.target.value)}
                    data-testid="input-receive-amount"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleGenerateInvoice}
                  disabled={!receiveAmount || isGeneratingInvoice}
                  data-testid="button-generate-invoice"
                >
                  {isGeneratingInvoice ? "Generating..." : "Generate Invoice"}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs font-mono break-all">{invoice}</p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={copyInvoice} data-testid="button-copy-invoice">
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                  <Button variant="outline" onClick={() => { setInvoice(""); setReceiveAmount(""); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
