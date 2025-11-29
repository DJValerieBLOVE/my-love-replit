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
  const totalSegments = 20; 

  return (
    <div className={cn("flex items-end gap-[2px] md:gap-1 p-2 bg-black/90 rounded-lg shadow-2xl border border-white/10", className)} style={{ height: height + 16 }}>
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
                          // Use pure color for active, very dark gray for inactive (screen look)
                          backgroundColor: isActive ? color : '#1a1a1a',
                          
                          // Active: High opacity + glow
                          // Inactive: Low opacity
                          opacity: isActive ? 1 : 0.8,
                          
                          // Strong glow for active segments
                          boxShadow: isActive ? `0 0 8px ${color}` : 'none',
                          
                          // Clean sharp corners
                          borderRadius: 0 
                        }}
                      />
                    );
                  })}
                  
                  {/* Peak Indicator (Floating Dot) - Bright White "Ghost" */}
                  <div 
                    className="absolute w-full h-[2px] bg-white box-shadow-[0_0_4px_white]"
                    style={{
                      bottom: `${Math.min(100, area.progress + 3)}%`,
                      opacity: 0.9,
                      transition: "bottom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" // Bouncy spring
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black/90 border-white/20 backdrop-blur-xl z-50 shadow-[0_0_30px_rgba(255,255,255,0.1)] text-white">
                <div className="text-center">
                  <p className="font-serif font-bold text-sm tracking-wider uppercase" style={{ color }}>{area.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    <span className="text-[9px] uppercase tracking-widest text-gray-400">Progress</span>
                    <span className="font-medium text-white text-sm">{area.progress}%</span>
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
