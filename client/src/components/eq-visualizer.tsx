import { LOVE_CODE_AREAS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export function EqVisualizer() {
  return (
    <div className="w-full bg-black/90 rounded-xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Background Grid / Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-end h-64 gap-2 md:gap-4 pb-8 px-2">
          {LOVE_CODE_AREAS.map((area, index) => (
            <div key={area.id} className="flex-1 flex flex-col justify-end h-full group relative">
              {/* Dream Line (Target) - The "Peak" indicator */}
              <div 
                className="absolute w-full border-t-2 border-white/30 z-20 transition-all group-hover:border-white/80"
                style={{ bottom: `${area.progress + 15}%` }} // Mock target slightly above current
              />
              
              {/* The Bar */}
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger className="w-full h-full outline-none">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${area.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.05, ease: "easeOut" }}
                      className={cn(
                        "w-full rounded-t-sm transition-all duration-300 cursor-pointer relative",
                        "hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:brightness-110",
                        area.color.replace('bg-', 'bg-') // ensuring it uses the custom color class or style
                      )}
                      style={{ 
                        backgroundColor: `var(--love-${area.id === 'god-love' ? 'god' : area.id})`,
                        boxShadow: `0 0 10px var(--love-${area.id === 'god-love' ? 'god' : area.id})` 
                      }}
                    >
                      {/* Internal "Level" segments for EQ look */}
                      <div className="absolute inset-0 w-full h-full flex flex-col justify-end gap-[2px] opacity-30 pointer-events-none">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="w-full h-[10%] bg-black/40" />
                        ))}
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-black/90 border border-white/20 text-white p-3 shadow-xl"
                  >
                    <div className="text-center space-y-1">
                      <p className="font-serif font-bold text-lg tracking-wide">{area.name}</p>
                      <div className="flex items-center gap-2 justify-center text-xs uppercase tracking-wider text-muted-foreground">
                        <span>Current: {area.progress}%</span>
                        <span className="text-primary">•</span>
                        <span>Dream: {Math.min(100, area.progress + 15)}%</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Label */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-center">
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-tighter truncate block px-1 group-hover:text-white transition-colors">
                  {area.name.split('/')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest mt-2 px-2 border-t border-white/5 pt-2">
        <span>Self</span>
        <span>Relationship</span>
        <span>Resources</span>
      </div>
    </div>
  );
}
