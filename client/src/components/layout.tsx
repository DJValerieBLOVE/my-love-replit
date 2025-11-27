import { Link, useLocation } from "wouter";
import { 
  Home, 
  LayoutGrid, 
  BookOpen, 
  Wallet, 
  User, 
  Menu, 
  Bell,
  Settings,
  Calendar,
  Search,
  ChevronDown,
  ChevronRight,
  Hash,
  GraduationCap,
  Bot,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CURRENT_USER, SPACES, COURSES } from "@/lib/mock-data";
import Logo from "@assets/generated_images/app_logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { AiBuddy } from "@/components/ai-buddy";
import BuddyAvatar from "@assets/generated_images/ai_buddy_avatar.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isCommunityOpen, setIsCommunityOpen] = useState(true);
  const [isCoursesOpen, setIsCoursesOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const desktopNav = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Wallet, label: "Wallet", href: "/wallet" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  const mobileNav = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Target, label: "Goals", href: "#", action: () => setIsAiOpen(true) },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: LayoutGrid, label: "Groups", href: "/community" },
    { icon: BookOpen, label: "Courses", href: "/courses" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <ThemeCustomizer />
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 px-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Lumina" className="w-8 h-8 rounded-full" />
            <span className="font-serif font-bold text-xl tracking-tight">Lumina</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="w-5 h-5 text-muted-foreground" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer border-2 border-primary/20">
                <AvatarImage src={CURRENT_USER.avatar} />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/wallet">
                <DropdownMenuItem className="cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Wallet</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>


      <div className="flex h-screen pt-16 lg:pt-0 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-[280px] border-r bg-card h-full">
          <div className="p-6 pb-2">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer mb-6">
                <img src={Logo} alt="Lumina" className="w-8 h-8 rounded-full shadow-md" />
                <span className="font-serif font-bold text-2xl tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Lumina</span>
              </div>
            </Link>
          </div>

          <ScrollArea className="flex-1 px-4">
            <nav className="space-y-1 pb-4">
              {desktopNav.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer group text-sm font-medium",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}>
                      <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-4 mt-2">
              {/* Community Spaces Dropdown */}
              <Collapsible open={isCommunityOpen} onOpenChange={setIsCommunityOpen}>
                <div className="flex items-center justify-between px-3 py-1 mb-1 group cursor-pointer" onClick={() => setIsCommunityOpen(!isCommunityOpen)}>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Community</span>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      {isCommunityOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-1">
                  <Link href="/community">
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer group text-sm pl-6",
                      location === "/community" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}>
                      <LayoutGrid className="w-4 h-4" />
                      <span>All Spaces</span>
                    </div>
                  </Link>
                  {SPACES.map((space) => (
                    <div key={space.id} className="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer group text-sm text-muted-foreground hover:bg-muted hover:text-foreground pl-6">
                      <div className={cn("w-2.5 h-2.5 rounded-full", space.color.replace('text-', 'bg-'))} />
                      <span className="truncate">{space.name}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Courses Dropdown */}
              <Collapsible open={isCoursesOpen} onOpenChange={setIsCoursesOpen}>
                <div className="flex items-center justify-between px-3 py-1 mb-1 group cursor-pointer" onClick={() => setIsCoursesOpen(!isCoursesOpen)}>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">Courses</span>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      {isCoursesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-1">
                   <Link href="/courses">
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer group text-sm pl-6",
                      location === "/courses" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}>
                      <BookOpen className="w-4 h-4" />
                      <span>All Courses</span>
                    </div>
                  </Link>
                  {COURSES.map((course) => (
                    <div key={course.id} className="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer group text-sm text-muted-foreground hover:bg-muted hover:text-foreground pl-6">
                      <GraduationCap className="w-4 h-4" />
                      <span className="truncate">{course.title}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
          
          {/* AI Buddy Widget in Sidebar */}
          <div className="px-1">
            <AiBuddy />
          </div>

          <div className="p-4 border-t mt-2">
            <Link href="/profile">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={CURRENT_USER.avatar} />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-sm truncate">{CURRENT_USER.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{CURRENT_USER.handle}</p>
                </div>
                <Settings className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] lg:h-screen pb-20 lg:pb-0 bg-background/50">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t z-50 flex items-center justify-around px-2">
        {mobileNav.map((item) => {
          const isActive = location === item.href;
          const Content = (
            <div className="flex flex-col items-center justify-center w-16 h-full cursor-pointer" onClick={item.action}>
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
          );

          if (item.action) {
            return <div key={item.label}>{Content}</div>;
          }

          return (
            <Link key={item.href} href={item.href}>
              {Content}
            </Link>
          );
        })}
      </nav>
      
      {/* Hidden AiBuddy Trigger for Mobile Nav */}
      <AiBuddy open={isAiOpen} onOpenChange={setIsAiOpen} />
    </div>
  );
}
