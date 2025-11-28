import { Link, useLocation } from "wouter";
import { 
  Home, 
  LayoutGrid, 
  BookOpen, 
  Wallet, 
  User, 
  Bell,
  Settings,
  Calendar,
  Search,
  Target,
  Sparkles,
  Zap,
  Rocket,
  Trophy,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CURRENT_USER, CLUBS, MISSIONS, LOVE_CODE_AREAS } from "@/lib/mock-data";
import Logo from "../assets/11x_love_logo.png";
import SatsIcon from "@assets/generated_images/sats_icon.png";
import MagicMentor from "@assets/djvalerieblove_twirling_bitcoin_goddess_colorful_vivid_psyche_4e0fb7f6-b95b-488f-9d18-eb77e7dd0a60_1_1764334332945.png";
import Course1 from "@assets/generated_images/missions_header.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { AiBuddy } from "@/components/ai-buddy";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isAiOpen, setIsAiOpen] = useState(false);

  const navLinks = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Rocket, label: "Missions", href: "/courses" },
    { icon: LayoutGrid, label: "Clubs", href: "/community" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 flex flex-col">
      <ThemeCustomizer />
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl px-4 h-32 flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <img src={Logo} alt="11x LOVE LaB" className="w-10 h-10" />
                <span className="font-serif font-bold text-lg tracking-tight hidden md:block" style={{ color: '#0a0a0a' }}>11x LOVE LaB</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full border border-secondary/20">
              <img src={SatsIcon} alt="Sats" className="w-5 h-5" />
              <span className="font-bold text-sm text-secondary-foreground">{CURRENT_USER.walletBalance.toLocaleString()}</span>
            </div>


            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 transition-all hover:ring-primary">
                  <AvatarImage src={CURRENT_USER.avatar} />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile"><DropdownMenuItem>Profile</DropdownMenuItem></Link>
                <Link href="/wallet"><DropdownMenuItem>Wallet</DropdownMenuItem></Link>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Center EQ Visualizer (Hidden on mobile) */}
        <TooltipProvider>
          <div className="hidden md:flex items-end justify-center gap-1 flex-1 w-full max-w-2xl h-16 px-4">
            {LOVE_CODE_AREAS.map((area) => (
              <Tooltip key={area.id}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn("w-full rounded-t-lg transition-all cursor-pointer hover:shadow-lg hover:shadow-current", area.color)}
                    style={{ height: `${20 + (area.progress / 100) * 80}%` }}
                    data-testid={`eq-bar-${area.id}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="backdrop-blur-sm border border-white/20" style={{ backgroundColor: '#0a0a0a' }}>
                  <div className="text-center">
                    <p className="font-semibold text-white">{area.name}</p>
                    <p className="text-sm font-bold" style={{ color: '#a2f005' }}>{area.progress}% Complete</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Navigation) */}
        <aside className="hidden lg:flex flex-col w-[240px] border-r bg-card/50 p-4 gap-2">
          {navLinks.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group font-medium sidebar-menu text-base",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive && "fill-current opacity-50")} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {/* Right Sidebar (Gamification) */}
        <aside className="hidden xl:flex flex-col w-[300px] border-l bg-card/50 p-6 gap-6 overflow-y-auto">
          {/* Mentor Hub - Combined VIP Status + Magic Mentor */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-2xl border border-purple-500/20 p-6 text-center overflow-hidden relative group cursor-pointer hover:border-purple-500/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-purple-500/30 transition-colors" />
            
            <div className="relative z-10">
              {/* VIP Level Badge */}
              <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-3 py-1 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-300">Level 12 Guide</span>
              </div>

              {/* Mentor Image */}
              <div className="relative inline-block mb-4 mt-2">
                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-40 rounded-full" />
                <img src={MagicMentor} alt="Magic Mentor" className="w-24 h-24 rounded-full border-2 border-purple-400 relative z-10 shadow-lg" />
              </div>

              {/* Mentor Info */}
              <h3 className="font-bold text-lg font-serif mb-1">Your Magic Mentor</h3>
              <p className="text-xs text-purple-200 mb-1 italic">"You're crushing your Soul mission, Sarah!"</p>
              
              {/* Level Progress */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Progress to Guide Master</span>
                  <span className="font-bold text-yellow-300">65%</span>
                </div>
                <Progress value={65} className="h-1.5" />
              </div>

              {/* Ask Mentor Button */}
              <Button 
                onClick={() => setIsAiOpen(true)}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all hover:shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Ask Mentor
              </Button>
            </div>
          </div>

          {/* Streak Widget */}
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500 fill-current" /> Streak
              </h4>
              <span className="text-2xl font-black text-orange-500">12</span>
            </div>
            <div className="flex justify-between">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  i < 5 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Next Mission */}
          <div>
            <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Up Next</h4>
            <div className="bg-card rounded-xl overflow-hidden border border-border group cursor-pointer hover:border-primary transition-colors">
              <div className="h-24 bg-black/50 relative">
                <img src={Course1} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 left-3 text-white font-bold text-sm">Finance Sovereignty</div>
              </div>
              <div className="p-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>25%</span>
                </div>
                <Progress value={25} className="h-1.5" />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-lg border-t z-50 flex items-center justify-around px-2">
        {navLinks.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center justify-center w-16 h-full cursor-pointer">
                <div className={cn(
                  "p-1.5 rounded-full transition-all duration-200 mb-1",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}>
                  <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <AiBuddy open={isAiOpen} onOpenChange={setIsAiOpen} />
    </div>
  );
}
