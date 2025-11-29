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

  useEffect(() => {
    setMounted(true);
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
            
            // Use 100% progress if isLogo is true, otherwise use actual data
            const progressValue = isLogo ? 100 : area.progress;
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
