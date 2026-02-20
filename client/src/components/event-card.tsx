import { 
  Clock, 
  Users, 
  Calendar as CalendarIcon 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group bg-card cursor-pointer flex flex-col h-full rounded-xs">
        <div className="h-[2px] w-full bg-primary" />
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </div>

        <CardContent className="p-4 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground">
                {event.category}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {event.date}
              </span>
            </div>

            <h3 className="font-normal text-lg leading-tight text-muted-foreground group-hover:text-primary transition-colors line-clamp-1">
              {event.title}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 mb-2">
              <span className="font-normal text-foreground">{event.time}</span>
              <span>•</span>
              <span>{event.type}</span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-card bg-muted overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Attendee" />
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-normal">+{event.attendees} going</span>
            </div>

            <Button className="px-6 transition-colors" data-testid="button-event-rsvp">
              RSVP
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
