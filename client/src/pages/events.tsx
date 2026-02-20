import Layout from "@/components/layout";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Search, ChevronLeft, ChevronRight, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllEvents } from "@/lib/api";
import { useLocation } from "wouter";
import type { Event } from "@shared/schema";

const EVENT_TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "nearby", label: "Nearby" },
  { id: "past", label: "Past" },
  { id: "yours", label: "Yours" },
];

export default function Events() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getAllEvents,
  });

  const filteredEvents = useMemo(() => {
    let filtered = events;

    const selectedDateStr = selectedDate.toISOString().split("T")[0];
    if (activeTab === "upcoming") {
      filtered = filtered.filter(e => e.date >= selectedDateStr);
    } else if (activeTab === "past") {
      filtered = filtered.filter(e => e.date < selectedDateStr);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.host.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [events, searchQuery, activeTab, selectedDate]);

  const getDateLabel = () => {
    const day = selectedDate.getDate();
    const monthName = selectedDate.toLocaleString('default', { month: 'long' });
    const todayDay = today.getDate();

    if (day === todayDay && selectedDate.getMonth() === today.getMonth()) return `Today, ${monthName} ${day}`;
    if (day === todayDay + 1 && selectedDate.getMonth() === today.getMonth()) return `Tomorrow, ${monthName} ${day}`;
    return `${monthName} ${day}`;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-normal text-muted-foreground mb-2">Meetings & Gatherings</h1>
          <p className="text-muted-foreground">Connect with the community in real-time.</p>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="flex gap-1.5 flex-wrap items-center">
            {EVENT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${activeTab === tab.id ? "bg-foreground text-background border-foreground" : "bg-white text-muted-foreground border-gray-200 hover:border-gray-400"}`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
            <Button className="gap-2 ml-2" onClick={() => setLocation("/events/create")} data-testid="button-create-event">
              <Plus className="w-4 h-4" /> Create Event
            </Button>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Event List - 2 Columns Wide */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h2 className="font-normal text-muted-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> {getDateLabel()}
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={{
                      ...event,
                      image: event.image || "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&q=80",
                      description: event.description || "",
                    }} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 p-8 text-center bg-muted/30">
                  <p className="text-muted-foreground mb-2">No events yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Be the first to create an event for the community!</p>
                  <Button onClick={() => setLocation("/events/create")} className="gap-2">
                    <Plus className="w-4 h-4" /> Create Event
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar Calendar - 1 Column Wide */}
          <div className="hidden lg:block sticky top-4">
            <Card className="border-none shadow-md bg-card rounded-sm">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-xs border-none w-full flex justify-center"
                  classNames={{
                    head_row: "flex w-full justify-between mb-2",
                    head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.75rem] uppercase",
                    row: "flex w-full mt-2 justify-between",
                    cell: "h-10 w-10 p-0 text-center text-xs relative flex items-center justify-center",
                    day: "h-10 w-10 p-0 font-normal flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity",
                    day_outside: "text-muted-foreground/40",
                    day_disabled: "text-muted-foreground/40",
                    day_hidden: "invisible",
                  }}
                />
                <style>{`
                  button[data-selected-single="true"],
                  button[data-range-start="true"],
                  button[data-range-end="true"] {
                    background-color: #6600ff !important;
                    border-radius: 50% !important;
                  }
                `}</style>
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Button className="rounded-md px-6" data-testid="button-today" onClick={() => setSelectedDate(new Date())}>Today</Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-xs border border-primary/10">
              <h3 className="font-normal text-muted-foreground mb-2">Host an Event?</h3>
              <p className="text-base text-muted-foreground mb-3">Community members can host their own gatherings.</p>
              <Button className="w-full rounded-lg px-6" onClick={() => setLocation("/events/create")} data-testid="button-host-event">Get Started</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
