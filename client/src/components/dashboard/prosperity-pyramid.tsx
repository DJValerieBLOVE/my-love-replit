import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";

interface PyramidAreaData {
  id: string;
  title: string;
  imageUrl: string;
  quote: string;
  affirmation: string;
  progress: number;
  link: string;
}

const pyramidAreas: PyramidAreaData[] = [
  {
    id: "health",
    title: "Health",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
    quote: "Your body is a temple of the Holy Spirit.",
    affirmation: "I am vibrant, healthy, and full of energy.",
    progress: 72,
    link: "/big-dreams?area=health",
  },
  {
    id: "people",
    title: "People",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
    quote: "We rise by lifting others.",
    affirmation: "I attract loving, supportive relationships.",
    progress: 65,
    link: "/big-dreams?area=tribe",
  },
  {
    id: "purpose",
    title: "Purpose",
    imageUrl: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&h=600&fit=crop",
    quote: "Your purpose is your power.",
    affirmation: "I am living my divine purpose every day.",
    progress: 58,
    link: "/big-dreams?area=mission",
  },
  {
    id: "wealth",
    title: "Wealth",
    imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
    quote: "Wealth flows to me in expected and unexpected ways.",
    affirmation: "I am abundant in all areas of my life.",
    progress: 45,
    link: "/big-dreams?area=wealth",
  },
  {
    id: "god",
    title: "God",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=800&fit=crop",
    quote: "With God, all things are possible.",
    affirmation: "I am LOVED unconditionally.",
    progress: 100,
    link: "/big-dreams?area=god",
  },
];

interface FlippedCardModalProps {
  area: PyramidAreaData;
  onClose: () => void;
  onExplore: () => void;
}

function FlippedCardModal({ area, onClose, onExplore }: FlippedCardModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, rotateY: -90 }}
        animate={{ scale: 1, rotateY: 0 }}
        exit={{ scale: 0.8, rotateY: 90 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm aspect-square bg-[#FAF8F5] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          {area.id === "god" && (
            <Heart className="w-12 h-12 text-[#eb00a8] fill-[#eb00a8] mb-4" />
          )}
          
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            {area.title}
          </h2>
          
          <p className="text-sm text-muted-foreground italic mb-6 px-4">
            "{area.quote}"
          </p>

          <div className="w-full max-w-xs mb-6">
            <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
              Today's Affirmation
            </div>
            <p className="text-lg font-serif text-[#6600ff] font-medium">
              "{area.affirmation}"
            </p>
          </div>

          {area.id !== "god" && (
            <>
              <div className="w-3/4 bg-muted rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-[#6600ff] to-[#cc00ff] rounded-full h-full transition-all duration-500"
                  style={{ width: `${area.progress}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground mb-4">
                {area.progress}% Progress
              </span>
            </>
          )}

          <button
            onClick={onExplore}
            className="px-6 py-2.5 bg-gradient-to-r from-[#6600ff] to-[#cc00ff] hover:from-[#5500dd] hover:to-[#bb00dd] rounded-lg text-white font-medium transition-colors shadow-md"
          >
            Explore {area.title}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProsperityPyramid() {
  const [, setLocation] = useLocation();
  const [flippedArea, setFlippedArea] = useState<PyramidAreaData | null>(null);

  const getArea = (id: string) => pyramidAreas.find((a) => a.id === id)!;

  const handleAreaClick = (id: string) => {
    setFlippedArea(getArea(id));
  };

  const handleExplore = () => {
    if (flippedArea) {
      setLocation(flippedArea.link);
      setFlippedArea(null);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-background flex items-center justify-center">
      {/* Square vision board - fills available height on desktop, full width on mobile */}
      <div className="relative w-full aspect-square md:w-auto md:h-full md:max-h-[calc(100vh-120px)] md:aspect-square bg-background">
        {/* 2px gap lines - flat 2D X pattern */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `
              linear-gradient(45deg, transparent calc(50% - 1px), #f5f5f5 calc(50% - 1px), #f5f5f5 calc(50% + 1px), transparent calc(50% + 1px)),
              linear-gradient(-45deg, transparent calc(50% - 1px), #f5f5f5 calc(50% - 1px), #f5f5f5 calc(50% + 1px), transparent calc(50% + 1px))
            `,
          }}
        />

        {/* Health - Top Triangle */}
        <div
          className="absolute cursor-pointer overflow-hidden"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: "50%",
            clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
          }}
          onClick={() => handleAreaClick("health")}
          data-testid="pyramid-health"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getArea("health").imageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-start justify-center pt-[15%]">
            <span
              className="text-white text-2xl font-serif"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              Health
            </span>
          </div>
        </div>

        {/* People - Left Triangle */}
        <div
          className="absolute cursor-pointer overflow-hidden"
          style={{
            top: 0,
            left: 0,
            right: "50%",
            bottom: 0,
            clipPath: "polygon(0% 0%, 100% 50%, 0% 100%)",
          }}
          onClick={() => handleAreaClick("people")}
          data-testid="pyramid-people"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getArea("people").imageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-start pl-[10%]">
            <span
              className="text-white text-2xl font-serif"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              People
            </span>
          </div>
        </div>

        {/* Purpose - Right Triangle */}
        <div
          className="absolute cursor-pointer overflow-hidden"
          style={{
            top: 0,
            left: "50%",
            right: 0,
            bottom: 0,
            clipPath: "polygon(100% 0%, 100% 100%, 0% 50%)",
          }}
          onClick={() => handleAreaClick("purpose")}
          data-testid="pyramid-purpose"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getArea("purpose").imageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-end pr-[10%]">
            <span
              className="text-white text-2xl font-serif"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              Purpose
            </span>
          </div>
        </div>

        {/* Wealth - Bottom Triangle */}
        <div
          className="absolute cursor-pointer overflow-hidden"
          style={{
            top: "50%",
            left: 0,
            right: 0,
            bottom: 0,
            clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
          }}
          onClick={() => handleAreaClick("wealth")}
          data-testid="pyramid-wealth"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getArea("wealth").imageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-end justify-center pb-[15%]">
            <span
              className="text-white text-2xl font-serif"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              Wealth
            </span>
          </div>
        </div>

        {/* God - Center Heart with 2px outline */}
        <div
          className="absolute cursor-pointer z-20 transition-transform hover:scale-105 active:scale-95"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "32%",
            aspectRatio: "1",
          }}
          onClick={() => handleAreaClick("god")}
          data-testid="pyramid-god"
        >
          <svg viewBox="0 0 100 90" className="w-full h-full">
            <defs>
              <clipPath id="heartClipPyramid">
                <path d="M50 85 C20 55, 0 35, 0 20 C0 8, 12 0, 25 0 C35 0, 45 7, 50 15 C55 7, 65 0, 75 0 C88 0, 100 8, 100 20 C100 35, 80 55, 50 85Z" />
              </clipPath>
            </defs>
            <g>
              <image
                href={getArea("god").imageUrl}
                x="-10"
                y="-5"
                width="120"
                height="100"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#heartClipPyramid)"
              />
              <path
                d="M50 85 C20 55, 0 35, 0 20 C0 8, 12 0, 25 0 C35 0, 45 7, 50 15 C55 7, 65 0, 75 0 C88 0, 100 8, 100 20 C100 35, 80 55, 50 85Z"
                fill="rgba(0,0,0,0.15)"
                clipPath="url(#heartClipPyramid)"
              />
              <path
                d="M50 85 C20 55, 0 35, 0 20 C0 8, 12 0, 25 0 C35 0, 45 7, 50 15 C55 7, 65 0, 75 0 C88 0, 100 8, 100 20 C100 35, 80 55, 50 85Z"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            </g>
            <text
              x="50"
              y="42"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="16"
              fontFamily="Marcellus, Georgia, serif"
              style={{ textShadow: "0 2px 6px rgba(0,0,0,0.8)" } as React.CSSProperties}
            >
              God
            </text>
          </svg>
        </div>
      </div>

      {/* Flipped Card Modal */}
      <AnimatePresence>
        {flippedArea && (
          <FlippedCardModal
            area={flippedArea}
            onClose={() => setFlippedArea(null)}
            onExplore={handleExplore}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
