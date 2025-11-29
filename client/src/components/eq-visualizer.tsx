import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EqVisualizerProps {
  className?: string;
  size?: number;
}

export function EqVisualizer({ className, size = 120 }: EqVisualizerProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuration
  const center = size / 2;
  const innerRadius = size * 0.25; // Central hole/logo area
  const maxRadius = size * 0.48;   // Max extent of the bars
  const gap = 2; // Gap between segments in degrees
  
  // 11 Segments
  const totalSegments = 11;
  const angleStep = 360 / totalSegments;

  // Helper to generate SVG paths for arcs
  const createArc = (index: number, radius: number, startRadius: number = innerRadius) => {
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

  // Brand Colors Map (matching mock-data classes to hex)
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
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            {/* Glow Filters */}
            {LOVE_CODE_AREAS.map((area) => (
              <filter key={`glow-${area.id}`} id={`glow-${area.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Central Core - The "Sacred Center" */}
          <circle cx={center} cy={center} r={innerRadius - 4} fill="#0a0a0a" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          
          {/* Central Triangle (Logo Motif) */}
          <path 
            d={`M ${center} ${center - (innerRadius * 0.6)} L ${center + (innerRadius * 0.5)} ${center + (innerRadius * 0.3)} L ${center - (innerRadius * 0.5)} ${center + (innerRadius * 0.3)} Z`}
            fill="none"
            stroke="url(#rainbowGradient)"
            strokeWidth="1.5"
            className="opacity-80"
          />
          
          {/* Rainbow Gradient Definition */}
          <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eb00a8" />
            <stop offset="50%" stopColor="#ffdf00" />
            <stop offset="100%" stopColor="#00ccff" />
          </linearGradient>


          {LOVE_CODE_AREAS.map((area, index) => {
            const color = brandColors[area.id] || "#ffffff";
            // Calculate visual radius based on progress (min innerRadius, max maxRadius)
            // If progress is 0, we show a tiny sliver or just the track
            const progressRadius = innerRadius + ((maxRadius - innerRadius) * (area.progress / 100));
            
            return (
              <Tooltip key={area.id}>
                <TooltipTrigger asChild>
                  <g 
                    onMouseEnter={() => setHoveredArea(area.id)} 
                    onMouseLeave={() => setHoveredArea(null)}
                    className="cursor-pointer"
                    style={{ transformOrigin: `${center}px ${center}px` }}
                  >
                    {/* Track (Background - The "Empty" Container) */}
                    <path 
                      d={createArc(index, maxRadius)} 
                      fill={color} 
                      fillOpacity="0.1" 
                      stroke="none"
                      className="transition-opacity duration-300"
                    />

                    {/* Active Progress Wedge */}
                    <motion.path 
                      d={createArc(index, progressRadius)}
                      fill={color}
                      stroke="none"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1.05, filter: `url(#glow-${area.id})` }}
                      transition={{ 
                        duration: 0.8, 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100
                      }}
                    />
                    
                    {/* EQ Segment Lines (The "Graphic Equalizer" look) */}
                    {/* We overlay thin black lines to create the segmented look */}
                    {[0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((segmentPerc) => {
                       const segRadius = innerRadius + ((maxRadius - innerRadius) * segmentPerc);
                       if (segRadius > progressRadius) return null; // Don't draw lines outside filled area
                       return (
                         <path 
                           key={segmentPerc}
                           d={createArc(index, segRadius + 0.5, segRadius)}
                           fill="rgba(0,0,0,0.3)"
                           stroke="none"
                         />
                       );
                    })}

                  </g>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-black/90 border-white/10 backdrop-blur-xl z-50">
                  <div className="text-center">
                    <p className="font-serif font-bold text-lg" style={{ color }}>{area.name}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-muted-foreground">Mastery</span>
                      <span className="font-mono font-bold text-white">{area.progress}%</span>
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
