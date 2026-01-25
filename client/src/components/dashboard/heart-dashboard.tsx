import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Heart, Sparkles, Target, Activity, Users, Wallet } from "lucide-react";

interface HeartCardProps {
  label: string;
  isFlipped: boolean;
  onClick: () => void;
}

function HeartCard({ label, isFlipped, onClick }: HeartCardProps) {
  return (
    <div 
      className="relative cursor-pointer perspective-1000"
      style={{ width: "140px", height: "130px" }}
      onClick={onClick}
      data-testid="heart-god-card"
    >
      <motion.div
        className="absolute inset-0 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div 
          className="absolute inset-0 backface-hidden flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <svg viewBox="0 0 100 90" className="w-full h-full drop-shadow-lg">
            <defs>
              <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eb00a8" />
                <stop offset="50%" stopColor="#cc00ff" />
                <stop offset="100%" stopColor="#9900ff" />
              </linearGradient>
              <filter id="heartGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M50 88 C20 60, 0 40, 0 25 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 25 C100 40, 80 60, 50 88Z"
              fill="url(#heartGradient)"
              filter="url(#heartGlow)"
              className="transition-all duration-300 hover:brightness-110"
            />
            <text
              x="50"
              y="48"
              textAnchor="middle"
              fill="white"
              fontSize="18"
              fontFamily="Marcellus, Georgia, serif"
              fontWeight="400"
              className="drop-shadow-md"
            >
              {label}
            </text>
          </svg>
        </div>
        <div 
          className="absolute inset-0 backface-hidden flex items-center justify-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <svg viewBox="0 0 100 90" className="w-full h-full drop-shadow-lg">
            <defs>
              <linearGradient id="heartGradientBack" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9900ff" />
                <stop offset="50%" stopColor="#6600ff" />
                <stop offset="100%" stopColor="#eb00a8" />
              </linearGradient>
            </defs>
            <path
              d="M50 88 C20 60, 0 40, 0 25 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 25 C100 40, 80 60, 50 88Z"
              fill="url(#heartGradientBack)"
              filter="url(#heartGlow)"
            />
            <text
              x="50"
              y="42"
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontFamily="Marcellus, Georgia, serif"
              className="drop-shadow-md"
            >
              You are
            </text>
            <text
              x="50"
              y="56"
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontFamily="Marcellus, Georgia, serif"
              fontWeight="400"
              className="drop-shadow-md"
            >
              LOVED
            </text>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

interface PillarCardProps {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  onClick: () => void;
  testId: string;
}

function PillarCard({ title, icon, gradient, position, onClick, testId }: PillarCardProps) {
  const positionClasses = {
    "top-left": "",
    "top-right": "",
    "bottom-left": "",
    "bottom-right": "",
  };

  return (
    <motion.div
      className={`relative cursor-pointer rounded-2xl overflow-hidden shadow-lg ${positionClasses[position]}`}
      style={{ 
        background: gradient,
        aspectRatio: "4/3",
      }}
      whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-testid={testId}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 md:w-12 md:h-12 mb-2 opacity-90">
          {icon}
        </div>
        <h3 className="text-lg md:text-xl font-medium tracking-wide drop-shadow-lg">
          {title}
        </h3>
      </div>
      <div className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none" />
    </motion.div>
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
      icon: <Target className="w-full h-full" strokeWidth={1.5} />,
      gradient: "linear-gradient(135deg, #a2f005 0%, #7ac000 50%, #5a9000 100%)",
      position: "top-left" as const,
      link: "/big-dreams?area=mission",
      testId: "card-mission",
    },
    {
      id: "health",
      title: "Health",
      icon: <Activity className="w-full h-full" strokeWidth={1.5} />,
      gradient: "linear-gradient(135deg, #6600ff 0%, #9900ff 50%, #cc00ff 100%)",
      position: "top-right" as const,
      link: "/big-dreams?area=health",
      testId: "card-health",
    },
    {
      id: "tribe",
      title: "Tribe",
      icon: <Users className="w-full h-full" strokeWidth={1.5} />,
      gradient: "linear-gradient(135deg, #e60023 0%, #ff6600 50%, #ffdf00 100%)",
      position: "bottom-left" as const,
      link: "/big-dreams?area=tribe",
      testId: "card-tribe",
    },
    {
      id: "wealth",
      title: "Wealth",
      icon: <Wallet className="w-full h-full" strokeWidth={1.5} />,
      gradient: "linear-gradient(135deg, #00d81c 0%, #00ccff 50%, #0033ff 100%)",
      position: "bottom-right" as const,
      link: "/big-dreams?area=wealth",
      testId: "card-wealth",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden bg-background">
      <div className="relative w-full max-w-md md:max-w-2xl lg:max-w-3xl">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {pillars.slice(0, 2).map((pillar) => (
            <PillarCard
              key={pillar.id}
              title={pillar.title}
              icon={pillar.icon}
              gradient={pillar.gradient}
              position={pillar.position}
              onClick={() => setLocation(pillar.link)}
              testId={pillar.testId}
            />
          ))}
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          >
            <HeartCard
              label={godLabel}
              isFlipped={heartFlipped}
              onClick={() => setHeartFlipped(!heartFlipped)}
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4">
          {pillars.slice(2, 4).map((pillar) => (
            <PillarCard
              key={pillar.id}
              title={pillar.title}
              icon={pillar.icon}
              gradient={pillar.gradient}
              position={pillar.position}
              onClick={() => setLocation(pillar.link)}
              testId={pillar.testId}
            />
          ))}
        </div>
      </div>

      <motion.p 
        className="mt-6 text-center text-sm text-muted-foreground max-w-xs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Tap any card to explore • Tap the heart to flip
      </motion.p>
    </div>
  );
}
