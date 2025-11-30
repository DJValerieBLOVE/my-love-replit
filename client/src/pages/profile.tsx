import Layout from "@/components/layout";
import { CURRENT_USER } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Share2, Award, Trophy, Target } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeroBg from "@assets/generated_images/hero_background.png";

export default function Profile() {
  return (
    <Layout>
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 w-full overflow-hidden">
          <img src={HeroBg} alt="Cover" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={CURRENT_USER.avatar} />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 mb-2">
              <h1 className="text-2xl font-bold font-serif text-muted-foreground">{CURRENT_USER.name}</h1>
              <p className="text-muted-foreground">{CURRENT_USER.handle}</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium border border-primary/20">
                  Level 12 {CURRENT_USER.level}
                </span>
                <span className="bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium border border-orange-500/20">
                  {CURRENT_USER.sats.toLocaleString()} Sats
                </span>
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
              <Button variant="outline" size="icon"><Settings className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2 text-blue-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold">{CURRENT_USER.streak}</span>
                <span className="text-xs text-muted-foreground">Day Streak</span>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2 text-purple-600">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold">{CURRENT_USER.badges.length}</span>
                <span className="text-xs text-muted-foreground">Badges Earned</span>
              </CardContent>
            </Card>

            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2 text-green-600">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold">85%</span>
                <span className="text-xs text-muted-foreground">Goal Completion</span>
              </CardContent>
            </Card>
          </div>

          <h2 className="font-bold text-lg mb-4 text-muted-foreground">Badges</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {CURRENT_USER.badges.map((badge, i) => (
              <div key={i} className="aspect-square rounded-xs bg-muted/50 flex flex-col items-center justify-center p-2 text-center gap-2 hover:bg-muted transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium leading-tight">{badge}</span>
              </div>
            ))}
            <div className="aspect-square rounded-xs border-2 border-dashed border-muted flex flex-col items-center justify-center p-2 text-center gap-2 opacity-50">
              <div className="w-12 h-12 rounded-full bg-muted" />
              <span className="text-xs">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
