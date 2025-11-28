import { 
  Clock, 
  Users, 
  MoreHorizontal, 
  Video, 
  ArrowRight,
  Calendar as CalendarIcon 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventProps {
  event: {
    id: string;
    title: string;
    host: string;
    date: string;
    time: string;
    type: string;
    attendees: number;
    image: string;
    description: string;
    category: string;
  };
}

export function EventCard({ event }: EventProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group bg-card">
      <div className="flex flex-row h-40 sm:h-48">
        {/* Date & Image Section - Compact on left */}
        <div className="w-32 sm:w-48 relative shrink-0 overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          
          {/* Category Badge - Top Left */}
          <div className="absolute top-0 left-0 p-2 z-20">
             <Badge variant="secondary" className="bg-white/90 text-black text-[10px] font-bold shadow-sm backdrop-blur-sm hover:bg-white">
              {event.category}
            </Badge>
          </div>

          {/* Date Block - Bottom Left overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent z-20">
             <div className="text-white font-bold text-xs flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                <span>{event.date === "Today" ? "TODAY" : "NOV 28"}</span>
             </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {event.title}
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1 text-muted-foreground shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 mb-2">
              <span className="font-medium text-foreground">{event.time}</span>
              <span>•</span>
              <span>{event.type}</span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
              {event.description}
            </p>
            
            {/* Mobile-only description truncation */}
            <p className="text-sm text-muted-foreground line-clamp-1 sm:hidden">
              {event.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
               <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-card bg-muted overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Attendee" />
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">+{event.attendees} going</span>
            </div>

            <Button size="sm" className="h-7 text-xs px-6 bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold transition-colors" data-testid="button-event-rsvp">
              RSVP
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
