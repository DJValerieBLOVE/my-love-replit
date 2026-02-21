import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users,
  Calendar,
  Flame,
  Sparkles,
  Heart,
  LogOut,
  BookOpen,
  Zap,
  Settings,
  HelpCircle,
  Radio,
  User,
  FlaskConical,
  KeyRound,
  Menu,
  X,
  Bell,
  Mail,
  PenSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import BitcoinIcon from "../assets/bitcoin_icon.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { useState, useRef, useCallback } from "react";
import { AiBuddy } from "@/components/ai-buddy";
import { useNostr } from "@/contexts/nostr-context";
import { NostrLoginDialog } from "@/components/nostr-login-dialog";
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
import { MembershipBadge } from "@/components/membership-gate";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isConnected, profile, userStats, disconnect, isAdmin, isLoading, needsProfileCompletion, markProfileComplete } = useNostr();

  const openProfileMenu = useCallback(() => {
    if (profileMenuTimeout.current) clearTimeout(profileMenuTimeout.current);
    setProfileMenuOpen(true);
  }, []);

  const closeProfileMenu = useCallback(() => {
    profileMenuTimeout.current = setTimeout(() => setProfileMenuOpen(false), 200);
  }, []);

  const desktopNavLinks = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Flame, label: "Big Dreams", href: "/big-dreams" },
    { icon: FlaskConical, label: "Experiments", href: "/experiments" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Users, label: "People", href: "/people" },
    { icon: KeyRound, label: "Vault", href: "/vault" },
    { icon: Heart, label: "Love Board", href: "/leaderboard" },
  ];

  const mobileNavLinks = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Flame, label: "Big Dreams", href: "/big-dreams" },
    { icon: FlaskConical, label: "Experiments", href: "/experiments" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Users, label: "People", href: "/people" },
    { icon: KeyRound, label: "Vault", href: "/vault" },
    { icon: Heart, label: "Love Board", href: "/leaderboard" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#E0CCF5] flex flex-col">
      <ThemeCustomizer />
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b px-3 md:px-4 h-14 md:h-20 flex items-center justify-between" style={{ backgroundColor: '#ffffff' }}>
          {/* LEFT: Hamburger menu on mobile, Logo+Text on desktop */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile: Hamburger menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#F0F0F0] transition-colors"
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
                <span className="font-serif font-normal text-xl tracking-tight text-muted-foreground">My Masterpiece</span>
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

          {/* RIGHT: Sats + Bell + Mail + Avatar */}
          <div className="flex items-center gap-1 md:gap-3">
            {/* Desktop: Sats display */}
            <Link href="/wallet" className="hidden lg:block">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#FFF5EB] to-[#FFFBEB] rounded-full border border-[#FBC88B] hover:border-[#F5A84D] transition-colors cursor-pointer" data-testid="sats-display">
                <img src={BitcoinIcon} alt="Bitcoin" className="w-5 h-5 rounded-full" />
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1" data-testid="sats-given">
                    <span className="text-orange-600 font-normal">↑</span>
                    <span className="text-orange-600">{userStats?.satsGiven?.toLocaleString() || 0}</span>
                  </div>
                  <span className="text-[#C4C4C4]">|</span>
                  <div className="flex items-center gap-1" data-testid="sats-received">
                    <span className="text-green-600 font-normal">↓</span>
                    <span className="text-green-600">{userStats?.satsReceived?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Notification Bell */}
            <button
              className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-[#F0E6FF] transition-colors"
              aria-label="Notifications"
              data-testid="button-notifications"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>

            {/* Messages */}
            <button
              className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-[#F0E6FF] transition-colors"
              aria-label="Messages"
              data-testid="button-messages"
            >
              <Mail className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>

            {isLoading ? (
              <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-muted animate-pulse" />
            ) : isConnected ? (
              <div
                className="relative"
                onMouseEnter={openProfileMenu}
                onMouseLeave={closeProfileMenu}
                data-testid="profile-menu-container"
              >
                <Avatar
                  className="h-8 w-8 md:h-9 md:w-9 shrink-0 cursor-pointer ring-2 ring-[#D9CCE6] transition-all hover:ring-[#6600ff]"
                  onClick={() => setProfileMenuOpen(prev => !prev)}
                  data-testid="avatar-user"
                >
                  <AvatarImage src={profile?.picture} />
                  <AvatarFallback>{profile?.name?.[0] || profile?.npub?.slice(-2).toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 z-50 rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                    <div className="flex flex-col px-2 py-1.5">
                      <span className="text-sm font-medium">{profile?.name || "Nostr User"}</span>
                      <span className="text-xs font-normal text-muted-foreground truncate">
                        {profile?.npub?.slice(0, 12)}...{profile?.npub?.slice(-4)}
                      </span>
                      {isAdmin && (
                        <span className="text-xs text-love-family font-normal mt-1">Admin</span>
                      )}
                      <MembershipBadge />
                    </div>
                    <div className="h-px bg-border my-1" />
                    <Link href="/profile" onClick={() => setProfileMenuOpen(false)}>
                      <div className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent" data-testid="menu-item-profile">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                        Profile
                      </div>
                    </Link>
                    <Link href="/wallet" onClick={() => setProfileMenuOpen(false)}>
                      <div className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent" data-testid="menu-item-wallet">
                        <Zap className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                        Wallet
                      </div>
                    </Link>
                    <div className="h-px bg-border my-1" />
                    <Link href="/settings" onClick={() => setProfileMenuOpen(false)}>
                      <div className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent" data-testid="menu-item-settings">
                        <Settings className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                        Settings
                      </div>
                    </Link>
                    <Link href="/relays" onClick={() => setProfileMenuOpen(false)}>
                      <div className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent" data-testid="menu-item-relays">
                        <Radio className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                        Relays
                      </div>
                    </Link>
                    <Link href="/how-to-use" onClick={() => setProfileMenuOpen(false)}>
                      <div className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent" data-testid="menu-item-how-to-use">
                        <HelpCircle className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                        How to Use
                      </div>
                    </Link>
                    <div className="h-px bg-border my-1" />
                    <div
                      onClick={() => { setProfileMenuOpen(false); disconnect(); }}
                      className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer text-red-600 hover:bg-accent"
                      data-testid="menu-item-disconnect"
                    >
                      <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Disconnect
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setLoginDialogOpen(true)}
                className="text-xs md:text-sm px-3 md:px-4 h-8 md:h-9"
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

      <div className="flex-1 flex">
        {/* Left Sidebar (Navigation) - Desktop only, sticky */}
        <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r p-4 gap-2 sticky top-14 md:top-20 self-start h-[calc(100vh-56px)] md:h-[calc(100vh-80px)] overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
          {desktopNavLinks.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-1.5 rounded-lg transition-all duration-200 cursor-pointer group font-serif sidebar-menu text-base",
                  isActive 
                    ? "text-[#6600ff]" 
                    : "text-muted-foreground hover:text-[#6600ff]"
                )}>
                  <item.icon 
                    strokeWidth={1.5} 
                    className="w-5 h-5 transition-transform group-hover:scale-105"
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}

          <div className="mt-auto pt-4">
            <Button
              className="w-full gap-2 bg-foreground text-background hover:bg-white hover:border-[#E5E5E5] hover:text-foreground border border-transparent"
              data-testid="button-sidebar-new-post"
              onClick={() => {
                if (location === "/people") {
                  window.dispatchEvent(new CustomEvent("open-compose"));
                } else {
                  setLocation("/people?compose=true");
                }
              }}
            >
              <PenSquare className="w-4 h-4" strokeWidth={1.5} />
              New Post
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
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
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer",
                        isActive
                          ? "text-[#6600ff]"
                          : "text-muted-foreground hover:text-foreground hover:bg-[#F0E6FF]"
                      )}
                      data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className="w-5 h-5" strokeWidth={1.5} />
                      <span className="font-normal">{item.label}</span>
                    </div>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
          
          {/* Sats display in mobile menu */}
          <div className="mt-auto p-4 border-t">
            <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FFF5EB] to-[#FFFBEB] rounded-lg border border-[#FBC88B]">
                <img src={BitcoinIcon} alt="Bitcoin" className="w-5 h-5 rounded-full" />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-orange-600">↑{userStats?.satsGiven?.toLocaleString() || 0}</span>
                  <span className="text-[#C4C4C4]">|</span>
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
