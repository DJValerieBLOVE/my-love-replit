import Layout from "@/components/layout";
import { EVENTS } from "@/lib/mock-data";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventHeader from "@assets/generated_images/zoom_meeting_event.png";

export default function Events() {
  return (
    <Layout>
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-purple-900/80 z-10" />
        <img 
          src={EventHeader} 
          alt="Events" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 max-w-5xl mx-auto">
            <div>
              <h1 className="text-3xl font-serif font-bold text-white mb-2">Meetings & Gatherings</h1>
              <p className="text-white/80 max-w-lg">Connect with the community in real-time. Join workshops, Q&As, and support circles.</p>
            </div>
            <Button className="bg-white text-primary hover:bg-white/90 shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-card p-2 rounded-xl border shadow-sm">
          <Tabs defaultValue="upcoming" className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="nearby">Nearby</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="yours">Yours</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search events..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <CalendarIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Event List */}
        <div className="grid gap-4">
          <h2 className="font-bold text-muted-foreground text-sm uppercase tracking-wider mb-2">Today, November 27</h2>
          {EVENTS.filter(e => e.date === "Today").map((event) => (
            <EventCard key={event.id} event={event} />
          ))}

          <h2 className="font-bold text-muted-foreground text-sm uppercase tracking-wider mt-6 mb-2">Tomorrow, November 28</h2>
          {EVENTS.filter(e => e.date !== "Today").map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
