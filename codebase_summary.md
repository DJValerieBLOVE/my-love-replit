
## File: client/src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## File: client/src/components/theme-customizer.tsx
```tsx
import { useState, useEffect } from "react";
import { 
  Palette, 
  Check, 
  RotateCcw, 
  LayoutTemplate,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const THEMES = [
  {
    id: "cosmic-latte",
    name: "Cosmic Latte",
    colors: {
      "--primary": "270 50% 45%",
      "--background": "36 33% 97%",
      "--sidebar": "36 33% 97%",
      "--radius": "0.75rem"
    }
  },
  {
    id: "11x-love",
    name: "11x LOVE",
    colors: {
      "--primary": "280 85% 60%", // Vibrant Purple
      "--background": "0 0% 100%", // Pure White
      "--sidebar": "280 50% 98%", // Light Lavender
      "--radius": "1rem" // Rounder
    }
  },
  {
    id: "ocean-calm",
    name: "Ocean Calm",
    colors: {
      "--primary": "200 80% 40%", // Deep Blue
      "--background": "210 30% 98%", // Cool White
      "--sidebar": "200 20% 96%",
      "--radius": "0.5rem" // Sharper
    }
  },
  {
    id: "dark-future",
    name: "Dark Future",
    colors: {
      "--primary": "140 70% 50%", // Neon Green
      "--background": "240 10% 4%", // Almost Black
      "--sidebar": "240 10% 8%",
      "--radius": "0px" // Square
    }
  }
];

export function ThemeCustomizer() {
  const [activeTheme, setActiveTheme] = useState("cosmic-latte");
  const [customPrimary, setCustomPrimary] = useState("#7C3AED");

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;

    setActiveTheme(themeId);
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Special handling for Dark Future
    if (themeId === "dark-future") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="fixed bottom-20 right-4 lg:bottom-4 lg:right-4 h-12 w-12 rounded-full shadow-xl z-50 border-2 border-white/20">
          <Palette className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-serif">Customize Your Community</SheetTitle>
          <SheetDescription>
            Make the platform match your brand identity. Changes apply instantly.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="themes">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="themes" className="flex-1">Themes</TabsTrigger>
            <TabsTrigger value="colors" className="flex-1">Colors</TabsTrigger>
            <TabsTrigger value="branding" className="flex-1">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {THEMES.map((theme) => (
                <div 
                  key={theme.id}
                  className={`
                    cursor-pointer rounded-md
                    ${activeTheme === theme.id ? "border-primary ring-2 ring-primary/20" : "border-muted"}
                  `}
                  onClick={() => applyTheme(theme.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{theme.name}</span>
                    {activeTheme === theme.id && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border shadow-sm"
                      style={{ background: `hsl(${theme.colors["--background"]})` }} 
                    />
                    <div 
                      className="w-8 h-8 rounded-full border shadow-sm"
                      style={{ background: `hsl(${theme.colors["--primary"]})` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Primary Brand Color</Label>
                <div className="flex gap-3 mt-2">
                  <div className="h-10 flex-1 rounded-lg border bg-muted px-3 flex items-center">
                    {customPrimary}
                  </div>
                  <input 
                    type="color" 
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="h-10 w-10 rounded-lg cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Used for buttons, links, and active states.
                </p>
              </div>

              <Separator />

              <div>
                <Label>Sidebar Color</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button variant="outline" className="bg-white">Light</Button>
                  <Button variant="outline" className="bg-gray-900 text-white hover:bg-gray-800 hover:text-white">Dark</Button>
                  <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white">Brand</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-xs border border-muted text-center">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                <LayoutTemplate className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium">Community Logo</h3>
              <p className="text-xs text-muted-foreground mb-3">Recommended size: 512x512px</p>
              <Button size="sm" variant="outline">Upload Logo</Button>
            </div>

            <div className="space-y-4">
              <Label>Typography</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg cursor-pointer hover:border-primary">
                  <h4 className="font-serif font-bold text-lg mb-1">Elegant</h4>
                  <p className="text-xs text-muted-foreground">Lora + Jakarta</p>
                </div>
                <div className="p-3 border rounded-lg cursor-pointer hover:border-primary">
                  <h4 className="font-sans font-bold text-lg mb-1">Modern</h4>
                  <p className="text-xs text-muted-foreground">Inter + Inter</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
```

## File: client/src/components/ai-buddy.tsx
```tsx
import { 
  Sparkles, 
  Target,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LOVE_CODE_AREAS, CURRENT_USER } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function AiBuddy({ trigger, open, onOpenChange }: { trigger?: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [chatMessage, setChatMessage] = useState("");
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-[800px] sm:w-[800px] p-0 border-l shadow-2xl [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button_svg]:stroke-white [&>button]:z-50">
        <div className="h-full flex flex-col bg-background">
          {/* Consolidated Header + Suggestion + Chat Block */}
          <div className="p-6 border-b bg-gradient-to-br from-[#6600ff] to-[#cc00ff] space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            {/* Magic Mentor Header */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                <Sparkles className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold text-lg font-serif text-white">Magic Mentor</h3>
                <p className="text-xs text-[#E6E6FA]">Your accountability partner</p>
              </div>
            </div>

            {/* Quote of the Day Box */}
            <div className="bg-white border rounded-xl p-5 text-sm text-[#4D3D5C] shadow-lg relative overflow-hidden">
              <p className="leading-relaxed italic text-[#4D3D5C] font-serif text-base">"Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it."</p>
              <p className="text-xs text-right mt-2 font-bold text-[#4D3D5C]">— Rumi</p>
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 pt-2">
              <input 
                type="text" 
                placeholder={`Aloha ${CURRENT_USER.name.split(' ')[0]} ~ Ask me anything...`}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-white bg-[#F4F4F5] text-sm text-[#4D3D5C] placeholder:text-[#4D3D5C] focus:outline-none focus:ring-2 focus:ring-white shadow-[0_0_30px_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.1)] transition-all"
                data-testid="input-chat-message"
              />
              <button 
                className="flex items-center justify-center h-12 w-12 rounded-xl shadow-lg bg-white border border-transparent transition-all z-10 relative hover:scale-105 active:scale-95"
                data-testid="button-send-message"
              >
                <Send className="w-5 h-5" color="#6600ff" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Goals List */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                  <Target className="w-4 h-4" strokeWidth={1.5} /> Big Dreams
                </h3>
                <Button variant="ghost" className="px-3 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5">Edit</Button>
              </div>

              <div className="space-y-4">
                {LOVE_CODE_AREAS.map((area) => (
                  <div key={area.id} className="group space-y-2 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${area.color}`} />
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{area.name}</span>
                        </div>
                        <p className="text-sm font-serif text-[#4D3D5C] line-clamp-2 leading-relaxed">"{area.dream}"</p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground tabular-nums bg-muted/50 px-2 py-1 rounded-md">{area.progress}%</span>
                    </div>
                    
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500`} 
                        style={{ width: `${area.progress}%`, backgroundColor: area.hex }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

        </div>
      </SheetContent>
    </Sheet>
  );
}
```

## File: client/src/components/eq-visualizer.tsx
```tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Logo from "@/assets/11x_logo_gradient.png"; // Import Logo directly

interface EqVisualizerProps {
  className?: string;
  size?: number;
  isLogo?: boolean; // New prop to force balanced/symmetrical look
}

export function EqVisualizer({ className, size = 120, isLogo = false }: EqVisualizerProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [progressOverrides, setProgressOverrides] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);

    const handleEqUpdate = (e: CustomEvent) => {
       const { category, progress } = e.detail;
       const areaId = category.toLowerCase().replace('/', '-');
       if (areaId) {
          setProgressOverrides(prev => ({
             ...prev,
             [areaId]: progress
          }));

          // Reset animation after 2 seconds
          setTimeout(() => {
             setProgressOverrides(prev => {
                const newPrev = { ...prev };
                delete newPrev[areaId];
                return newPrev;
             });
          }, 2000);
       }
    };

    window.addEventListener('eq-update' as any, handleEqUpdate as any);
    return () => window.removeEventListener('eq-update' as any, handleEqUpdate as any);
  }, []);

  // Configuration
  const center = size / 2;
  
  // New Geometry based on "Nano Banana" inspired request
  // 1. Logo Center (Larger)
  // 2. Gradient Ring
  // 3. White Ring (Spacer)
  // 4. EQ Wedges
  
  const logoRadius = size * 0.18; // Logo 50% smaller (was 0.35)
  const gradientRingInner = logoRadius + 1; // Very tight to logo
  const gradientRingOuter = logoRadius + (size * 0.03); // Thin colored ring
  const whiteRingOuter = gradientRingOuter + (size * 0.015); // Minimal white gap
  
  const wedgeInnerRadius = whiteRingOuter; // Wedges start here
  const maxRadius = size * 0.48;   // Max extent of the bars
  
  const gap = 2; // Gap between segments in degrees
  
  // 11 Segments
  const totalSegments = 11;
  const angleStep = 360 / totalSegments;

  // Helper to generate SVG paths for arcs
  const createArc = (index: number, radius: number, startRadius: number) => {
    // Rotate so top is -90deg
    const startAngle = (index * angleStep) - 90;
    const endAngle = startAngle + angleStep - gap;

    // Convert to radians
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const x1 = center + startRadius * Math.cos(toRad(startAngle));
    const y1 = center + startRadius * Math.sin(toRad(startAngle));
    const x2 = center + radius * Math.cos(toRad(startAngle));
    const y2 = center + radius * Math.sin(toRad(startAngle));
    const x3 = center + radius * Math.cos(toRad(endAngle));
    const y3 = center + radius * Math.sin(toRad(endAngle));
    const x4 = center + startRadius * Math.cos(toRad(endAngle));
    const y4 = center + startRadius * Math.sin(toRad(endAngle));

    return `M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${startRadius} ${startRadius} 0 0 0 ${x1} ${y1} Z`;
  };
  
  // Helper for full arc segments (ring pieces) without gaps if desired, or matching gaps
  // To make the ring look like a continuous gradient but matching positions, we can use small gaps or no gaps.
  // Let's match the wedge alignment exactly but perhaps with smaller gaps to look like a ring.
  const createRingSegment = (index: number, innerR: number, outerR: number) => {
     const startAngle = (index * angleStep) - 90;
     const endAngle = startAngle + angleStep; // No gap for continuous ring look
     
     const toRad = (deg: number) => (deg * Math.PI) / 180;
     
    const x1 = center + innerR * Math.cos(toRad(startAngle));
    const y1 = center + innerR * Math.sin(toRad(startAngle));
    const x2 = center + outerR * Math.cos(toRad(startAngle));
    const y2 = center + outerR * Math.sin(toRad(startAngle));
    const x3 = center + outerR * Math.cos(toRad(endAngle));
    const y3 = center + outerR * Math.sin(toRad(endAngle));
    const x4 = center + innerR * Math.cos(toRad(endAngle));
    const y4 = center + innerR * Math.sin(toRad(endAngle));

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`;
  };

  // Helper for full rings (no gaps)
  const createRing = (innerR: number, outerR: number) => {
     return `M ${center} ${center - outerR} 
             A ${outerR} ${outerR} 0 1 1 ${center} ${center + outerR} 
             A ${outerR} ${outerR} 0 1 1 ${center} ${center - outerR} 
             M ${center} ${center - innerR} 
             A ${innerR} ${innerR} 0 1 0 ${center} ${center + innerR} 
             A ${innerR} ${innerR} 0 1 0 ${center} ${center - innerR} Z`;
  };

  // Brand Colors Map
  const brandColors: Record<string, string> = {
    "god-love": "#eb00a8",
    "romance": "#e60023",
    "family": "#ff6600",
    "community": "#ffdf00",
    "mission": "#a2f005",
    "money": "#00d81c",
    "time": "#00ccff",
    "environment": "#0033ff",
    "body": "#6600ff",
    "mind": "#9900ff",
    "soul": "#cc00ff"
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <TooltipProvider delayDuration={0}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible drop-shadow-2xl">
          <defs>
            {/* Strong Cyber Glow */}
            <filter id="cyber-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
             {/* Rainbow Gradient for the Ring - REMOVED in favor of segmented colored ring */}
          </defs>

          {/* 1. Logo Center (Larger & Centered) */}
          {/* Using full logoRadius to maximize size within the ring */}
          <circle cx={center} cy={center} r={logoRadius} fill="white" stroke="none" />
          <foreignObject x={center - logoRadius} y={center - logoRadius} width={logoRadius * 2} height={logoRadius * 2}>
            <div className="w-full h-full flex items-center justify-center bg-white">
              {/* Logo 10% smaller and visually centered */}
              <img 
                src={Logo} 
                alt="11x Logo" 
                className="w-full h-full object-contain" 
                style={{ transform: 'scale(0.9) translateY(6%)' }}
              />
            </div>
          </foreignObject>
          
          {/* 2. Gradient Ring (Now segmented to match wedges) */}
          {LOVE_CODE_AREAS.map((area, index) => {
             // @ts-ignore
             const color = area.hex || brandColors[area.id] || "#ffffff";
             return (
               <path 
                 key={`ring-${area.id}`}
                 d={createRingSegment(index, gradientRingInner, gradientRingOuter)}
                 fill={color}
                 className="opacity-90"
               />
             );
          })}
          
          {/* 3. White Ring (Spacer) */}
          <path 
            d={createRing(gradientRingOuter, whiteRingOuter)} 
            fill="white" 
            className="opacity-100"
          />

          {/* 4. EQ Wedges */}
          {LOVE_CODE_AREAS.map((area, index) => {
            // Use the hex color from data (or fallback to known brand colors)
            // @ts-ignore
            const color = area.hex || brandColors[area.id] || "#ffffff";
            
            // For Logo: Use "Imperfectly Balanced" values (Human Vibe)
            // Instead of 100% (boring) or User Data (potentially too lopsided),
            // we use a curated set that looks "human" - mostly high but with variation.
            let progressValue = area.progress;
            
            if (isLogo) {
              // A fixed "Ideal but Human" profile for the logo
              // Deeper variations (60-100%) to make the "imperfect" vibe intentional and obvious
              const humanProfile: Record<string, number> = {
                "god-love": 100,
                "romance": 75,
                "family": 90,
                "community": 80, // Increased by 15%
                "mission": 95,
                "money": 70,  // Increased by 15%
                "time": 82,
                "environment": 70,
                "body": 92,
                "mind": 78,
                "soul": 98
              };
              progressValue = humanProfile[area.id] || 90;
            }

            // Check for overrides (animation)
            if (progressOverrides[area.id]) {
               progressValue = progressOverrides[area.id];
            }

            const progressRadius = wedgeInnerRadius + ((maxRadius - wedgeInnerRadius) * (progressValue / 100));
            
            const isHovered = hoveredArea === area.id;
            
            return (
              <Tooltip key={area.id}>
                <TooltipTrigger asChild>
                  <g 
                    onMouseEnter={() => setHoveredArea(area.id)} 
                    onMouseLeave={() => setHoveredArea(null)}
                    className="cursor-pointer"
                    style={{ transformOrigin: `${center}px ${center}px` }}
                  >
                    {/* "Unrealized Potential" Track - White/Invisible as requested ("white looks better") */}
                    {/* We'll make it very faint white just to catch hover events if empty, or just transparent */}
                    <path 
                      d={createArc(index, maxRadius, wedgeInnerRadius)} 
                      fill="white" 
                      fillOpacity="0.05" 
                      stroke="none"
                      className="transition-all duration-500"
                    />

                    {/* Active Progress Wedge - "Realized Power" */}
                    <motion.path 
                      d={createArc(index, progressRadius, wedgeInnerRadius)}
                      fill={color}
                      stroke="none"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05, filter: "url(#cyber-glow)" }}
                      transition={{ 
                        duration: 0.8, 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 120,
                        damping: 10
                      }}
                    />
                    
                    {/* Shiny Tip / Cap for the "Cyber" Look */}
                    {area.progress > 5 && (
                      <motion.path
                        d={createArc(index, progressRadius, progressRadius - 2)}
                        fill="white"
                        fillOpacity="0.4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 1 + (index * 0.05) }}
                      />
                    )}

                  </g>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white/90 border-black/10 backdrop-blur-xl z-50 shadow-[0_0_30px_rgba(0,0,0,0.1)]">
                  <div className="text-center">
                    <p className="font-serif font-bold text-lg tracking-wider uppercase" style={{ color }}>{area.name}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500">Progress</span>
                      <span className="font-medium text-muted-foreground text-lg">{area.progress}%</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </svg>
      </TooltipProvider>
    </div>
  );
}
```

## File: client/src/components/vertical-eq-visualizer.tsx
```tsx
import React from "react";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerticalEqProps {
  className?: string;
  height?: number;
}

export function VerticalEqVisualizer({ className, height = 60 }: VerticalEqProps) {
  const brandColors: Record<string, string> = {
    "god-love": "#eb00a8",
    "romance": "#e60023",
    "family": "#ff6600",
    "community": "#ffdf00",
    "mission": "#a2f005",
    "money": "#00d81c",
    "time": "#00ccff",
    "environment": "#0033ff",
    "body": "#6600ff",
    "mind": "#9900ff",
    "soul": "#cc00ff"
  };

  // Number of segments for the "VU Meter" look
  const totalSegments = 10; 

  return (
    <div className={cn("flex items-end gap-[2px] md:gap-1", className)} style={{ height }}>
      <TooltipProvider delayDuration={0}>
        {LOVE_CODE_AREAS.map((area) => {
          // @ts-ignore
          const color = area.hex || brandColors[area.id] || "#ffffff";
          // Calculate active segments
          // Ensure at least 1 segment is lit if progress > 0
          const activeSegments = Math.max(1, Math.round((area.progress / 100) * totalSegments));
          
          return (
            <Tooltip key={area.id}>
              <TooltipTrigger asChild>
                <div 
                  className="relative w-2.5 md:w-5 h-full flex flex-col-reverse gap-[1px] cursor-pointer group"
                >
                  {/* Segments */}
                  {Array.from({ length: totalSegments }).map((_, i) => {
                    const isActive = i < activeSegments;
                    
                    return (
                      <div
                        key={i}
                        className="w-full flex-1 transition-all duration-200"
                        style={{
                          // Active: Pure Color. Inactive: Faint Color (Ghost) to keep it vivid
                          backgroundColor: color,
                          
                          // Active: Full opacity. Inactive: Even lighter (10%) per request
                          opacity: isActive ? 1 : 0.1,
                          
                          // Removed glow/box-shadow to fix "fuzzy" look
                          // Clean sharp corners
                          borderRadius: 0 
                        }}
                      />
                    );
                  })}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-white/90 border-black/10 backdrop-blur-xl z-50 shadow-[0_0_30px_rgba(0,0,0,0.1)]">
                <div className="text-center">
                  <p className="font-serif font-bold text-sm tracking-wider uppercase" style={{ color }}>{area.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500">Progress</span>
                    <span className="font-medium text-muted-foreground text-sm">{area.progress}%</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
```

## File: client/src/components/ui/button.tsx
```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#6600ff] text-white font-bold font-serif border border-transparent shadow-sm hover:bg-[#F5F3FF] hover:text-[#6600ff] hover:font-normal hover:border-[#6600ff] hover:shadow-md hover:-translate-y-0.5 disabled:opacity-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#6600ff] disabled:text-white",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border-destructive-border disabled:bg-[#F4F4F5] disabled:text-[#A1A1AA] disabled:pointer-events-none",
        outline:
          "bg-white text-muted-foreground border border-muted font-serif font-normal text-sm shadow-sm hover:bg-[#F5F3FF] hover:text-[#6600ff] hover:border-[#6600ff] hover:shadow-md hover:-translate-y-0.5 disabled:bg-white disabled:text-[#A1A1AA] disabled:border-[#E5E5E5] disabled:pointer-events-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-[#FFB84D] disabled:bg-[#F4F4F5] disabled:text-[#A1A1AA] disabled:pointer-events-none",
        ghost: "hover:bg-[#E0F7FA] hover:text-[#006064] disabled:text-[#A1A1AA] disabled:bg-transparent disabled:pointer-events-none",
        link: "text-primary underline-offset-4 hover:underline disabled:text-[#A1A1AA] disabled:pointer-events-none",
      },
      size: {
        default: "h-9 px-6 py-2 text-sm",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={style}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```
