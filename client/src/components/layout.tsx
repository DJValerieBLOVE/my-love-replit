import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users,
  Calendar,
  Flame,
  Sparkles,
  Heart,
  Rss,
  LogOut,
  Zap,
  Settings,
  HelpCircle,
  Radio,
  User,
  FlaskConical,
  Gem,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import BitcoinIcon from "../assets/bitcoin_icon.png";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

import { EqVisualizer } from "@/components/eq-visualizer";
import { VerticalEqVisualizer } from "@/components/vertical-eq-visualizer";
import { ProfileCompletionDialog } from "@/components/profile-completion-dialog";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, profile, userStats, disconnect, isAdmin, isLoading, needsProfileCompletion, markProfileComplete } = useNostr();

  const desktopNavLinks = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Flame, label: "Big Dreams", href: "/big-dreams", hasNotification: true },
    { icon: FlaskConical, label: "Experiments", href: "/experiments", hasNotification: true },
    { icon: Calendar, label: "Events", href: "/events", hasNotification: true },
    { icon: Users, label: "Tribe", href: "/community", hasNotification: true },
    { icon: Gem, label: "Vault", href: "/vault" },
    { icon: Heart, label: "Love Board", href: "/leaderboard" },
    { icon: Rss, label: "Feed", href: "/feed" },
  ];

  const mobileNavLinks = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Flame, label: "Big Dreams", href: "/big-dreams", hasNotification: true },
    { icon: FlaskConical, label: "Experiments", href: "/experiments", hasNotification: true },
    { icon: Calendar, label: "Events", href: "/events", hasNotification: true },
    { icon: Users, label: "Tribe", href: "/community", hasNotification: true },
    { icon: Gem, label: "Vault", href: "/vault" },
    { icon: Heart, label: "Love Board", href: "/leaderboard" },
    { icon: Rss, label: "Feed", href: "/feed" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 flex flex-col">
      <ThemeCustomizer />
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl px-3 md:px-4 h-14 md:h-20 flex items-center justify-between">
          {/* LEFT: Hamburger menu on mobile, Logo+Text on desktop */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile: Hamburger menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Open menu"
              data-testid="button-mobile-menu"
            >
              <Menu className="w-6 h-6 text-muted-foreground" />
            </button>
            {/* Desktop: Logo + Text */}
            <Link href="/" className="hidden lg:block">
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
            <Link href="/big-dreams" className="lg:hidden">
              <EqVisualizer size={40} isLogo={true} />
            </Link>
            {/* Desktop: Vertical EQ */}
            <div className="hidden lg:block pt-2">
              <VerticalEqVisualizer height={70} />
            </div>
          </div>

          {/* RIGHT: Sats + Avatar */}
          <div className="flex items-center gap-1 md:gap-4">
            {/* Desktop: Sats display */}
            <Link href="/wallet" className="hidden lg:block">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-full border border-orange-400/30 hover:border-orange-400/50 transition-colors cursor-pointer" data-testid="sats-display">
                <img src={BitcoinIcon} alt="Bitcoin" className="w-5 h-5 rounded-full" />
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1" data-testid="sats-given">
                    <span className="text-orange-600 font-medium">↑</span>
                    <span className="text-orange-600">{userStats?.satsGiven?.toLocaleString() || 0}</span>
                  </div>
                  <span className="text-muted-foreground/50">|</span>
                  <div className="flex items-center gap-1" data-testid="sats-received">
                    <span className="text-green-600 font-medium">↓</span>
                    <span className="text-green-600">{userStats?.satsReceived?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </Link>

            {isLoading ? (
              <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-muted animate-pulse" />
            ) : isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 shrink-0 cursor-pointer ring-2 ring-primary/20 transition-all hover:ring-primary" data-testid="avatar-user">
                    <AvatarImage src={profile?.picture} />
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
      
      <ProfileCompletionDialog 
        open={isConnected && needsProfileCompletion} 
        onComplete={markProfileComplete}
        userName={profile?.name}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Navigation) - Desktop only */}
        <aside className="hidden lg:flex flex-col w-[240px] border-r bg-card/50 p-4 gap-2">
          {desktopNavLinks.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-1.5 rounded-lg transition-all duration-300 cursor-pointer group font-serif sidebar-menu text-base relative",
                  isActive 
                    ? "bg-love-body/10 text-love-body shadow-md shadow-love-body/10 border border-love-body/10" 
                    : "text-muted-foreground hover:bg-love-body/5 hover:text-love-body hover:shadow-sm hover:translate-x-1"
                )}>
                  <div className="relative">
                    <item.icon 
                      strokeWidth={1.5} 
                      className={cn(
                        "w-5 h-5 transition-transform group-hover:scale-110 relative z-10", 
                        isActive && "opacity-100"
                      )} 
                    />
                    {item.hasNotification && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-love-body rounded-full" data-testid={`notification-dot-${item.label.toLowerCase().replace(/\s+/g, '-')}`} />
                    )}
                  </div>
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

      {/* Mobile Slide-Out Navigation Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-3">
              <EqVisualizer size={36} isLogo={true} />
              <span className="font-serif text-lg">My Masterpiece</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-2">
            {mobileNavLinks.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <SheetClose key={item.href} asChild>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer relative",
                        isActive
                          ? "bg-love-body/10 text-love-body"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                      data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="relative">
                        <item.icon className="w-5 h-5" strokeWidth={1.5} />
                        {item.hasNotification && (
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-love-body rounded-full" />
                        )}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
          
          {/* Sats display in mobile menu */}
          <div className="mt-auto p-4 border-t">
            <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg border border-orange-400/30">
                <img src={BitcoinIcon} alt="Bitcoin" className="w-5 h-5 rounded-full" />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-orange-600">↑{userStats?.satsGiven?.toLocaleString() || 0}</span>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="text-green-600">↓{userStats?.satsReceived?.toLocaleString() || 0}</span>
                </div>
              </div>
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* Floating Magic Mentor Button (Bottom Right) */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-4 lg:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#6600ff] to-[#cc00ff] shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
        aria-label="Open Magic Mentor"
        data-testid="button-magic-mentor-floating"
      >
        <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </button>

      <AiBuddy open={isAiOpen} onOpenChange={setIsAiOpen} />
    </div>
  );
}
