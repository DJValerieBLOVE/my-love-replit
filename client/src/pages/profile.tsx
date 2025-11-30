import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CURRENT_USER, LEADERBOARD_DATA, STREAK_DATA, LOVE_CODE_AREAS } from "@/lib/mock-data";
import { 
  Trophy, 
  Zap, 
  Calendar, 
  Award, 
  TrendingUp, 
  Target,
  Star,
  Shield,
  Crown,
  Flame,
  Gift
} from "lucide-react";
import BitcoinIcon from "@assets/bitcoin_icon.png";
import SatsIcon from "@assets/generated_images/sats_icon.png";

export default function Profile() {
  const user = CURRENT_USER;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-love-body to-love-soul border-none text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
            <CardContent className="p-6 flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 shadow-lg">
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">Current Level</p>
                <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                  {user.level} <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                </h2>
                <div className="mt-2 flex items-center gap-2 text-xs font-medium">
                  <Progress value={75} className="h-1.5 w-24 bg-black/20" indicatorClassName="bg-yellow-300" />
                  <span>750 / 1000 XP</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-100">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600/80">Wallet Balance</p>
                  <h2 className="text-3xl font-black text-orange-500 flex items-center gap-2 mt-1">
                    {user.walletBalance.toLocaleString()}
                    <span className="text-sm font-bold text-orange-400 mt-1">Sats</span>
                  </h2>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <img src={BitcoinIcon} alt="Bitcoin" className="w-6 h-6" />
                </div>
              </div>
              <Button size="sm" className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white border-none">
                Redeem Rewards
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600/80">Current Streak</p>
                  <h2 className="text-3xl font-black text-blue-500 flex items-center gap-2 mt-1">
                    {user.streak}
                    <span className="text-sm font-bold text-blue-400 mt-1">Days</span>
                  </h2>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Flame className="w-6 h-6 text-blue-500 fill-blue-500" />
                </div>
              </div>
              <div className="flex gap-1 mt-2 justify-between">
                 {STREAK_DATA.map((d, i) => (
                   <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${d.active ? 'bg-blue-500 text-white' : 'bg-blue-200 text-blue-400'}`}>
                     {d.day}
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="journey" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 h-auto flex-wrap justify-start w-full md:w-auto">
            <TabsTrigger value="journey" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Target className="w-4 h-4" /> My Journey
            </TabsTrigger>
            <TabsTrigger value="badges" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Award className="w-4 h-4" /> Badges & Trophies
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Trophy className="w-4 h-4" /> Community Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journey" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Col: Big Dreams Progress */}
               <div className="lg:col-span-2 space-y-6">
                 <h3 className="font-serif text-xl font-bold text-muted-foreground flex items-center gap-2">
                   <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> 11 Big Dreams Progress
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {LOVE_CODE_AREAS.map((area) => (
                     <Card key={area.id} className="border-none shadow-sm hover:shadow-md transition-all group">
                       <CardContent className="p-4">
                         <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${area.color}`} />
                             <span className="font-bold text-sm uppercase text-muted-foreground">{area.name}</span>
                           </div>
                           <span className="text-sm font-bold" style={{ color: area.hex }}>{area.progress}%</span>
                         </div>
                         <div className="h-2 bg-muted rounded-full overflow-hidden">
                           <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${area.progress}%`, backgroundColor: area.hex }} />
                         </div>
                         <p className="mt-3 text-xs text-muted-foreground italic line-clamp-1 group-hover:line-clamp-none transition-all">
                           "{area.dream}"
                         </p>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </div>

               {/* Right Col: Next Rewards */}
               <div className="space-y-6">
                 <h3 className="font-serif text-xl font-bold text-muted-foreground flex items-center gap-2">
                   <Gift className="w-5 h-5 text-pink-400" /> Next Rewards
                 </h3>
                 <Card className="border-none shadow-sm bg-muted/30">
                   <CardContent className="p-6 space-y-6">
                     <div className="flex gap-4 items-start opacity-50">
                       <div className="w-10 h-10 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
                         <Zap className="w-5 h-5 text-muted-foreground" />
                       </div>
                       <div>
                         <h4 className="font-bold text-sm">7-Day Streak Bonus</h4>
                         <p className="text-xs text-muted-foreground mt-1">Earn 500 Sats for maintaining a 7-day practice streak.</p>
                         <div className="flex items-center gap-2 mt-2">
                            <Progress value={100} className="h-1.5 w-24" />
                            <span className="text-[10px] font-bold text-green-600">CLAIMED</span>
                         </div>
                       </div>
                     </div>

                     <div className="flex gap-4 items-start">
                       <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 text-2xl">
                         📦
                       </div>
                       <div>
                         <h4 className="font-bold text-sm">Mystery Box (Level 13)</h4>
                         <p className="text-xs text-muted-foreground mt-1">Unlock a special digital collectible when you reach Level 13.</p>
                         <div className="flex items-center gap-2 mt-2">
                            <Progress value={75} className="h-1.5 w-24" />
                            <span className="text-[10px] font-bold text-muted-foreground">75%</span>
                         </div>
                       </div>
                     </div>

                     <div className="flex gap-4 items-start">
                       <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 text-2xl">
                         🧘‍♀️
                       </div>
                       <div>
                         <h4 className="font-bold text-sm">Mind Master Badge</h4>
                         <p className="text-xs text-muted-foreground mt-1">Complete 30 days of meditation practices.</p>
                         <div className="flex items-center gap-2 mt-2">
                            <Progress value={45} className="h-1.5 w-24" />
                            <span className="text-[10px] font-bold text-muted-foreground">14/30</span>
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>
             </div>
          </TabsContent>

          <TabsContent value="badges">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {/* Earned Badges */}
              <div className="flex flex-col items-center text-center gap-3 group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-200 flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform">
                   ⚡️
                </div>
                <div>
                  <h4 className="font-bold text-sm">Zap Queen</h4>
                  <p className="text-[10px] text-muted-foreground">Sent 10k Sats</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 border-4 border-blue-200 flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform">
                   🚀
                </div>
                <div>
                  <h4 className="font-bold text-sm">Early Adopter</h4>
                  <p className="text-[10px] text-muted-foreground">Joined in Beta</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-green-200 flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform">
                   ✅
                </div>
                <div>
                  <h4 className="font-bold text-sm">Mission Accomplished</h4>
                  <p className="text-[10px] text-muted-foreground">Completed 1st Mission</p>
                </div>
              </div>

              {/* Locked Badges */}
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                 <div key={i} className="flex flex-col items-center text-center gap-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all cursor-not-allowed">
                  <div className="w-24 h-24 rounded-full bg-muted border-4 border-muted-foreground/20 flex items-center justify-center text-2xl shadow-inner">
                     🔒
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-muted-foreground">Locked Badge</h4>
                    <p className="text-[10px] text-muted-foreground">Keep playing to unlock</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y">
                  {LEADERBOARD_DATA.map((player, index) => (
                    <div key={player.id} className={`flex items-center justify-between p-4 hover:bg-muted/30 transition-colors ${player.id === user.id ? 'bg-love-body/5' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center font-black text-lg ${index < 3 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                          #{index + 1}
                        </div>
                        <div className="relative">
                          <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                          {index === 0 && <div className="absolute -top-2 -right-1 text-lg">👑</div>}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm flex items-center gap-2">
                            {player.name} 
                            {player.id === user.id && <span className="text-[10px] bg-love-body text-white px-1.5 py-0.5 rounded-full">YOU</span>}
                          </h4>
                          <p className="text-xs text-muted-foreground">{player.level}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                         <div className="text-right hidden sm:block">
                           <div className="text-xs font-bold text-orange-500">{player.streak} Day Streak</div>
                         </div>
                         <div className="text-right min-w-[100px]">
                           <div className="font-black text-love-body">{player.sats.toLocaleString()}</div>
                           <div className="text-[10px] font-bold text-muted-foreground uppercase">Total XP</div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </Layout>
  );
}