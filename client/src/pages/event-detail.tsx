import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Users, 
  Share2, 
  Heart, 
  MessageSquare,
  ArrowLeft,
  Video,
  CheckCircle2,
  Repeat,
  Loader2,
  MapPin,
  Trash2,
  Edit
} from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEvent, rsvpToEvent, cancelRsvp, getMyRsvp, deleteEvent } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";

const DIMENSIONS: Record<string, { name: string; color: string }> = {
  god: { name: "God/LOVE", color: "#eb00a8" },
  mission: { name: "Mission", color: "#a2f005" },
  body: { name: "Body", color: "#6600ff" },
  mind: { name: "Mind", color: "#9900ff" },
  soul: { name: "Soul", color: "#cc00ff" },
  romance: { name: "Romance", color: "#e60023" },
  family: { name: "Family", color: "#ff6600" },
  community: { name: "Community", color: "#ffdf00" },
  money: { name: "Money", color: "#00d81c" },
  time: { name: "Time", color: "#00ccff" },
  environment: { name: "Environment", color: "#0033ff" },
};

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const [, setLocation] = useLocation();
  const eventId = params?.id;
  const queryClient = useQueryClient();
  const { profile } = useNostr();

  const { data: event, isLoading, error } = useQuery<any>({
    queryKey: ["event", eventId],
    queryFn: () => getEvent(eventId!),
    enabled: !!eventId,
  });

  const { data: rsvpStatus } = useQuery<{ isRsvped: boolean }>({
    queryKey: ["rsvp", eventId],
    queryFn: () => getMyRsvp(eventId!),
    enabled: !!eventId && !!profile?.userId,
  });

  const isRsvped = rsvpStatus?.isRsvped || false;
  const isOwner = profile?.userId && event?.creatorId === profile.userId;

  const rsvpMutation = useMutation({
    mutationFn: () => rsvpToEvent(eventId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["rsvp", eventId] });
      toast.success("You're going! Added to your calendar.");
    },
    onError: () => toast.error("Failed to RSVP"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelRsvp(eventId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["rsvp", eventId] });
      toast.success("RSVP cancelled");
    },
    onError: () => toast.error("Failed to cancel RSVP"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(eventId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted");
      setLocation("/events");
    },
    onError: () => toast.error("Failed to delete event"),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto p-4 lg:p-8 text-center py-24">
          <p className="text-muted-foreground mb-4">Event not found</p>
          <Link href="/events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const dim = event.dimension ? DIMENSIONS[event.dimension] : null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/events">
            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary text-muted-foreground gap-2" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Button>
          </Link>
          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setLocation(`/events/create?edit=${eventId}`)} data-testid="button-edit-event">
                <Edit className="w-4 h-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-destructive hover:bg-destructive hover:text-white" onClick={() => { if (confirm("Delete this event?")) deleteMutation.mutate(); }} data-testid="button-delete-event">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {event.image && (
              <div className="relative aspect-video rounded-xs overflow-hidden shadow-md">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" data-testid="img-event-hero" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2.5 py-0.5 rounded-md border border-gray-200 bg-white text-muted-foreground">
                  {event.category}
                </span>
                <span className="text-xs text-muted-foreground">{event.type}</span>
                {dim && (
                  <span className="flex items-center gap-1 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dim.color }} />
                    {dim.name}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-normal text-muted-foreground mb-4 leading-tight" data-testid="text-event-title">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${event.host}`} />
                    <AvatarFallback>{event.host.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Hosted by <span className="font-normal text-foreground">{event.host}</span></span>
                </div>
                <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees || 0} attending</span>
                </div>
              </div>

              {event.description && (
                <div className="prose prose-lg text-muted-foreground max-w-none">
                  <h3 className="font-serif font-normal text-xl text-muted-foreground mb-3">About this Event</h3>
                  <p className="text-lg leading-relaxed">{event.description}</p>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className="font-serif font-normal text-xl text-muted-foreground mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Discussion
              </h3>
              <div className="bg-muted/30 rounded-xs p-6 text-center">
                <p className="text-muted-foreground mb-4">Join the event to participate in the discussion.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg text-muted-foreground">
                      <Calendar className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-normal text-foreground">{formatDate(event.date)}</p>
                      {event.recurrence && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 text-primary font-normal">
                            <Repeat className="w-3 h-3" /> {event.recurrence}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg text-muted-foreground">
                      <Clock className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-normal text-foreground">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg text-muted-foreground">
                      {event.locationType === "in-person" ? <MapPin className="w-5 h-5" strokeWidth={1.5} /> : <Video className="w-5 h-5" strokeWidth={1.5} />}
                    </div>
                    <div>
                      <p className="font-normal text-foreground">{event.locationType === "in-person" ? "In Person" : "Online"}</p>
                      {event.location ? (
                        <p className="text-sm text-muted-foreground">{isRsvped ? event.location : "Details visible after RSVP"}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">{isRsvped ? "Link will be shared soon" : "Link visible after RSVP"}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  {isRsvped ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xs text-center">
                        <p className="text-green-600 font-normal flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5" /> You're going!
                        </p>
                      </div>
                      {event.location && (
                        <Button className="w-full gap-2 font-normal" variant="outline" data-testid="button-join-meeting">
                          <Video className="w-4 h-4" /> Join Meeting
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full text-muted-foreground hover:text-destructive"
                        onClick={() => cancelMutation.mutate()}
                        disabled={cancelMutation.isPending}
                        data-testid="button-change-rsvp"
                      >
                        {cancelMutation.isPending ? "Cancelling..." : "Cancel RSVP"}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full font-normal shadow-lg shadow-primary/20" 
                      onClick={() => {
                        if (!profile?.userId) {
                          toast.error("Please sign in to RSVP");
                          return;
                        }
                        rsvpMutation.mutate();
                      }}
                      disabled={rsvpMutation.isPending}
                      data-testid="button-rsvp"
                    >
                      {rsvpMutation.isPending ? "RSVPing..." : "RSVP Now"}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" className="w-full gap-2" data-testid="button-save-event">
                    <Heart className="w-4 h-4" /> Save
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }} data-testid="button-share-event">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-normal text-muted-foreground uppercase tracking-wider mb-3">
                    Who's Going ({event.attendees || 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(event.rsvpUsers || []).slice(0, 6).map((u: any) => (
                      <Avatar key={u.id} className="w-8 h-8 border border-card">
                        <AvatarImage src={u.avatar || `https://i.pravatar.cc/100?u=${u.id}`} />
                        <AvatarFallback>{(u.name || "U").charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {(event.attendees || 0) > 6 && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-normal text-muted-foreground border border-card">
                        +{(event.attendees || 0) - 6}
                      </div>
                    )}
                    {(!event.rsvpUsers || event.rsvpUsers.length === 0) && (
                      <p className="text-sm text-muted-foreground">Be the first to RSVP!</p>
                    )}
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
