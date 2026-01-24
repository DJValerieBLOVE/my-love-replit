import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

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

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${title} card. ${isFlipped ? "Showing details. Press to flip back." : "Press to see details."}`}
      className={cn(
        "relative w-full h-full cursor-pointer",
        className
      )}
      style={{ perspective: "1000px" }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
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
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-bold mb-0.5">{title}</h3>
            <p className="text-sm text-white/80">{subtitle}</p>
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
          <div className="flex flex-col h-full p-5">
            <div className="flex-1">{backContent}</div>
            <Button
              className="w-full mt-3 bg-gray-900 hover:bg-gray-800 text-white"
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
  );
}
