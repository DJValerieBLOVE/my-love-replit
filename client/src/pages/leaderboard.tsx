import Layout from "@/components/layout";
import { LEADERBOARD_DATA, CURRENT_USER } from "@/lib/mock-data";
import { Trophy, Zap, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "from-yellow-500/30 to-orange-500/20";
    if (rank === 2) return "from-gray-400/30 to-slate-500/20";
    if (rank === 3) return "from-orange-600/30 to-amber-700/20";
    return "from-purple-900/20 to-pink-900/10";
  };

  const currentUserRank = LEADERBOARD_DATA.findIndex(u => u.id === CURRENT_USER.id) + 1;
  const currentUserData = LEADERBOARD_DATA.find(u => u.id === CURRENT_USER.id);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-serif font-bold text-muted-foreground">Leaderboard</h1>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-muted-foreground text-lg">Compete with the community • Level up together</p>
        </div>

        {/* Your Rank Card */}
        {currentUserData && (
          <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/10 border-purple-400/30 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-black text-yellow-400 mb-1">#{currentUserRank}</div>
                    <span className="text-xs font-bold text-purple-300 uppercase">Your Rank</span>
                  </div>
                  <div className="h-12 w-px bg-gradient-to-b from-purple-400/0 via-purple-400/50 to-purple-400/0" />
                  <div>
                    <p className="font-bold text-lg">{CURRENT_USER.name}</p>
                    <p className="text-sm text-muted-foreground">{currentUserData.level}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-2 justify-end">
                    <Trophy className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-black text-yellow-400">{currentUserData.sats.toLocaleString()}</span>
                    <span className="text-xs text-yellow-300">Sats</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs font-bold text-purple-300">{currentUserData.streak}</span>
                    <span className="text-xs text-purple-300 uppercase">Day Streak</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Table */}
        <div className="space-y-2">
          <h2 className="font-bold text-lg px-2 text-muted-foreground">Top Guides</h2>
          <div className="space-y-3">
            {LEADERBOARD_DATA.map((user, index) => {
              const rank = index + 1;
              const medal = getRankBadge(rank);
              const isCurrent = user.id === CURRENT_USER.id;
              
              return (
                <div
                  key={user.id}
                  className={cn(
                    "bg-gradient-to-r p-4 rounded-xs border transition-all group cursor-pointer hover:shadow-lg",
                    isCurrent
                      ? `${getMedalColor(rank)} border-purple-400/40 shadow-md`
                      : `${getMedalColor(rank)} border-white/10`
                  )}
                  data-testid={`leaderboard-row-${rank}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank */}
                      <div className="text-center min-w-12">
                        {medal ? (
                          <span className="text-3xl">{medal}</span>
                        ) : (
                          <span className="font-black text-lg text-muted-foreground">#{rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className={cn(
                        "h-12 w-12 border-2",
                        rank === 1 ? "border-yellow-400" : rank === 2 ? "border-gray-400" : rank === 3 ? "border-orange-600" : "border-purple-400"
                      )}>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-base">{user.name}</p>
                          {user.badges && user.badges.length > 0 && (
                            <Award className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.level} • {user.streak} day streak</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 ml-4">
                      {/* Sats */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <Trophy className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                          <span className="font-black text-yellow-400">{user.sats.toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-yellow-300">Sats</span>
                      </div>

                      {/* Tips Button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "rounded-full px-3 text-xs font-bold transition-all",
                          isCurrent 
                            ? "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30" 
                            : "bg-pink-600/20 text-pink-400 hover:bg-pink-600/30"
                        )}
                        data-testid={`button-tip-${rank}`}
                      >
                        💝 Tip
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
          <Card className="bg-card rounded-xs shadow-sm border-none">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-blue-400">{LEADERBOARD_DATA.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Guides</p>
            </CardContent>
          </Card>
          <Card className="bg-card rounded-xs shadow-sm border-none">
            <CardContent className="p-4 text-center">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-yellow-400">{Math.max(...LEADERBOARD_DATA.map(u => u.sats)).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Highest Sats</p>
            </CardContent>
          </Card>
          <Card className="bg-card rounded-xs shadow-sm border-none">
            <CardContent className="p-4 text-center">
              <Zap className="w-5 h-5 text-orange-400 mx-auto mb-2 fill-current" />
              <p className="text-2xl font-black text-orange-400">{Math.max(...LEADERBOARD_DATA.map(u => u.streak))}</p>
              <p className="text-xs text-muted-foreground mt-1">Best Streak</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
