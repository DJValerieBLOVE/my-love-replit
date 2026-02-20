import Layout from "@/components/layout";
import { EVENTS } from "@/lib/mock-data";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Search, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import EventHeader from "@assets/generated_images/zoom_meeting_event.png";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo } from "react";

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
  
  // Get meetings for selected date
  const selectedMeetings = useMemo(() => {
    const selectedDay = selectedDate.getDate();
    const todayDay = today.getDate();
    
    if (selectedDay === todayDay) return EVENTS.filter(e => e.date === "Today");
    if (selectedDay === todayDay + 1) return EVENTS.filter(e => e.date === "Tomorrow");
    return [];
  }, [selectedDate, today]);

  // Map event dates to check which days have events
  const eventDays = useMemo(() => {
    const days = new Set<number>();
    const todayDay = today.getDate();
    EVENTS.forEach(event => {
      if (event.date === "Today") days.add(todayDay);
      if (event.date === "Tomorrow") days.add(todayDay + 1);
    });
    return days;
  }, [today]);

  const getDateLabel = () => {
    const day = selectedDate.getDate();
    const monthName = selectedDate.toLocaleString('default', { month: 'long' });
    const todayDay = today.getDate();
    
    if (day === todayDay) return `Today, ${monthName} ${day}`;
    if (day === todayDay + 1) return `Tomorrow, ${monthName} ${day}`;
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
            <Button className="gap-2 ml-2" data-testid="button-create-event">
              <Plus className="w-4 h-4" /> Create Event
            </Button>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search events..." className="pl-9 bg-white" />
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
              {selectedMeetings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedMeetings.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No meetings scheduled for this date</p>
              )}
            </div>
          </div>

          {/* Sidebar Calendar - 1 Column Wide */}
          <div className="hidden lg:block sticky top-4">
            <Card className="border-none shadow-md bg-card rounded-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="font-normal text-lg text-muted-foreground">November 2025</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="rounded-md"><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-md"><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-xs border-none w-full flex justify-center"
                  classNames={{
                    head_row: "flex w-full justify-between mb-2",
                    head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.75rem] uppercase font-normal",
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
                  ${Array.from(eventDays).map(day => `
                    .rdp-cell:nth-child(${(day - 1) % 7 + 1}) button[data-selected-single="true"]::after,
                    .rdp-cell:nth-child(${(day - 1) % 7 + 1}) button:not([data-selected-single])::after {
                      content: '•';
                      position: absolute;
                      bottom: 0;
                      font-size: 10px;
                      color: #6600ff;
                      font-weight: bold;
                    }
                  `).join('')}
                `}</style>
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Button className="rounded-md px-6" data-testid="button-today" onClick={() => setSelectedDate(new Date())}>Today</Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-xs border border-primary/10">
              <h3 className="font-normal text-muted-foreground mb-2">Host an Event?</h3>
              <p className="text-base text-muted-foreground mb-3">Community members can host their own gatherings.</p>
              <Button className="w-full rounded-lg px-6" data-testid="button-learn-more">Learn More</Button>
            </div>

            <div className="mt-6">
              <Card className="p-6 border-dashed border-2 flex flex-col items-center justify-center text-center py-8 bg-muted/30 border-muted">
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-normal text-muted-foreground">Live Q&A with Dr. Maya</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Friday, 2:00 PM EST • Zoom</p>
                <Button className="rounded-lg px-6 w-full" data-testid="button-rsvp-sidebar">RSVP Now</Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
