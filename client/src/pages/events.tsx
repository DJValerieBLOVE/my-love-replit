import Layout from "@/components/layout";
import { EVENTS } from "@/lib/mock-data";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventHeader from "@assets/generated_images/zoom_meeting_event.png";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useMemo } from "react";

export default function Events() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  
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
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Meetings & Gatherings</h1>
            <p className="text-muted-foreground">Connect with the community in real-time.</p>
          </div>
          <Button className="bg-[#6600ff] hover:bg-[#5500dd] text-white shadow-lg rounded-lg font-bold px-6 py-1.5 h-8" data-testid="button-create-event">
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="flex gap-2">
            <Button className="bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold px-6 py-1.5 h-8 rounded-lg">Upcoming</Button>
            <Button variant="outline" className="text-muted-foreground font-bold px-6 py-1.5 h-8 rounded-lg">Nearby</Button>
            <Button variant="outline" className="text-muted-foreground font-bold px-6 py-1.5 h-8 rounded-lg">Past</Button>
            <Button variant="outline" className="text-muted-foreground font-bold px-6 py-1.5 h-8 rounded-lg">Yours</Button>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search events..." className="pl-9 bg-background" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Event List - 2 Columns Wide */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h2 className="font-bold text-muted-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> {getDateLabel()}
              </h2>
              {selectedMeetings.length > 0 ? (
                selectedMeetings.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <p className="text-muted-foreground">No meetings scheduled for this date</p>
              )}
            </div>
          </div>

          {/* Sidebar Calendar - 1 Column Wide */}
          <div className="hidden lg:block sticky top-4">
            <Card className="border-none shadow-md bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="font-bold text-lg">November 2025</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md"><ChevronLeft className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md"><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-xs border-none w-full flex justify-center"
                  classNames={{
                    head_row: "flex w-full justify-between mb-2",
                    head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.75rem] uppercase font-bold",
                    row: "flex w-full mt-2 justify-between",
                    cell: "h-10 w-10 p-0 text-center text-xs relative flex items-center justify-center",
                    day: "h-10 w-10 p-0 font-medium flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity",
                    day_outside: "text-muted-foreground/40",
                    day_disabled: "text-muted-foreground/40",
                    day_hidden: "invisible",
                  }}
                />
                <style>{`
                  button[data-selected-single="true"],
                  button[data-range-start="true"],
                  button[data-range-end="true"] {
                    background-color: red !important;
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
                  <Button size="sm" className="text-xs h-7 rounded-md bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold px-6" data-testid="button-today" onClick={() => setSelectedDate(new Date())}>Today</Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-xs border border-primary/10">
              <h3 className="font-bold text-primary mb-2">Host an Event?</h3>
              <p className="text-base text-muted-foreground mb-3">Community members can host their own gatherings.</p>
              <Button className="w-full rounded-lg bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold px-6 py-1.5 h-8" data-testid="button-learn-more">Learn More</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
