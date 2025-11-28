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
  Menu,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CURRENT_USER, CLUBS, MISSIONS, LOVE_CODE_AREAS } from "@/lib/mock-data";
import Logo from "../assets/11x_love_logo.png";
import BitcoinIcon from "../assets/bitcoin_icon.png";
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
            {/* Wallet Balance */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full border border-orange-400/40 hover:border-orange-400/60 transition-colors cursor-pointer">
              <img src={BitcoinIcon} alt="Bitcoin" className="w-5 h-5 rounded-full" />
              <span className="font-black text-sm text-orange-500">{CURRENT_USER.walletBalance.toLocaleString()}</span>
              <span className="text-xs font-black text-orange-500">Sats</span>
            </div>

            {/* Inbox */}
            <Button variant="ghost" size="icon" className="rounded-full relative" data-testid="button-inbox">
              <Mail className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" data-testid="notification-dot-inbox"></span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="rounded-full relative" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" data-testid="notification-dot-bell"></span>
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
        <aside className="hidden xl:flex flex-col w-[320px] border-l bg-card/50 p-6 gap-6 overflow-y-auto">
          {/* Widget 1: Magic Mentor Hub */}
          <div className="bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-purple-900/20 rounded-2xl border border-purple-400/30 p-6 text-center overflow-hidden relative group cursor-pointer hover:border-purple-400/50 transition-all shadow-lg" data-testid="widget-mentor">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/30 to-pink-500/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:from-purple-500/40 group-hover:to-pink-500/30 transition-all" />
            
            <div className="relative z-10">
              {/* VIP Level Badge */}
              <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/50 rounded-full px-3 py-1.5 mb-4">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-bold text-yellow-300">Level 12 Lumina Guide</span>
              </div>

              {/* Mentor Image */}
              <div className="relative inline-block mb-5 mt-3">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 blur-2xl opacity-50 rounded-full" />
                <img src={MagicMentor} alt="Magic Mentor" className="w-28 h-28 rounded-full border-3 border-yellow-400/50 relative z-10 shadow-2xl" />
              </div>

              {/* Mentor Info */}
              <h3 className="font-bold text-lg font-serif mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Your Lumina Guide</h3>
              <p className="text-xs text-purple-200 mb-2 italic">"You're crushing your Soul mission, Sarah!"</p>
              
              {/* Level Progress */}
              <div className="mt-5 space-y-2 bg-black/20 rounded-xl p-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-yellow-300 font-semibold">Progress to Guide Master</span>
                  <span className="font-black text-yellow-300">65%</span>
                </div>
                <Progress value={65} className="h-2 bg-purple-900/50" />
              </div>

              {/* Ask Mentor Button */}
              <Button 
                onClick={() => setIsAiOpen(true)}
                className="w-full mt-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all hover:shadow-xl border border-purple-400/40"
                data-testid="button-ask-mentor"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Ask Mentor
              </Button>
            </div>
          </div>

          {/* Widget 2: Stats Hub */}
          <div className="space-y-4" data-testid="widget-stats">
            {/* Wallet */}
            <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/20 rounded-xl border border-orange-400/30 p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <img src={BitcoinIcon} alt="Bitcoin" className="w-5 h-5 rounded-full" />
                <span className="text-xs font-bold text-orange-300 uppercase">Wallet</span>
              </div>
              <p className="text-2xl font-black text-orange-400">{CURRENT_USER.walletBalance.toLocaleString()}</p>
              <p className="text-xs text-orange-200">Sats Available</p>
            </div>

            {/* Streak */}
            <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/20 rounded-xl border border-orange-400/30 p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400 fill-current" />
                  <h4 className="font-bold text-xs uppercase text-orange-300">Streak</h4>
                </div>
                <span className="text-2xl font-black text-orange-400">{CURRENT_USER.streak}</span>
              </div>
              <div className="flex justify-between gap-1">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className={cn(
                    "flex-1 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all",
                    i < 5 ? "bg-orange-500 text-white shadow-md" : "bg-muted/50 text-muted-foreground"
                  )}>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* VIP Level */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl border border-purple-400/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <h4 className="font-bold text-xs uppercase text-purple-300">VIP Level</h4>
              </div>
              <p className="text-lg font-bold text-purple-300 mb-2">Level 12</p>
              <Progress value={65} className="h-2 bg-purple-900/50" />
              <p className="text-xs text-purple-200 mt-1">65% to Guide Master</p>
            </div>

            {/* Next Mission */}
            <div>
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">Up Next Mission</h4>
              <div className="bg-card rounded-xl overflow-hidden border border-border group cursor-pointer hover:border-primary transition-colors shadow-sm">
                <div className="h-20 bg-black/50 relative">
                  <img src={Course1} className="w-full h-full object-cover opacity-75 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white font-bold text-xs">Finance Sovereignty</div>
                </div>
                <div className="p-2.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold text-mission">25%</span>
                  </div>
                  <Progress value={25} className="h-1.5" />
                </div>
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
