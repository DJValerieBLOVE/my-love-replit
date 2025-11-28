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

export default function Events() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Meetings & Gatherings</h1>
            <p className="text-muted-foreground">Connect with the community in real-time.</p>
          </div>
          <Button className="bg-[#6600ff] hover:bg-[#5500dd] text-white shadow-lg rounded-lg font-bold" data-testid="button-create-event">
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <Tabs defaultValue="upcoming" className="w-full md:w-auto">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="nearby">Nearby</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="yours">Yours</TabsTrigger>
            </TabsList>
          </Tabs>
          
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
                <CalendarIcon className="w-4 h-4" /> Today, November 27
              </h2>
              {EVENTS.filter(e => e.date === "Today").map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="font-bold text-muted-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> Tomorrow, November 28
              </h2>
              {EVENTS.filter(e => e.date !== "Today").map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
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
                  selected={new Date()}
                  className="rounded-sm border-none w-full flex justify-center pointer-events-none"
                  classNames={{
                    head_row: "flex w-full justify-between",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2 justify-between",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 hover:text-primary rounded-full transition-colors",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-md",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_hidden: "invisible",
                  }}
                />
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Button size="sm" className="text-xs h-7 rounded-md bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold" data-testid="button-today">Today</Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-sm border border-primary/10">
              <h3 className="font-bold text-primary mb-2">Host an Event?</h3>
              <p className="text-sm text-muted-foreground mb-3">Community members can host their own gatherings.</p>
              <Button className="w-full rounded-lg bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold" data-testid="button-learn-more">Learn More</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
