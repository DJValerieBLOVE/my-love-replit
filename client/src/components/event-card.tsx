import { Calendar, MapPin, Clock, Users, MoreHorizontal, Video, ArrowRight } from "lucide-react";
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
      <div className="flex flex-col md:flex-row">
        {/* Date & Image Section */}
        <div className="md:w-48 h-48 md:h-auto relative shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center min-w-[60px] shadow-sm">
            <span className="block text-xs font-bold text-red-500 uppercase tracking-wider">{event.date === "Today" ? "NOW" : "NOV"}</span>
            <span className="block text-xl font-black leading-none text-black">27</span>
          </div>
          <Badge className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-md border-none text-white">
            {event.type}
          </Badge>
        </div>

        {/* Content Section */}
        <CardContent className="p-5 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 border-none">
              {event.category}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          
          <div className="flex flex-col gap-1.5 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{event.date} • {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-500" />
              <span>Hosted by {event.host} (Open)</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              <span>{event.attendees} going</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {event.description}
          </p>

          <div className="mt-auto pt-4 border-t flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-muted overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Attendee" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                +{event.attendees - 4}
              </div>
            </div>
            <Button size="sm" className="group-hover:translate-x-1 transition-transform">
              RSVP <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
