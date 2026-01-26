import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users,
  Bell,
  Calendar,
  Target,
  Sparkles,
  Heart,
  Mail,
  Flame,
  Rss,
  LogOut,
  Zap,
  Settings,
  HelpCircle,
  Radio,
  User,
  GraduationCap,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CURRENT_USER } from "@/lib/mock-data";
import BitcoinIcon from "../assets/bitcoin_icon.png";
import MagicMentor from "@assets/djvalerieblove_twirling_bitcoin_goddess_colorful_vivid_psyche_4e0fb7f6-b95b-488f-9d18-eb77e7dd0a60_1_1764334332945.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { useState } from "react";
import { AiBuddy } from "@/components/ai-buddy";
import { useNostr } from "@/contexts/nostr-context";
import { NostrLoginDialog } from "@/components/nostr-login-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { EqVisualizer } from "@/components/eq-visualizer";
import { VerticalEqVisualizer } from "@/components/vertical-eq-visualizer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { isConnected, profile, disconnect, isAdmin, isLoading } = useNostr();

  const desktopNavLinks = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Target, label: "Big Dreams", href: "/big-dreams" },
    { icon: GraduationCap, label: "Grow", href: "/learning" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Users, label: "Tribe", href: "/community" },
    { icon: Wrench, label: "Toolbox", href: "/resources" },
    { icon: Heart, label: "Love Board", href: "/leaderboard" },
    { icon: Rss, label: "Feed", href: "/feed" },
  ];

  const mobileNavLinks = [
    { icon: Home, label: "Home", href: "/" },
    { icon: GraduationCap, label: "Grow", href: "/learning" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Users, label: "Tribe", href: "/community" },
    { icon: Wrench, label: "Toolbox", href: "/resources" },
    { icon: Rss, label: "Feed", href: "/feed" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 flex flex-col">
      <ThemeCustomizer />
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl px-3 md:px-4 h-14 md:h-20 flex items-center justify-between">
          {/* LEFT: Sats on mobile (goes to Love Board), Logo+Text on desktop */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile: Sats on left - now goes to Love Board */}
            <Link href="/leaderboard" className="md:hidden">
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full border border-orange-400/30" data-testid="sats-display-mobile">
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-orange-600">↑{CURRENT_USER.satsGiven?.toLocaleString() || 0}</span>
                  <span className="text-green-600">↓{CURRENT_USER.satsReceived?.toLocaleString() || 0}</span>
                </div>
              </div>
            </Link>
            {/* Desktop: Logo + Text */}
            <Link href="/" className="hidden md:block">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <EqVisualizer size={60} isLogo={true} />
                </div>
                <span className="font-serif font-bold text-xl tracking-tight text-muted-foreground">My Masterpiece</span>
              </div>
            </Link>
          </div>

          {/* CENTER: Logo on mobile (goes to Big Dreams), Vertical EQ on desktop */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Mobile: Centered logo - now goes to Big Dreams */}
            <Link href="/big-dreams" className="md:hidden">
              <EqVisualizer size={40} isLogo={true} />
            </Link>
            {/* Desktop: Vertical EQ */}
            <div className="hidden md:block pt-2">
              <VerticalEqVisualizer height={70} />
            </div>
          </div>

          {/* RIGHT: Bell, Mail, Avatar (mobile & desktop) */}
          <div className="flex items-center gap-1 md:gap-4">
            {/* Desktop: Sats display */}
            <Link href="/wallet" className="hidden md:block">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full border border-orange-400/30 hover:border-orange-400/50 transition-colors cursor-pointer" data-testid="sats-display">
                <img src={BitcoinIcon} alt="Bitcoin" className="w-5 h-5 rounded-full" />
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1" data-testid="sats-given">
                    <span className="text-orange-600 font-medium">↑</span>
                    <span className="text-orange-600">{CURRENT_USER.satsGiven?.toLocaleString() || 0}</span>
                  </div>
                  <span className="text-muted-foreground/50">|</span>
                  <div className="flex items-center gap-1" data-testid="sats-received">
                    <span className="text-green-600 font-medium">↓</span>
                    <span className="text-green-600">{CURRENT_USER.satsReceived?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Inbox - visible on both mobile and desktop */}
            <div 
                className="relative"
                onMouseEnter={() => setInboxOpen(true)}
                onMouseLeave={() => setInboxOpen(false)}
            >
            <DropdownMenu open={inboxOpen} onOpenChange={setInboxOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                    "rounded-full relative transition-colors border-none outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none data-[state=open]:bg-[#F0E6FF] data-[state=open]:text-love-body w-8 h-8 md:w-10 md:h-10",
                    inboxOpen ? "bg-[#F0E6FF] text-love-body" : "text-muted-foreground hover:bg-[#F0E6FF] hover:text-love-body"
                )} data-testid="button-inbox">
                  <Mail className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse" data-testid="notification-dot-inbox"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80" onMouseEnter={() => setInboxOpen(true)} onMouseLeave={() => setInboxOpen(false)}>
                <DropdownMenuLabel>Messages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                   {/* Mock Messages */}
                   <DropdownMenuItem className="cursor-pointer items-start gap-3 p-3 focus:bg-love-body/5 focus:text-love-body focus:shadow-sm focus:translate-x-1 transition-all duration-300">
                      <Avatar className="w-8 h-8 mt-0.5">
                        <AvatarImage src={MagicMentor} />
                        <AvatarFallback>MM</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center w-full">
                            <span className="font-bold text-sm">Magic Mentor</span>
                            <span className="text-[10px] text-muted-foreground">2m ago</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">Keep up the great work! Your consistency is inspiring. Remember to take a moment for yourself today.</p>
                      </div>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer items-start gap-3 p-3 focus:bg-love-body/5 focus:text-love-body focus:shadow-sm focus:translate-x-1 transition-all duration-300">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs mt-0.5 shrink-0">SJ</div>
                      <div className="flex flex-col gap-1">
                         <div className="flex justify-between items-center w-full">
                            <span className="font-bold text-sm">Sarah J.</span>
                            <span className="text-[10px] text-muted-foreground">1h ago</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">Are you going to the Full Moon event? I was thinking we could carpool.</p>
                      </div>
                   </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary font-medium cursor-pointer focus:bg-primary/5 focus:text-primary">
                  View All Messages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

            {/* Notifications - smaller on mobile */}
            <div 
                className="relative"
                onMouseEnter={() => setNotificationsOpen(true)}
                onMouseLeave={() => setNotificationsOpen(false)}
            >
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                    "rounded-full relative transition-colors border-none outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none data-[state=open]:bg-[#F0E6FF] data-[state=open]:text-love-body w-8 h-8 md:w-10 md:h-10",
                    notificationsOpen ? "bg-[#F0E6FF] text-love-body" : "text-muted-foreground hover:bg-[#F0E6FF] hover:text-love-body"
                )} data-testid="button-notifications">
                  <Bell className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse" data-testid="notification-dot-bell"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80" onMouseEnter={() => setNotificationsOpen(true)} onMouseLeave={() => setNotificationsOpen(false)}>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                   {/* Mock Notifications */}
                   <DropdownMenuItem className="cursor-pointer gap-3 p-3 focus:bg-love-body/5 focus:text-love-body focus:shadow-sm focus:translate-x-1 transition-all duration-300">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs leading-snug"><span className="font-bold">Streak Saved!</span> You completed your practice just in time.</p>
                        <span className="text-[10px] text-muted-foreground">Just now</span>
                      </div>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer gap-3 p-3 focus:bg-love-body/5 focus:text-love-body focus:shadow-sm focus:translate-x-1 transition-all duration-300">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs leading-snug"><span className="font-bold">Alex Luna</span> liked your discovery note.</p>
                        <span className="text-[10px] text-muted-foreground">2h ago</span>
                      </div>
                   </DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer gap-3 p-3 focus:bg-love-body/5 focus:text-love-body focus:shadow-sm focus:translate-x-1 transition-all duration-300">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs leading-snug"><span className="font-bold">Goal Met</span> You hit 80% on Finance Sovereignty!</p>
                        <span className="text-[10px] text-muted-foreground">5h ago</span>
                      </div>
                   </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary font-medium cursor-pointer focus:bg-primary/5 focus:text-primary">
                  View All Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

            {isLoading ? (
              <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-muted animate-pulse" />
            ) : isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 shrink-0 cursor-pointer ring-2 ring-primary/20 transition-all hover:ring-primary" data-testid="avatar-user">
                    <AvatarImage src={profile?.picture || CURRENT_USER.avatar} />
                    <AvatarFallback>{profile?.name?.[0] || profile?.npub?.slice(-2).toUpperCase() || "?"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span>{profile?.name || "Nostr User"}</span>
                    <span className="text-xs font-normal text-muted-foreground truncate">
                      {profile?.npub?.slice(0, 12)}...{profile?.npub?.slice(-4)}
                    </span>
                    {isAdmin && (
                      <span className="text-xs text-love-family font-medium mt-1">Admin</span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-item-profile">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/wallet">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-item-wallet">
                      <Zap className="w-4 h-4 mr-2 text-muted-foreground" />
                      Wallet
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-item-settings">
                      <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/relays">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-item-relays">
                      <Radio className="w-4 h-4 mr-2 text-muted-foreground" />
                      Relays
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/how-to-use">
                    <DropdownMenuItem className="cursor-pointer" data-testid="menu-item-how-to-use">
                      <HelpCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                      How to Use
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnect} className="text-red-600 focus:text-red-600 cursor-pointer" data-testid="menu-item-disconnect">
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setLoginDialogOpen(true)}
                className="bg-gradient-to-r from-[#6600ff] to-[#cc00ff] hover:from-[#5500dd] hover:to-[#bb00dd] text-white font-medium text-xs md:text-sm px-3 md:px-4 h-8 md:h-9"
                data-testid="button-login"
              >
                Login
              </Button>
            )}
          </div>
      </header>
      
      <NostrLoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Navigation) - Desktop only */}
        <aside className="hidden lg:flex flex-col w-[240px] border-r bg-card/50 p-4 gap-2">
          {desktopNavLinks.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-1.5 rounded-lg transition-all duration-300 cursor-pointer group font-serif sidebar-menu text-base",
                  isActive 
                    ? "bg-love-body/10 text-love-body shadow-md shadow-love-body/10 border border-love-body/10" 
                    : "text-muted-foreground hover:bg-love-body/5 hover:text-love-body hover:shadow-sm hover:translate-x-1"
                )}>
                  <item.icon strokeWidth={1.5} className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "opacity-100")} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>

      </div>

      {/* Mobile Bottom Nav - 6 icons only, no text, no 3-dot menu */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-lg border-t z-50 flex items-center justify-around px-1 safe-area-pb">
        {mobileNavLinks.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer",
                  isActive 
                    ? "bg-love-body/15 text-love-body" 
                    : "text-muted-foreground active:bg-muted/50"
                )}
                data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} strokeWidth={1.5} />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Floating Magic Mentor Button (Bottom Right) - consistent position */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#6600ff] to-[#cc00ff] shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
        aria-label="Open Magic Mentor"
        data-testid="button-magic-mentor-floating"
      >
        <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </button>

      <AiBuddy open={isAiOpen} onOpenChange={setIsAiOpen} />
    </div>
  );
}
