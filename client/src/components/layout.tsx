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
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CURRENT_USER } from "@/lib/mock-data";
import Logo from "@assets/generated_images/app_logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeCustomizer } from "@/components/theme-customizer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: LayoutGrid, label: "Community", href: "/community" },
    { icon: BookOpen, label: "Courses", href: "/courses" },
    { icon: Wallet, label: "Wallet", href: "/wallet" },
    { icon: User, label: "Profile", href: "/profile" },
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
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
          </Button>
        </div>
      </header>

      <div className="flex h-screen pt-16 lg:pt-0 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r bg-card h-full">
          <div className="p-6">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <img src={Logo} alt="Lumina" className="w-10 h-10 rounded-full shadow-md" />
                <span className="font-serif font-bold text-2xl tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Lumina</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-2 py-4">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                    <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <Avatar>
                <AvatarImage src={CURRENT_USER.avatar} />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-sm truncate">{CURRENT_USER.name}</p>
                <p className="text-xs text-muted-foreground truncate">{CURRENT_USER.handle}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] lg:h-screen pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
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
    </div>
  );
}
