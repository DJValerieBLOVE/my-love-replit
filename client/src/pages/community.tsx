import Layout from "@/components/layout";
import { CLUBS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import CommunityCover from "@assets/generated_images/community_cover.png";

export default function Community() {
  return (
    <Layout>
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        <img 
          src={CommunityCover} 
          alt="Community" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-6 z-20">
          <h1 className="text-3xl font-serif font-bold text-foreground">Community Spaces</h1>
          <p className="text-muted-foreground max-w-md">Connect with like-minded individuals on your journey.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLUBS.map((space) => (
            <Card key={space.id} className="hover:shadow-md transition-all border-none bg-card/50 shadow-sm group cursor-pointer overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-primary/20 to-primary/5 group-hover:from-primary group-hover:to-purple-400 transition-all" />
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 ${space.color}`}>
                  <space.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{space.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-base text-muted-foreground mb-4 line-clamp-2">
                  {space.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <Users className="w-3 h-3" />
                  <span>1.2k members</span>
                </div>
                <div className="flex-1 flex items-end justify-center">
                  <Button size="sm" className="h-7 px-6 bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold transition-all" data-testid="button-join-club">
                    Join <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
          <Card className="p-6 border-dashed border-2 flex flex-col items-center justify-center text-center py-12 bg-muted/30">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-bold">Live Q&A with Dr. Maya</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Friday, 2:00 PM EST • Zoom</p>
            <Button className="bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold rounded-lg px-6 py-1.5 h-8" data-testid="button-rsvp">RSVP Now</Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
