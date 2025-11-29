import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Logo from "@/assets/11x_logo_gradient.png"; // Import Logo directly

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
    // Rotate so top is -90deg, PLUS offset to align colors with logo if needed
    // Currently assuming standard rainbow alignment (Magenta/Red at top)
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
            
            {/* Individual Color Glows */}
            {LOVE_CODE_AREAS.map((area) => (
               <filter key={`glow-${area.id}`} id={`glow-${area.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                 <feComposite operator="in" in="coloredBlur" in2="SourceAlpha" result="softGlow" />
                <feMerge>
                  <feMergeNode in="softGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Central Core Background - Pure White for Logo Contrast */}
          <circle cx={center} cy={center} r={innerRadius - 2} fill="white" stroke="none" />
          
          {/* The Logo Image in Center */}
          <foreignObject x={center - (innerRadius - 4)} y={center - (innerRadius - 4)} width={(innerRadius - 4) * 2} height={(innerRadius - 4) * 2}>
            <div className="w-full h-full flex items-center justify-center rounded-full overflow-hidden bg-white">
              <img src={Logo} alt="11x Logo" className="w-full h-full object-contain p-1" />
            </div>
          </foreignObject>

          {/* 11 Segments */}
          {LOVE_CODE_AREAS.map((area, index) => {
            // Use the hex color from data (or fallback to known brand colors if mock data update hasn't propagated)
            // @ts-ignore - hex property added to mock data
            const color = area.hex || brandColors[area.id] || "#ffffff";
            const progressRadius = innerRadius + ((maxRadius - innerRadius) * (area.progress / 100));
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
                    {/* "Unrealized Potential" Track - Muted but Visible Color */}
                    <path 
                      d={createArc(index, maxRadius)} 
                      fill={color} 
                      fillOpacity="0.2" 
                      stroke={color}
                      strokeWidth="0.5"
                      strokeOpacity="0.3"
                      className="transition-all duration-500"
                      style={{ filter: isHovered ? `drop-shadow(0 0 5px ${color})` : 'none' }}
                    />

                    {/* Active Progress Wedge - "Realized Power" */}
                    <motion.path 
                      d={createArc(index, progressRadius)}
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
                      <span className="font-mono font-bold text-black text-lg">{area.progress}%</span>
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
