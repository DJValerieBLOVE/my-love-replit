# 11x LOVE LaB Frontend Codebase Summary

This file contains the key frontend code for the 11x LOVE LaB application, designed for rapid prototyping and iteration.

## File: client/src/App.tsx
```tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Community from "@/pages/community";
import ClubDetail from "@/pages/club-detail";
import Experiments from "@/pages/experiments";
import ExperimentDetail from "@/pages/experiment-detail";
import BigDreams from "@/pages/big-dreams";
import Journal from "@/pages/journal";
import Toolbox from "@/pages/toolbox";
import Resources from "@/pages/resources";
import Wallet from "@/pages/wallet";
import Profile from "@/pages/profile";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import Leaderboard from "@/pages/leaderboard";
import AdminOnboarding from "@/pages/admin/onboarding";
import MentorStudio from "@/pages/admin/mentor-studio";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/community" component={Community} />
      <Route path="/community/:id" component={ClubDetail} />
      <Route path="/experiments" component={Experiments} />
      <Route path="/experiments/:id" component={ExperimentDetail} />
      <Route path="/big-dreams" component={BigDreams} />
      <Route path="/journal" component={Journal} />
      <Route path="/toolbox" component={Toolbox} />
      <Route path="/resources" component={Resources} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/profile" component={Profile} />
      <Route path="/events" component={Events} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/admin/onboarding" component={AdminOnboarding} />
      <Route path="/admin/mentor" component={MentorStudio} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
```

## File: client/src/index.css
```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  
  /* Updated to use direct variables (Hex support) instead of HSL wrappers */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* 11x LOVE Code Brand Colors */
  --color-love-god: #eb00a8;
  --color-love-romance: #e60023;
  --color-love-family: #ff6600;
  --color-love-community: #ffdf00;
  --color-love-mission: #a2f005;
  --color-love-money: #00d81c;
  --color-love-time: #00ccff;
  --color-love-environment: #0033ff;
  --color-love-body: #6600ff;
  --color-love-mind: #9900ff;
  --color-love-soul: #cc00ff;

  /* Solid Faint Variants (Replacement for Opacity) */
  --color-love-god-light: #FDE6F6;
  --color-love-romance-light: #FDE6E9;
  --color-love-family-light: #FFF0E6;
  --color-love-community-light: #FFFCE6;
  --color-love-mission-light: #F6FDE6;
  --color-love-money-light: #E6FDE8;
  --color-love-time-light: #E6FAFF;
  --color-love-environment-light: #E6EBFF;
  --color-love-body-light: #F0E6FF;
  --color-love-mind-light: #F5E6FF;
  --color-love-soul-light: #FAE6FF;
  
  --color-primary-light: #F0E6FF; /* Solid hex for bg-primary/10 */

  --font-sans: 'Marcellus', Georgia, sans-serif;
  --font-serif: 'Marcellus', Georgia, serif;
  
  --radius: 1.5rem;

  /* Custom Font Sizes to match Design System */
  --text-xs: 14px;
  --text-sm: 16px;
  --text-base: 17px;
  --text-lg: 20px;
  --text-xl: 22px;
  --text-2xl: 28px;
  --text-3xl: 36px;
  --text-4xl: 48px;
  --text-5xl: 60px;
}

/* 11x LOVE Code Colors - Neon/Cyber Palette */
:root {
  /* Light Mode: Clean, Modern, High Energy */
  --background: #FAFAFA;
  --foreground: #4D3D5C; /* Deep Muted Purple (Was Black) */

  --card: #FFFFFF;
  --card-foreground: #4D3D5C;

  --popover: #FFFFFF;
  --popover-foreground: #4D3D5C;

  /* Primary: Body Purple (Brand) */
  --primary: #6600ff; 
  --primary-foreground: #FFFFFF;

  /* Secondary: Cyber Gold/Orange (Sats) */
  --secondary: #FF9900;
  --secondary-foreground: #FFFFFF;

  --muted: #F5F3FF;
  --muted-foreground: #4D3D5C; /* Deep Muted Purple */

  --accent: #E0F7FA;
  --accent-foreground: #006064;

  --destructive: #EF4444;
  --destructive-foreground: #FAFAFA;

  --border: #E5E5E5;
  --input: #E5E5E5;
  --ring: #6600ff;

  --sidebar: #FFFFFF;
  --sidebar-foreground: #4D3D5C;
  --sidebar-primary: #6600ff;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #F5F3FF;
  --sidebar-accent-foreground: #6600ff;
  --sidebar-border: #E5E5E5;
  --sidebar-ring: #6600ff;
}


/* Dark Mode: Cyber Goddess, Deep Space */
.dark {
  --background: #0D001A; /* Deepest Purple Black */
  --foreground: #F3E8FF; /* Light Lavender */

  --card: #1A052E;       /* Deep Purple Card */
  --card-foreground: #F3E8FF;

  --popover: #1A052E;
  --popover-foreground: #F3E8FF;

  --primary: #9D4DFF;    /* Lighter Glowing Purple */
  --primary-foreground: #FFFFFF;

  --secondary: #FFAA33;  /* Lighter Orange */
  --secondary-foreground: #FFFFFF;

  --muted: #2D1B4E;
  --muted-foreground: #D8B4FE;

  --accent: #006064;
  --accent-foreground: #E0F7FA;

  --destructive: #7F1D1D;
  --destructive-foreground: #FAFAFA;

  --border: #4D3D5C;
  --input: #4D3D5C;
  --ring: #9D4DFF;

  --sidebar: #0D001A;
  --sidebar-foreground: #F3E8FF;
  --sidebar-primary: #9D4DFF;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #2D1B4E;
  --sidebar-accent-foreground: #9D4DFF;
  --sidebar-border: #4D3D5C;
  --sidebar-ring: #9D4DFF;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply font-sans antialiased bg-background text-foreground selection:bg-primary-light selection:text-primary;
    font-size: var(--text-base);
  }
  h1, h2, h3, h4, h5, h6, p, button, input, textarea, select {
    font-family: 'Marcellus', Georgia, serif;
  }
  
  /* Default heading sizes if no class is provided */
  h1 { font-size: var(--text-4xl); font-weight: 400; letter-spacing: -0.5px; }
  h2 { font-size: var(--text-3xl); font-weight: 400; letter-spacing: -0.3px; }
  h3 { font-size: var(--text-xl); font-weight: 400; }
  h4 { font-size: var(--text-base); font-weight: 400; }
  
  button {
    font-size: var(--text-sm);
  }
  button[size="lg"] {
    font-size: var(--text-base) !important;
  }
  input, textarea, select {
    font-size: var(--text-base);
    color: var(--foreground);
  }
}

@layer utilities {
  .sidebar-menu {
    font-size: 18px !important;
  }
  
  .glass-panel {
    @apply bg-card border border-border shadow-lg;
  }
  
  .neon-border {
    @apply border border-transparent hover:border-primary transition-colors duration-300;
  }

  .text-gradient-gold {
    @apply bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text;
  }

  .text-gradient-cyber {
    @apply bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 text-transparent bg-clip-text;
  }

  /* Calendar selected day override */
  button[data-selected-single="true"],
  button[data-range-start="true"],
  button[data-range-end="true"] {
    background-color: #6600ff !important;
    color: white !important;
  }
}
```

## File: client/src/lib/mock-data.ts
```typescript
import { 
  Users, 
  MessageSquare, 
  Zap, 
  Calendar, 
  Award, 
  BookOpen, 
  LayoutGrid, 
  Home 
} from "lucide-react";

import HeroBg from "@assets/generated_images/hero_background.png";
import Course1 from "@assets/generated_images/missions_header.png";
import Course2 from "@assets/generated_images/bitcoin_course_cover.png";
import CommunityCover from "@assets/djvalerieblove_god_bless_bitcoin_colorful_psychedelic_radiant_dc9f44e7-c040-42ca-90d3-2004a003d993_2_1764334319902.png";
import MagicMentor from "@assets/djvalerieblove_twirling_bitcoin_goddess_colorful_vivid_psyche_4e0fb7f6-b95b-488f-9d18-eb77e7dd0a60_1_1764334332945.png";

export const CURRENT_USER = {
  id: "user-1",
  name: "Sarah Jenkins",
  handle: "@sarahj",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
  sats: 12500,
  level: "Guide",
  streak: 12,
  walletBalance: 21000, // sats
  badges: ["Early Adopter", "Zap Queen", "Mission Accomplished"],
};

// 11x LOVE CODE BRAND COLORS (from Brand Guidelines)
// GOD/LOVE: #eb00a8 | Romance: #e60023 | Family: #ff6600 | Community: #ffdf00
// Mission: #a2f005 | Money: #00d81c | Time: #00ccff | Environment: #0033ff
// Body: #6600ff | Mind: #9900ff | Soul: #cc00ff
export const LOVE_CODE_AREAS = [
  { id: "god-love", name: "GOD/LOVE", color: "bg-[#eb00a8]", hex: "#eb00a8", progress: 85, dream: "To feel universally connected and lead with unconditional love in every interaction.", value: "Daily Prayer", villain: "Ego", victory: "Peace" },
  { id: "romance", name: "Romance", color: "bg-[#e60023]", hex: "#e60023", progress: 60, dream: "To build a partnership based on deep trust, wild passion, and shared growth.", value: "Date Night", villain: "Busyness", victory: "Connection" },
  { id: "family", name: "Family", color: "bg-[#ff6600]", hex: "#ff6600", progress: 75, dream: "To create a legacy of laughter, support, and freedom for my children.", value: "Dinner Together", villain: "Screens", victory: "Laughter" },
  { id: "community", name: "Community", color: "bg-[#ffdf00]", hex: "#ffdf00", progress: 90, dream: "To spark a movement where every member feels seen, heard, and valued.", value: "Outreach", villain: "Isolation", victory: "Belonging" },
  { id: "mission", name: "Mission", color: "bg-[#a2f005]", hex: "#a2f005", progress: 60, dream: "To build the 11x LOVE Lab into a global force for consciousness evolution.", value: "Focus Work", villain: "Distraction", victory: "Impact" },
  { id: "money", name: "Money", color: "bg-[#00d81c]", hex: "#00d81c", progress: 55, dream: "To achieve financial sovereignty and circulate abundance to fuel my mission.", value: "Budgeting", villain: "Scarcity", victory: "Freedom" },
  { id: "time", name: "Time", color: "bg-[#00ccff]", hex: "#00ccff", progress: 80, dream: "To master my flow state and own my calendar, not let it own me.", value: "Blocking", villain: "Overcommitment", victory: "Flow" },
  { id: "environment", name: "Environment", color: "bg-[#0033ff]", hex: "#0033ff", progress: 70, dream: "To live in a space that rejuvenates my spirit and reflects my inner clarity.", value: "Cleaning", villain: "Clutter", victory: "Serenity" },
  { id: "body", name: "Body", color: "bg-[#6600ff]", hex: "#6600ff", progress: 65, dream: "To inhabit a vessel that is strong, flexible, and vibrant with energy.", value: "Movement", villain: "Lethargy", victory: "Vitality" },
  { id: "mind", name: "Mind", color: "bg-[#9900ff]", hex: "#9900ff", progress: 80, dream: "To cultivate a mind that is sharp, curious, and peaceful amidst chaos.", value: "Meditation", villain: "Anxiety", victory: "Clarity" },
  { id: "soul", name: "Soul", color: "bg-[#cc00ff]", hex: "#cc00ff", progress: 95, dream: "To live in complete alignment with my highest truth and soul's purpose.", value: "Silence", villain: "Noise", victory: "Alignment" },
];

export const CLUBS = [
  {
    id: "space-1",
    name: "Magic Money Mamas",
    icon: Zap,
    color: "text-[hsl(35,100%,60%)]",
    description: "Bitcoin, wealth sovereignty, and financial freedom",
  },
  {
    id: "space-2",
    name: "Soulful Sisters",
    icon: Users,
    color: "text-[hsl(270,100%,65%)]",
    description: "Meditation, spirituality, and deep connection",
  },
  {
    id: "space-3",
    name: "Tech Goddesses",
    icon: MessageSquare,
    color: "text-[hsl(200,100%,60%)]",
    description: "Nostr, Lightning, and building the future",
  },
  {
    id: "space-4",
    name: "Creative Flow",
    icon: LayoutGrid,
    color: "text-[hsl(320,100%,60%)]",
    description: "Art, writing, and expressing your unique voice",
  },
];

export const FEED_POSTS = [
  {
    id: "post-1",
    author: {
      name: "Elena Rodriguez",
      handle: "@elena_r",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    },
    content: "Just finished the morning meditation session. Feeling so grounded and ready to tackle the day! 🧘‍♀️✨ #MorningRoutine #Mindfulness",
    image: CommunityCover,
    likes: 24,
    comments: 5,
    zaps: 1200, // sats
    timestamp: "2h ago",
  },
  {
    id: "post-2",
    author: {
      name: "David Chen",
      handle: "@dchen_btc",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    },
    content: "The new Bitcoin Mission is fire! 🔥 Finally understand how Lightning channels work under the hood. Highly recommend checking it out.",
    likes: 45,
    comments: 12,
    zaps: 5000,
    timestamp: "4h ago",
  },
  {
    id: "post-3",
    author: {
      name: "Sarah Jenkins",
      handle: "@sarahj",
      avatar: CURRENT_USER.avatar,
    },
    content: "Who wants to join me for a 7-day gratitude challenge starting Monday? Let's keep each other accountable! 🙌",
    likes: 18,
    comments: 8,
    zaps: 500,
    timestamp: "5h ago",
  },
  {
    id: "post-4",
    author: {
      name: "Marcus Stone",
      handle: "@mstone",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    },
    content: "Testing out the new 11x LOVE Lab features. This platform feels different... in a good way. 🚀",
    likes: 0,
    comments: 0,
    zaps: 0,
    timestamp: "Just now",
  },
];

export const STREAK_DATA = [
  { day: "M", active: true },
  { day: "T", active: true },
  { day: "W", active: true },
  { day: "T", active: false },
  { day: "F", active: true },
  { day: "S", active: true },
  { day: "S", active: false }, // Today
];
```

## File: client/src/components/layout.tsx
```tsx
import { Link, useLocation } from "wouter";
import { 
  Home, 
  LayoutGrid, 
  Book, 
  Wallet, 
  User, 
  Bell,
  Settings,
  Calendar,
  Search,
  Target,
  Sparkles,
  Zap,
  FlaskConical,
  Trophy,
  Menu,
  Mail,
  Wrench,
  Music,
  HelpCircle,
  Flame,
  Heart 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CURRENT_USER, CLUBS, EXPERIMENTS, LOVE_CODE_AREAS, STREAK_DATA } from "@/lib/mock-data";
import Logo from "../assets/11x_love_logo.png";
import BitcoinIcon from "../assets/bitcoin_icon.png";
import MagicMentor from "@assets/djvalerieblove_twirling_bitcoin_goddess_colorful_vivid_psyche_4e0fb7f6-b95b-488f-9d18-eb77e7dd0a60_1_1764334332945.png";
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
import { EqVisualizer } from "@/components/eq-visualizer";
import { VerticalEqVisualizer } from "@/components/vertical-eq-visualizer";

export default function Layout({ children, showRightSidebar = true }: { children: React.ReactNode, showRightSidebar?: boolean }) {
  const [location] = useLocation();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navLinks = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Target, label: "Big Dreams", href: "/big-dreams" },
    { icon: FlaskConical, label: "Experiments", href: "/experiments" },
    { icon: Book, label: "Lab Notes", href: "/journal" },
    { icon: Wrench, label: "My Toolbox", href: "/toolbox" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: LayoutGrid, label: "Clubs", href: "/community" },
    { icon: Music, label: "Resources", href: "/resources" },
    { icon: HelpCircle, label: "FAQs", href: "/faws" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 flex flex-col">
      <ThemeCustomizer />
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl px-4 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                {/* Replaced Image Logo with Circular EQ Visualizer */}
                <div className="relative flex items-center justify-center">
                  <EqVisualizer size={70} className="" isLogo={true} />
                </div>
                <span className="font-serif font-bold text-xl tracking-tight hidden md:block text-muted-foreground">11x LOVE LaB</span>
              </div>
            </Link>
          </div>

          {/* Center: Vertical EQ Visualizer (Sharper Corners) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pt-2">
            <VerticalEqVisualizer height={80} />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Wallet Balance */}
            <Link href="/profile">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full border border-orange-400/40 hover:border-orange-400/60 transition-colors cursor-pointer">
                <img src={BitcoinIcon} alt="Bitcoin" className="w-5 h-5 rounded-full" />
                <span className="font-black text-sm text-orange-500">{CURRENT_USER.walletBalance.toLocaleString()}</span>
                <span className="text-xs font-black text-orange-500">Sats</span>
              </div>
            </Link>

            {/* Inbox */}
            <div 
                className="relative"
                onMouseEnter={() => setInboxOpen(true)}
                onMouseLeave={() => setInboxOpen(false)}
            >
            <DropdownMenu open={inboxOpen} onOpenChange={setInboxOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                    "rounded-full relative transition-colors border-none outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none data-[state=open]:bg-[#F0E6FF] data-[state=open]:text-love-body",
                    inboxOpen ? "bg-[#F0E6FF] text-love-body" : "text-muted-foreground hover:bg-[#F0E6FF] hover:text-love-body"
                )} data-testid="button-inbox">
                  <Mail className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" data-testid="notification-dot-inbox"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80" onMouseEnter={() => setInboxOpen(true)} onMouseLeave={() => setInboxOpen(false)}>
                <DropdownMenuLabel>Messages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
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
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary font-medium cursor-pointer focus:bg-primary/5 focus:text-primary">
                  View All Messages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

            {/* Notifications */}
            <div 
                className="relative"
                onMouseEnter={() => setNotificationsOpen(true)}
                onMouseLeave={() => setNotificationsOpen(false)}
            >
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                    "rounded-full relative transition-colors border-none outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none data-[state=open]:bg-[#F0E6FF] data-[state=open]:text-love-body",
                    notificationsOpen ? "bg-[#F0E6FF] text-love-body" : "text-muted-foreground hover:bg-[#F0E6FF] hover:text-love-body"
                )} data-testid="button-notifications">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" data-testid="notification-dot-bell"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80" onMouseEnter={() => setNotificationsOpen(true)} onMouseLeave={() => setNotificationsOpen(false)}>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                   <DropdownMenuItem className="cursor-pointer gap-3 p-3 focus:bg-love-body/5 focus:text-love-body focus:shadow-sm focus:translate-x-1 transition-all duration-300">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs leading-snug"><span className="font-bold">Streak Saved!</span> You completed your practice just in time.</p>
                        <span className="text-[10px] text-muted-foreground">Just now</span>
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 shrink-0 cursor-pointer ring-2 ring-primary/20 transition-all hover:ring-primary">
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
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Navigation) */}
        <aside className="hidden lg:flex flex-col w-[240px] border-r bg-card/50 p-4 gap-2">
          {navLinks.map((item) => {
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
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {/* Right Sidebar (Gamification) */}
        {showRightSidebar && (
          <aside className="hidden lg:flex flex-col w-[320px] border-l bg-card/50 p-4 gap-4 overflow-y-auto">
            {/* Widget 1: Magic Mentor */}
            <div className="bg-gradient-to-br from-[#6600ff] to-[#cc00ff] rounded-xs border border-white/10 p-4 overflow-hidden relative group cursor-pointer hover:shadow-lg transition-all shadow-md" data-testid="widget-mentor">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-20 -mt-20 blur-3xl transition-all" />
            
            <div className="relative z-10 flex flex-col">
              {/* Image and Badge on same line */}
              <div className="flex items-center justify-center gap-2 mb-3">
                {/* Mentor Image */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                  <img src={MagicMentor} alt="Magic Mentor" className="w-16 h-16 rounded-full border-2 border-white/30 relative z-10 shadow-lg object-cover" />
                </div>
                
                {/* VIP Level Badge */}
                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-2 py-1 cursor-pointer hover:bg-white/20 transition-colors backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" strokeWidth={1.5} />
                  <Link href="/profile">
                    <span className="text-[10px] font-bold text-white">Level <span className="text-yellow-300 font-black">12</span></span>
                  </Link>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-base text-white mb-3 italic font-bold text-center drop-shadow-sm">"Rock Your Dreams!"</p>

              {/* Ask Magic Mentor Button */}
              <Button 
                onClick={() => setIsAiOpen(true)}
                className="w-full rounded-lg h-10 font-bold text-sm bg-[#6600ff] text-white border border-white/30 hover:bg-[#F5F3FF] hover:text-[#6600ff] hover:border-[#6600ff] hover:-translate-y-0.5 shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:shadow-[0_0_42px_rgba(255,255,255,0.72)] transition-all duration-300"
                data-testid="button-ask-mentor"
              >
                <Sparkles className="w-4 h-4 mr-1.5" strokeWidth={2} /> Ask Magic Mentor
              </Button>
            </div>
          </div>

          {/* Widget 2: Streaks */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xs border border-blue-100 hover:border-blue-200 transition-colors p-4" data-testid="widget-streaks">
            {/* Header + Days on one line */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-blue-500 fill-blue-500" />
                <h4 className="font-bold text-xs uppercase text-[#2563EB]">Streak</h4>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-blue-500">{CURRENT_USER.streak}</span>
                <span className="text-xs font-bold text-blue-400">Days</span>
              </div>
            </div>

            {/* Day Circles */}
            <div className="flex justify-between gap-1.5">
              {STREAK_DATA.map((d, i) => (
                <div key={i} className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  d.active ? "bg-blue-500 text-white shadow-md" : "bg-blue-200 text-blue-400 font-bold"
                )}>
                  {d.day}
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Current Focus */}
          <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card relative" data-testid="widget-focus">
            <div className="p-4 pb-5">
              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-3">Current Focus</h4>
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">Finance Sovereignty</p>
                <span className="font-bold text-love-money text-sm">80%</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted">
              <div className="bg-love-money h-full" style={{ width: '80%' }}></div>
            </div>
          </Card>

          {/* Widget 4: Upcoming Event */}
          <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card" data-testid="widget-event">
            <div className="p-4">
              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Upcoming Event</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Moon Ceremony</p>
                  <p className="text-xs text-muted-foreground">Nov 30</p>
                </div>
                <span className="text-lg">🌙</span>
              </div>
            </div>
          </Card>

          {/* Widget 6: Who to Follow */}
          <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card" data-testid="widget-follow">
            <div className="p-4">
              <h4 className="font-bold text-xs uppercase text-muted-foreground mb-3">Who to Follow</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div>
                    <p className="text-base font-medium text-muted-foreground">Alex Luna</p>
                  </div>
                </div>
                <Button className="rounded-lg px-6 font-bold h-10 bg-love-body text-white border border-transparent transition-all" data-testid="button-follow">
                  Follow
                </Button>
              </div>
            </div>
          </Card>
        </aside>
        )}
      </div>
      <AiBuddy open={isAiOpen} onOpenChange={setIsAiOpen} />
    </div>
  );
}
```

## File: client/src/pages/journal.tsx
```tsx
import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Calendar, Search, Filter, Heart, CheckCircle, FlaskConical, Lightbulb, Plus, Sparkles, Beaker, Quote, Play, X, Moon, Sun, BookOpen, Trophy, Eye, ChevronLeft, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { getPlaylistForToday } from "@/lib/playlists";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { EntryDetailModal, JournalEntry } from "@/components/journal/entry-detail-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ActivePracticeCard } from "@/components/daily-practice/active-practice-card";

export default function LabNotes() {
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceData, setPracticeData] = useState<any>(null);
  const [dayCompleted, setDayCompleted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('startPractice') === 'true') {
      setIsPracticing(true);
    }
  }, []);

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: 1,
      type: "daily-practice",
      date: "Sunday Nov 28th",
      time: "10:42 AM",
      morningVibe: 8,
      eveningVibe: 9,
      vibe: 8,
      gratitude: "The sun shining through the window and fresh coffee.",
      focusArea: {
        name: "GOD/LOVE",
        color: "#eb00a8",
        progress: 85,
        dream: "To feel universally connected and lead with unconditional love in every interaction."
      },
      vision: "Focus on connection and clarity.",
      villain: "Distraction",
      value: "Presence",
      victory: "Completed the team briefing early.",
      content: "My focus today was on connection. I noticed that when I paused to breathe before responding to emails, I felt much more grounded and capable. The experiment with the morning cold plunge is getting easier...",
      tags: ["Daily LOVE Practice"],
      values: ["Presence", "Review goals", "Meditate 10m"],
      checkedItems: [true, true, false]
    }
  ]);

  const handlePracticeComplete = (data: any) => {
    setIsPracticing(false);
    setPracticeData(null); 
    
    if (data.id) {
        setEntries(entries.map(e => e.id === data.id ? { ...e, ...data } : e));
    } else {
        const newEntry: JournalEntry = {
            id: Date.now(),
            type: "daily-practice",
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tags: ["Daily LOVE Practice"],
            ...data
        };
        setEntries([newEntry, ...entries]);
    }
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold text-muted-foreground">Lab Notes</h1>
          <p className="text-lg text-muted-foreground">
            Your private record of experiments, discoveries, and daily vibes.
          </p>
        </div>
        
        {!isPracticing && (
          <div className="flex gap-3">
              <Button 
                  className="gap-2"
                  onClick={() => setIsPracticing(true)}
              >
                <Heart className="w-4 h-4" /> Daily LOVE Practice
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> New Note
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="focus:bg-love-body/10 focus:text-love-body cursor-pointer">
                    <FlaskConical className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Experiment Note
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-love-body/10 focus:text-love-body cursor-pointer">
                    <Lightbulb className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Discovery Note
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-love-body/10 focus:text-love-body cursor-pointer">
                    <Sparkles className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Magic Mentor Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        )}

        {isPracticing ? (
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setIsPracticing(false)} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                    <ChevronLeft className="w-4 h-4" /> Back to Notes
                </Button>
             </div>
             <ActivePracticeCard 
               data={practiceData}
               onComplete={handlePracticeComplete} 
             />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Render List of Entries */}
             <div className="grid gap-6">
                {entries.map((entry) => (
                  <Card key={entry.id} className="border-none shadow-sm hover:shadow-md transition-all group bg-card cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                    <CardContent className="p-6">
                      {/* Content similar to ActivePracticeCard but read-only */}
                      <div className="flex justify-between items-start mb-3 border-b border-border/10 pb-2">
                        <div className="text-lg font-serif font-bold text-foreground">{entry.date}</div>
                      </div>
                      {/* ... simplified content preview ... */}
                       <p className="text-sm font-serif text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                          "{entry.gratitude || "Grateful for this day..."}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
```

## File: client/src/components/daily-practice/active-practice-card.tsx
```tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Heart, Moon, Sun, Trophy, BookOpen, ChevronDown, Award, Image as ImageIcon, Plus, Eye } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, Lock } from "lucide-react";

interface ActivePracticeCardProps {
  data?: any;
  onComplete: (data: any) => void;
}

export function ActivePracticeCard({ data: initialData, onComplete }: ActivePracticeCardProps) {
  const [morningVibe, setMorningVibe] = useState<string>(initialData?.morningVibe ? String(initialData.morningVibe) : "");
  const [eveningVibe, setEveningVibe] = useState<string>(initialData?.eveningVibe ? String(initialData.eveningVibe) : "");
  const [selectedAreaId, setSelectedAreaId] = useState<string>(initialData?.focusArea?.id || "");
  
  const [vision, setVision] = useState(initialData?.vision || "");
  const [gratitude, setGratitude] = useState(initialData?.gratitude || "");
  const [reflection, setReflection] = useState(initialData?.content || "");
  
  const [values, setValues] = useState<string[]>(initialData?.values || ["", "", ""]);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(initialData?.checkedItems || [false, false, false]);
  const [villain, setVillain] = useState(initialData?.villain || "");
  const [tool, setTool] = useState(initialData?.tool || "");
  const [victory, setVictory] = useState(initialData?.victory || "");
  const [gratitudeImage, setGratitudeImage] = useState<string | null>(null);
  
  const [sharedClubId, setSharedClubId] = useState<string>(initialData?.sharedClubId || "private");

  const selectedArea = LOVE_CODE_AREAS.find(a => a.id === selectedAreaId);

  const handleValueChange = (index: number, val: string) => {
    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);
  };

  const handleCheck = (index: number) => {
    if (!values[index]) return;
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
    if (!checkedItems[index]) {
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.7, x: 0.5 }, colors: ['#10B981', '#34D399'] });
    }
  };

  const handleComplete = () => {
    if (!victory) return; 
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FF69B4', '#00FFFF'] });
    onComplete({
      id: initialData?.id,
      morningVibe,
      eveningVibe,
      focusArea: selectedArea,
      vision,
      gratitude,
      content: reflection,
      values,
      checkedItems,
      villain,
      tool,
      victory,
      sharedClubId
    });
  };

  return (
    <Card className="border-none shadow-sm bg-card relative overflow-visible group">
       <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-2 text-muted-foreground">
              <Heart className="w-3 h-3" strokeWidth={1.5} />
              <h2 className="text-xs font-medium">Daily LOVE Practice</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full">
            
            {/* Col 1: Morning Alignment */}
            <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                    <Sun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Morning Alignment</span>
                </div>
                
                <div className="bg-white/50 rounded-xl px-3 h-10 border border-border/40 flex justify-between items-center transition-all hover:shadow-sm">
                    <div className="text-[15px] font-bold text-muted-foreground">Morning Vibe</div>
                    <Input type="text" placeholder="1-11" maxLength={2} className="w-16 h-8 text-right p-0 border-none bg-transparent text-lg font-medium font-serif focus-visible:ring-0 placeholder:text-muted-foreground/50 shadow-none" value={morningVibe} onChange={(e) => setMorningVibe(e.target.value)} />
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-[15px] font-bold text-muted-foreground block pl-3">Morning Gratitude</label>
                    <div className="flex-1 bg-white border border-muted/50 rounded-xl overflow-hidden flex flex-col shadow-sm focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                        <Textarea placeholder="I am grateful for..." className="flex-1 min-h-[120px] border-none focus-visible:ring-0 text-sm font-serif resize-none p-3 shadow-none placeholder:text-muted-foreground/50" value={gratitude} onChange={(e) => setGratitude(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Col 2: Vision (Focus & Action) */}
            <div className="flex flex-col space-y-6 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Vision</span>
                </div>

                <div className="space-y-2">
                    <label className="text-[15px] font-bold text-muted-foreground block mt-2.5 pl-3">Big Dream</label>
                    <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                        <SelectTrigger className="w-full bg-white border-muted/50 h-auto min-h-[3rem] py-3">
                           <SelectValue placeholder="Select a Focus Area..." />
                        </SelectTrigger>
                        <SelectContent>
                            {LOVE_CODE_AREAS.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                                {area.name}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3 flex-1 pt-2">
                     <div className="text-[15px] font-bold text-muted-foreground flex justify-between pl-3">
                        <span>Value (3 Actions)</span>
                     </div>
                     <div className="space-y-3">
                        {values.map((val, idx) => (
                            <div key={idx} className="flex gap-3 items-center group">
                                <div className={cn("w-6 h-6 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-sm", checkedItems[idx] ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/20 bg-white")} onClick={() => handleCheck(idx)}>
                                    {checkedItems[idx] && <CheckCircle className="w-4 h-4" strokeWidth={3} />}
                                </div>
                                <Input placeholder={`Action Step ${idx + 1}`} className={cn("h-10 bg-white border-muted/30 rounded-lg px-3", checkedItems[idx] && "text-green-700 line-through opacity-60 decoration-green-500/30 bg-green-50/30")} value={val} onChange={(e) => handleValueChange(idx, e.target.value)} />
                            </div>
                        ))}
                     </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/10 mt-auto">
                    <div className="space-y-2 mb-2">
                        <label className="text-[15px] font-bold text-muted-foreground pl-3 mb-1 block">Villain (Obstacle)</label>
                        <Input placeholder="What stands in the way?" className="h-9 bg-white border-muted/50" value={villain} onChange={(e) => setVillain(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[15px] font-bold text-muted-foreground pl-3 mb-1 block">Tool (Solution)</label>
                        <Input placeholder="How will I overcome it?" className="h-9 bg-white border-muted/50" value={tool} onChange={(e) => setTool(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Col 3: Evening Review */}
            <div className="flex flex-col space-y-5 bg-muted/5 p-5 rounded-2xl border border-border/20 h-full shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                    <Moon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Evening Review</span>
                </div>

                <div className="bg-white/50 rounded-xl px-3 h-10 border border-border/40 flex justify-between items-center transition-all hover:shadow-sm">
                    <div className="text-[15px] font-bold text-muted-foreground">Evening Vibe</div>
                    <Input type="text" placeholder="1-11" maxLength={2} className="w-16 h-8 text-right p-0 border-none bg-transparent text-lg font-medium font-serif text-muted-foreground focus-visible:ring-0 placeholder:text-muted-foreground/50 shadow-none" value={eveningVibe} onChange={(e) => setEveningVibe(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <label className="text-[15px] font-bold text-muted-foreground flex items-center gap-1 pl-3">
                        <Trophy className="w-3 h-3 text-muted-foreground stroke-[1.5]" /> Victory
                    </label>
                    <Textarea placeholder="My daily win..." className="min-h-[36px] h-auto bg-white border-muted/50 resize-none py-2" value={victory} onChange={(e) => setVictory(e.target.value)} />
                </div>

                <div className="flex-1 flex flex-col space-y-2 pt-2 border-t border-border/20">
                    <label className="text-[15px] font-bold text-muted-foreground block pl-3">Lessons & Blessings</label>
                     <Textarea placeholder="What did I learn? What went well?" className="flex-1 w-full min-h-[150px] bg-white border-muted/50 resize-none font-serif text-muted-foreground text-sm leading-6 p-3 rounded-xl transition-all shadow-sm placeholder:text-muted-foreground/50" value={reflection} onChange={(e) => setReflection(e.target.value)} />
                    
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-md h-10 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-2" onClick={handleComplete}>
                        Save Practice
                    </Button>
                </div>
            </div>

          </div>
       </CardContent>
    </Card>
  );
}
```

## File: client/src/pages/big-dreams.tsx
```tsx
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Sparkles, CheckCircle, PenLine } from "lucide-react";
import { useState } from "react";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function BigDreams() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-12">
        <div>
          <h1 className="text-3xl font-serif font-bold text-muted-foreground mb-2">Big Dreams</h1>
          <p className="text-lg text-muted-foreground italic">
            "The future belongs to those who believe in the beauty of their dreams."
          </p>
        </div>

        <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-muted-foreground">
                  <Target className="w-5 h-5" /> My 11 Big Dreams
                </h2>
                <span className="text-sm text-muted-foreground">Update your vision for each dimension</span>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {LOVE_CODE_AREAS.map((area) => (
                  <Card key={area.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
                    <div className={cn("h-[2px] w-full", area.color)} />
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <CardTitle className="text-xl font-bold font-serif text-muted-foreground">{area.name}</CardTitle>
                          <span className="text-sm font-bold text-muted-foreground">{area.progress}% Realized</span>
                        </div>
                        <Progress value={area.progress} className="h-2" indicatorClassName={area.color} />
                        
                        <div className="pt-2">
                          <Textarea 
                            placeholder={`What is your big dream for your ${area.name.toLowerCase()}?`}
                            className="min-h-[100px] bg-muted/30 border-muted focus:bg-background resize-none text-sm font-serif"
                            defaultValue={area.dream}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm">Save Vision</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
      </div>
    </Layout>
  );
}
```
