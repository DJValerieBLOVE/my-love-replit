import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Share2, 
  Heart, 
  MessageSquare,
  ArrowLeft,
  Video,
  CheckCircle2
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { EVENTS } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id;
  const event = EVENTS.find(e => e.id === eventId) || EVENTS[0];
  const [isRsvped, setIsRsvped] = useState(false);

  const handleRsvp = () => {
    setIsRsvped(!isRsvped);
    if (!isRsvped) {
      toast.success("You're going! Added to your calendar.");
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        <Link href="/events">
          <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary text-muted-foreground gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-md group">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-black hover:bg-white font-bold backdrop-blur-md border-none">
                  {event.category}
                </Badge>
              </div>
            </div>

            {/* Header Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-muted-foreground mb-4 leading-tight">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${event.host}`} />
                    <AvatarFallback>H</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Hosted by <span className="font-bold text-foreground">{event.host}</span></span>
                </div>
                <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-lg text-muted-foreground max-w-none">
                <h3 className="font-serif font-bold text-xl text-muted-foreground mb-3">About this Event</h3>
                <p className="text-lg leading-relaxed">
                  {event.description} Join us for an incredible session of connection, learning, and growth. 
                  This gathering is designed to bring our community together to share insights and support one another 
                  on our collective journey.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  Whether you're a seasoned member or just getting started, you'll find value in the deep discussions 
                  and practical takeaways we have planned. Don't miss this opportunity to level up your vibration!
                </p>
              </div>
            </div>

            {/* Discussion / Comments Placeholder */}
            <div className="pt-8 border-t border-border">
              <h3 className="font-serif font-bold text-xl text-muted-foreground mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Discussion
              </h3>
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <p className="text-muted-foreground mb-4">Join the event to participate in the discussion.</p>
                <Button variant="outline">View 12 Comments</Button>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                {/* Date/Time Block */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">
                        {event.date === "Today" ? "Today, November 28" : "Tomorrow, November 29"}
                      </p>
                      <p className="text-sm text-muted-foreground">Friday</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{event.time} - {parseInt(event.time) + 1}:00pm EST</p>
                      <p className="text-sm text-muted-foreground">1 hour duration</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Online via Zoom</p>
                      <p className="text-sm text-muted-foreground">Link visible after RSVP</p>
                    </div>
                  </div>
                </div>

                {/* RSVP Action */}
                <div className="pt-4 border-t border-border">
                  {isRsvped ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                        <p className="text-green-600 font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5" /> You're going!
                        </p>
                      </div>
                      <Button className="w-full gap-2 font-bold" variant="outline">
                        <Video className="w-4 h-4" /> Join Meeting
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-muted-foreground hover:text-destructive"
                        onClick={() => setIsRsvped(false)}
                      >
                        Change RSVP
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
                      onClick={handleRsvp}
                    >
                      RSVP Now
                    </Button>
                  )}
                </div>

                {/* Social Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" className="w-full gap-2">
                    <Heart className="w-4 h-4" /> Save
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>

                {/* Attendees Preview */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Who's Going ({event.attendees})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5,6].map(i => (
                      <Avatar key={i} className="w-8 h-8 border border-card">
                        <AvatarImage src={`https://i.pravatar.cc/100?img=${i + 20}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border border-card">
                      +78
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
