import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Video, Mic } from "lucide-react";

export default function Resources() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-muted-foreground">Resources</h1>
          <p className="text-muted-foreground">Playlists, meditations, and vibes.</p>
        </div>

        <div className="grid gap-8">
          {/* Music Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
              <Music className="w-5 h-5 text-primary" /> Music & Playlists
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <Music className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-muted-foreground">High Vibe Mix {i}</h3>
                    <p className="text-xs text-muted-foreground">Curated for energy</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Meditations Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
              <Mic className="w-5 h-5 text-cyan-500" /> Meditations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-cyan-500 to-blue-500 relative overflow-hidden">
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-muted-foreground">Morning Calm {i}</h3>
                    <p className="text-xs text-muted-foreground">10 min • Guided</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
