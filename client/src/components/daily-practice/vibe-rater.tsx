import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface VibeRaterProps {
  value: number;
  onChange: (value: number) => void;
}

export function VibeRater({ value, onChange }: VibeRaterProps) {
  const getZoneInfo = (val: number) => {
    if (val >= 11) return { label: "Enlightenment", color: "text-fuchsia-500", zone: "Ultimate Consciousness", desc: "Transcendent, Pure Awareness" };
    if (val >= 10) return { label: "Peace", color: "text-purple-500", zone: "Pure Tao Service", desc: "Blissful, Serene" };
    if (val >= 9) return { label: "Joy", color: "text-violet-500", zone: "Pure Tao Service", desc: "Ecstatic, Complete" };
    if (val >= 8) return { label: "LOVE", color: "text-pink-500", zone: "Love Threshold", desc: "Unconditional, Connected" };
    if (val >= 7) return { label: "Reason", color: "text-blue-500", zone: "Transformation Flow", desc: "Clear, Understanding" };
    if (val >= 6) return { label: "Acceptance", color: "text-cyan-500", zone: "Transformation Flow", desc: "Willing, Flowing" };
    if (val >= 5) return { label: "Courage", color: "text-green-500", zone: "Transformation Flow", desc: "Empowered, Neutral" };
    if (val >= 4) return { label: "Anger/Pride", color: "text-orange-500", zone: "Suffering Survival", desc: "Resistant, Demanding" };
    if (val >= 3) return { label: "Fear/Desire", color: "text-orange-600", zone: "Suffering Survival", desc: "Anxious, Craving" };
    if (val >= 2) return { label: "Grief/Apathy", color: "text-red-500", zone: "Suffering Survival", desc: "Heavy, Hopeless" };
    return { label: "Shame/Guilt", color: "text-red-700", zone: "Suffering Survival", desc: "Contracted, Hiding" };
  };

  const info = getZoneInfo(value);

  return (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-2">
        <motion.div 
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("text-6xl font-black mb-2", info.color)}
        >
          {value}
        </motion.div>
        <h3 className={cn("text-3xl font-serif font-bold", info.color)}>{info.label}</h3>
        <p className="text-lg font-medium text-muted-foreground">{info.desc}</p>
        <div className="inline-block px-3 py-1 rounded-full bg-muted text-xs font-bold uppercase tracking-widest mt-2">
          {info.zone}
        </div>
      </div>

      <div className="px-4">
        <Slider
          defaultValue={[value]}
          max={11}
          min={1}
          step={1}
          onValueChange={(vals) => onChange(vals[0])}
          className="cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-xs font-bold text-muted-foreground uppercase">
          <span>Survival</span>
          <span>Flow</span>
          <span>Love</span>
          <span>Ultimate</span>
        </div>
      </div>
    </div>
  );
}
