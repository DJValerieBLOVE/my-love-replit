import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Zap, History, QrCode } from "lucide-react";
import { CURRENT_USER } from "@/lib/mock-data";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold">Lightning Wallet</h1>
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
              {CURRENT_USER.walletBalance.toLocaleString()} <span className="text-lg opacity-80">sats</span>
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
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <History className="w-4 h-4" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-md
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
