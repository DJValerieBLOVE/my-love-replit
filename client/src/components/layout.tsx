import { Link, useLocation } from "wouter";
import { 
  Home, 
  LayoutGrid, 
  Book, // Changed from BookOpen
  Wallet, 
  User, 
  Bell,
  Settings,
  Calendar,
  Search,
  Target,
  Sparkles,
  Zap,
  FlaskConical, // Changed from Rocket
  Trophy,
  Menu,
  Mail,
  Wrench, // Added
  Music   // Added
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CURRENT_USER, CLUBS, EXPERIMENTS, LOVE_CODE_AREAS } from "@/lib/mock-data";
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
import { Card } from "@/components/ui/card";
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
    { icon: Target, label: "Big Dreams", href: "/big-dreams" },
    { icon: FlaskConical, label: "Experiments", href: "/experiments" },
    { icon: Wrench, label: "My Toolbox", href: "/toolbox" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: LayoutGrid, label: "Community", href: "/community" },
    { icon: Music, label: "Resources", href: "/resources" },
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
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 cursor-pointer group font-medium sidebar-menu text-base",
                  isActive 
                    ? "bg-white dark:bg-white/5 text-primary shadow-md shadow-primary/10 border border-primary/10 font-bold" 
                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-primary hover:shadow-sm hover:translate-x-1"
                )}>
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "fill-current opacity-100")} />
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
        <aside className="hidden lg:flex flex-col w-[280px] border-l bg-card/50 p-4 gap-4 overflow-y-auto">
          {/* Widget 1: Magic Mentor */}
          <div className="bg-gradient-to-br from-purple-900/50 via-purple-800/40 to-pink-900/30 rounded-xs border border-purple-500/40 p-4 overflow-hidden relative group cursor-pointer hover:border-purple-500/60 transition-all shadow-md" data-testid="widget-mentor">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/40 to-pink-500/30 rounded-full -mr-12 -mt-12 blur-2xl group-hover:from-purple-500/50 group-hover:to-pink-500/40 transition-all" />
            
            <div className="relative z-10 flex flex-col">
              {/* Image and Badge on same line */}
              <div className="flex items-center justify-center gap-2 mb-3">
                {/* Mentor Image */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 blur-xl opacity-40 rounded-full" />
                  <img src={MagicMentor} alt="Magic Mentor" className="w-16 h-16 rounded-full border-3 border-purple-300 relative z-10 shadow-lg object-cover" />
                </div>
                
                {/* VIP Level Badge */}
                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-2 py-1">
                  <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-white">Level <span className="text-yellow-300 font-black">12</span></span>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-base text-purple-50 mb-3 italic font-bold text-center">"Rock Your Dreams!"</p>

              {/* Ask Magic Mentor Button */}
              <Button 
                onClick={() => setIsAiOpen(true)}
                className="w-full bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold rounded-lg transition-all hover:shadow-lg border-0 border-b border-white/50 h-8 shadow-lg shadow-primary/40"
                data-testid="button-ask-mentor"
              >
                <Sparkles className="w-4 h-4 mr-1.5" /> Ask Magic Mentor
              </Button>
            </div>
          </div>

          {/* Widget 2: Streaks */}
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xs border border-orange-400/40 hover:border-orange-400/60 transition-colors p-4" data-testid="widget-streaks">
            {/* Header + Days on one line */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500 fill-current" />
                <h4 className="font-bold text-xs uppercase text-orange-500">Streak</h4>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-orange-500">{CURRENT_USER.streak}</span>
                <span className="text-xs font-bold text-orange-600">Days</span>
              </div>
            </div>

            {/* Day Circles */}
            <div className="flex justify-between gap-1.5">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  i < 5 ? "bg-orange-500 text-white shadow-md" : "bg-orange-400/40 text-orange-700 border-2 border-orange-400/60 font-bold"
                )}>
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Current Focus */}
          <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card" data-testid="widget-focus">
            <div className="p-4">
              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Current Focus</h4>
              <p className="text-sm font-semibold text-foreground mb-1">Finance Sovereignty</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">80%</p>
                <div className="w-16 bg-muted rounded-full h-1.5">
                  <div className="bg-[#00d81c] h-1.5 rounded-full w-4/5"></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Widget 4: Upcoming Event */}
          <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card" data-testid="widget-event">
            <div className="p-4">
              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Upcoming Event</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Full Moon Ceremony</p>
                  <p className="text-xs text-muted-foreground">Nov 30</p>
                </div>
                <span className="text-lg">🌙</span>
              </div>
            </div>
          </Card>

          {/* Widget 5: Poll of the Day */}
          <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card" data-testid="widget-poll">
            <div className="p-4">
              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Poll of the Day</h4>
              <p className="text-xs text-foreground mb-3">What area needs focus?</p>
              <div className="space-y-1.5">
                {['Health', 'Relationships', 'Career'].map((option, i) => (
                  <button key={i} className="w-full text-left text-xs py-1 px-2 rounded-xs bg-muted hover:bg-muted/80 transition-colors text-foreground hover:text-primary font-medium">
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Widget 6: Who to Follow */}
          <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card" data-testid="widget-follow">
            <div className="p-4">
              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-3">Who to Follow</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                    👤
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Alex Luna</p>
                    <p className="text-[10px] text-muted-foreground">@alexluna</p>
                  </div>
                </div>
                <Button className="bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold text-xs rounded-lg px-6 py-1 h-7 border-0" data-testid="button-follow">
                  Follow
                </Button>
              </div>
            </div>
          </Card>
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
