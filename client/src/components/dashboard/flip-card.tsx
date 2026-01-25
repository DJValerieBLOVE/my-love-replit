import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Pin } from "lucide-react";

interface FlipCardProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  frontContent?: React.ReactNode;
  backContent: React.ReactNode;
  detailsLink?: string;
  onDetailsClick?: () => void;
  className?: string;
}

export function FlipCard({
  title,
  subtitle,
  backgroundImage,
  frontContent,
  backContent,
  detailsLink,
  onDetailsClick,
  className,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!isPinned) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMouseEnter = () => {
    if (window.matchMedia("(min-width: 1024px)").matches && !isPinned) {
      setIsHovered(true);
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia("(min-width: 1024px)").matches && !isPinned) {
      setIsHovered(false);
      setIsFlipped(false);
    }
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPinned) {
      setIsPinned(false);
      setIsFlipped(false);
    } else {
      setIsPinned(true);
      setIsFlipped(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isPinned) {
        setIsFlipped(!isFlipped);
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${title} card. ${isFlipped ? "Showing details. Press to flip back." : "Press to see details."}`}
      className={cn(
        "relative w-full cursor-pointer min-h-[200px] sm:min-h-[180px] md:min-h-[160px] lg:min-h-[140px] aspect-[4/3] sm:aspect-[3/2]",
        className
      )}
      style={{ perspective: "1000px" }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative w-full h-full transition-transform duration-[600ms] ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 w-full h-full rounded-sm overflow-hidden shadow-sm"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
            <h3 className="text-base md:text-lg font-bold mb-0.5 drop-shadow-lg">{title}</h3>
            <p className="text-xs md:text-sm text-white/90 drop-shadow-md">{subtitle}</p>
          </div>
          {frontContent && (
            <div className="absolute top-3 right-3">{frontContent}</div>
          )}
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 w-full h-full rounded-sm overflow-hidden shadow-sm bg-white"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex flex-col h-full p-4 relative">
            <button
              onClick={handlePinClick}
              className={cn(
                "absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all",
                isPinned 
                  ? "bg-love-body text-white shadow-md" 
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              )}
              aria-label={isPinned ? "Unpin card" : "Pin card open"}
              data-testid="button-pin-card"
            >
              <Pin className={cn("w-3.5 h-3.5", isPinned && "rotate-45")} />
            </button>
            <div className="flex-1 overflow-y-auto pb-14">{backContent}</div>
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDetailsClick) onDetailsClick();
                }}
              >
                Details <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
