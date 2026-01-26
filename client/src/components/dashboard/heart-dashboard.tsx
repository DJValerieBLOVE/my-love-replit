import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface FlipCardProps {
  title: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  imageUrl: string;
  quote: string;
  progress: number;
  onClick: () => void;
  testId: string;
}

function FlipCard({ title, position, imageUrl, quote, progress, onClick, testId }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const labelPositions = {
    "top-left": "top-3 left-3 md:top-4 md:left-4",
    "top-right": "top-3 right-3 md:top-4 md:right-4",
    "bottom-left": "top-3 left-3 md:top-4 md:left-4", 
    "bottom-right": "top-3 right-3 md:top-4 md:right-4", 
  };

  return (
    <div 
      className="relative cursor-pointer overflow-hidden rounded-md h-full w-full"
      style={{ 
        perspective: "1000px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}
      data-testid={testId}
    >
      <motion.div
        className="w-full h-full relative"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front - Beautiful Photo */}
        <div 
          className="absolute inset-0 rounded-md overflow-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
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
        </div>

        {/* Back - Quote + Stats */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center p-4 rounded-md overflow-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #6600ff 0%, #cc00ff 100%)",
          }}
        >
          <h3 className="text-white text-lg md:text-xl font-semibold mb-2 md:mb-4">{title}</h3>
          <p 
            className="text-white/90 text-xs md:text-sm text-center italic mb-3 md:mb-4 px-2"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
          >
            "{quote}"
          </p>
          <div className="w-3/4 bg-white/20 rounded-full h-2 md:h-3 mb-2">
            <div 
              className="bg-white rounded-full h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white text-xs md:text-sm">{progress}% Progress</span>
          <button
            className="mt-3 md:mt-4 px-3 md:px-4 py-1.5 md:py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs md:text-sm transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            data-testid={`${testId}-explore-btn`}
          >
            Explore
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface GlowingHeartProps {
  label: string;
  isFlipped: boolean;
  onClick: () => void;
  frontImageUrl: string;
  backImageUrl: string;
  affirmation: string;
}

function GlowingHeart({ label, isFlipped, onClick, frontImageUrl, backImageUrl, affirmation }: GlowingHeartProps) {
  return (
    <div 
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
      style={{ 
        width: "min(57.8vw, 57.8vh, 433.5px)", // 15% smaller than original 68vw/vh (0.85 * 68 = 57.8)
        height: "min(54.4vw, 54.4vh, 396.95px)" // 15% smaller than original 64vw/vh (0.85 * 64 = 54.4)
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
        {/* Front - Heart with Image, Label, and Outline */}
        <motion.div 
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden" }}
        >
          <svg viewBox="-5 -5 110 100" className="w-full h-full overflow-visible">
            <defs>
              <clipPath id="heartClipFront">
                <path d="M50 88 C20 60, 0 40, 0 25 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 25 C100 40, 80 60, 50 88Z" />
              </clipPath>
              <filter id="heartShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.5)" />
              </filter>
            </defs>
            {/* Outline - matching theme background with 3px width */}
            <path
              d="M50 88 C20 60, 0 40, 0 25 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 25 C100 40, 80 60, 50 88Z"
              className="fill-[hsl(var(--background))] stroke-[hsl(var(--background))]"
              strokeWidth="3"
              filter="url(#heartShadow)"
            />
            <g clipPath="url(#heartClipFront)">
              <image
                href={frontImageUrl}
                x="-10"
                y="-10"
                width="120"
                height="110"
                preserveAspectRatio="xMidYMid slice"
              />
              <rect x="0" y="0" width="100" height="90" fill="rgba(0,0,0,0.15)" />
            </g>
            <text
              x="50"
              y="44"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="17"
              fontFamily="Marcellus, Georgia, serif"
              fontWeight="400"
              style={{ 
                textShadow: "0 2px 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5)" 
              }}
            >
              {label}
            </text>
          </svg>
        </motion.div>

        {/* Back - Image + Affirmation + Outline */}
        <motion.div 
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <svg viewBox="-5 -5 110 100" className="w-full h-full overflow-visible">
            <defs>
              <clipPath id="heartClip">
                <path d="M50 88 C20 60, 0 40, 0 25 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 25 C100 40, 80 60, 50 88Z" />
              </clipPath>
              <filter id="heartShadowBack" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.5)" />
              </filter>
            </defs>
            <path
              d="M50 88 C20 60, 0 40, 0 25 C0 10, 15 0, 30 0 C40 0, 48 8, 50 15 C52 8, 60 0, 70 0 C85 0, 100 10, 100 25 C100 40, 80 60, 50 88Z"
              className="fill-[hsl(var(--background))] stroke-[hsl(var(--background))]"
              strokeWidth="3"
              filter="url(#heartShadowBack)"
            />
            <g clipPath="url(#heartClip)">
              <image
                href={backImageUrl}
                x="-10"
                y="-10"
                width="120"
                height="110"
                preserveAspectRatio="xMidYMid slice"
              />
              <rect x="0" y="0" width="100" height="90" fill="rgba(102, 0, 255, 0.15)" />
            </g>
            <text
              x="50"
              y="42"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontFamily="Marcellus, Georgia, serif"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
            >
              Today's Affirmation
            </text>
            <text
              x="50"
              y="55"
              textAnchor="middle"
              fill="white"
              fontSize="9"
              fontFamily="Marcellus, Georgia, serif"
              fontWeight="400"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.7)" }}
            >
              {affirmation}
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
  const [godLabel] = useState("God");

  const pillars = [
    {
      id: "mission",
      title: "Mission",
      position: "top-left" as const,
      imageUrl: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&h=600&fit=crop",
      link: "/big-dreams?area=mission",
      testId: "card-mission",
      quote: "Your purpose is your power.",
      progress: 65,
    },
    {
      id: "health",
      title: "Health",
      position: "top-right" as const,
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
      link: "/big-dreams?area=health",
      testId: "card-health",
      quote: "Take care of your body. It's the only place you have to live.",
      progress: 42,
    },
    {
      id: "tribe",
      title: "bottom-left" as const,
      position: "bottom-left" as const,
      title_display: "Tribe",
      imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      link: "/big-dreams?area=tribe",
      testId: "card-tribe",
      quote: "We rise by lifting others.",
      progress: 78,
    },
    {
      id: "wealth",
      title: "bottom-right" as const,
      position: "bottom-right" as const,
      title_display: "Wealth",
      imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
      link: "/big-dreams?area=wealth",
      testId: "card-wealth",
      quote: "Wealth is the ability to fully experience life.",
      progress: 35,
    },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-background p-[10px]">
      {/* 4 Pillar Flip Cards */}
      <div 
        className="grid grid-cols-2 grid-rows-2 w-full h-full gap-[10px]"
      >
        {pillars.map((pillar) => (
          <FlipCard
            key={pillar.id}
            title={pillar.title_display || pillar.title}
            position={pillar.position}
            imageUrl={pillar.imageUrl}
            quote={pillar.quote}
            progress={pillar.progress}
            onClick={() => setLocation(pillar.link)}
            testId={pillar.testId}
          />
        ))}
      </div>

      {/* Giant Heart - Also Flips */}
      <GlowingHeart
        label={godLabel}
        isFlipped={heartFlipped}
        onClick={() => setHeartFlipped(!heartFlipped)}
        frontImageUrl="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=800&fit=crop"
        backImageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        affirmation="You are LOVED"
      />
    </div>
  );
}
