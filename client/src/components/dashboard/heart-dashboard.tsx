import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface PillarCardProps {
  title: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  imageUrl: string;
  onClick: () => void;
  testId: string;
}

function PillarCard({ title, position, imageUrl, onClick, testId }: PillarCardProps) {
  const labelPositions = {
    "top-left": "top-3 left-3 md:top-4 md:left-4",
    "top-right": "top-3 right-3 md:top-4 md:right-4",
    "bottom-left": "bottom-3 left-3 md:bottom-4 md:left-4",
    "bottom-right": "bottom-3 right-3 md:bottom-4 md:right-4",
  };

  return (
    <motion.div
      className="relative cursor-pointer overflow-hidden"
      style={{ 
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-testid={testId}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
      <div className={`absolute ${labelPositions[position]}`}>
        <h3 
          className="text-white text-lg md:text-2xl lg:text-3xl font-normal tracking-wide"
          style={{ 
            textShadow: "0 2px 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5)" 
          }}
        >
          {title}
        </h3>
      </div>
    </motion.div>
  );
}

interface GlowingHeartProps {
  label: string;
  isFlipped: boolean;
  onClick: () => void;
}

function GlowingHeart({ label, isFlipped, onClick }: GlowingHeartProps) {
  return (
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
      style={{ 
        width: "min(55vw, 55vh, 320px)", 
        height: "min(50vw, 50vh, 300px)" 
      }}
      onClick={onClick}
      data-testid="heart-god-card"
    >
      <motion.div
        className="w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div 
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden" }}
          animate={{ 
            scale: [1, 1.03, 1],
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <svg viewBox="0 0 100 90" className="w-full h-full" style={{ filter: "drop-shadow(0 0 25px rgba(235, 0, 168, 0.6)) drop-shadow(0 0 50px rgba(102, 0, 255, 0.4))" }}>
            <defs>
              <linearGradient id="heartGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eb00a8" />
                <stop offset="50%" stopColor="#cc00ff" />
                <stop offset="100%" stopColor="#9900ff" />
              </linearGradient>
              <linearGradient id="heartShine" x1="0%" y1="0%" x2="50%" y2="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <filter id="heartShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.3)" />
              </filter>
            </defs>
            <path
              d="M50 88 C20 60, 0 40, 0 25 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 25 C100 40, 80 60, 50 88Z"
              fill="url(#heartGradientMain)"
              filter="url(#heartShadow)"
            />
            <path
              d="M50 88 C20 60, 0 40, 0 25 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 25 C100 40, 80 60, 50 88Z"
              fill="url(#heartShine)"
              style={{ mixBlendMode: "overlay" }}
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              fill="white"
              fontSize="20"
              fontFamily="Marcellus, Georgia, serif"
              fontWeight="400"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
            >
              {label}
            </text>
          </svg>
        </motion.div>

        <motion.div 
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          animate={{ 
            scale: [1, 1.03, 1],
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <svg viewBox="0 0 100 90" className="w-full h-full" style={{ filter: "drop-shadow(0 0 25px rgba(153, 0, 255, 0.6)) drop-shadow(0 0 50px rgba(235, 0, 168, 0.4))" }}>
            <defs>
              <linearGradient id="heartGradientBack" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#eb00a8" />
                <stop offset="50%" stopColor="#9900ff" />
                <stop offset="100%" stopColor="#6600ff" />
              </linearGradient>
            </defs>
            <path
              d="M50 88 C20 60, 0 40, 0 25 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 25 C100 40, 80 60, 50 88Z"
              fill="url(#heartGradientBack)"
              filter="url(#heartShadow)"
            />
            <path
              d="M50 88 C20 60, 0 40, 0 25 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 25 C100 40, 80 60, 50 88Z"
              fill="url(#heartShine)"
              style={{ mixBlendMode: "overlay" }}
            />
            <text
              x="50"
              y="42"
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontFamily="Marcellus, Georgia, serif"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
            >
              You are
            </text>
            <text
              x="50"
              y="56"
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontFamily="Marcellus, Georgia, serif"
              fontWeight="400"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
            >
              LOVED
            </text>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function HeartDashboard() {
  const [, setLocation] = useLocation();
  const [heartFlipped, setHeartFlipped] = useState(false);
  const [godLabel] = useState("GOD");

  const pillars = [
    {
      id: "mission",
      title: "Mission",
      position: "top-left" as const,
      imageUrl: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&h=600&fit=crop",
      link: "/big-dreams?area=mission",
      testId: "card-mission",
    },
    {
      id: "health",
      title: "Health",
      position: "top-right" as const,
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
      link: "/big-dreams?area=health",
      testId: "card-health",
    },
    {
      id: "tribe",
      title: "Tribe",
      position: "bottom-left" as const,
      imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      link: "/big-dreams?area=tribe",
      testId: "card-tribe",
    },
    {
      id: "wealth",
      title: "Wealth",
      position: "bottom-right" as const,
      imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
      link: "/big-dreams?area=wealth",
      testId: "card-wealth",
    },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      <div 
        className="grid grid-cols-2 grid-rows-2 w-full h-full"
        style={{ gap: "2px" }}
      >
        {pillars.map((pillar) => (
          <PillarCard
            key={pillar.id}
            title={pillar.title}
            position={pillar.position}
            imageUrl={pillar.imageUrl}
            onClick={() => setLocation(pillar.link)}
            testId={pillar.testId}
          />
        ))}
      </div>

      <GlowingHeart
        label={godLabel}
        isFlipped={heartFlipped}
        onClick={() => setHeartFlipped(!heartFlipped)}
      />
    </div>
  );
}
