import Layout from "@/components/layout";
import { FeedPost } from "@/components/feed-post";
import { FEED_POSTS, CURRENT_USER } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Play, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EqVisualizer } from "@/components/eq-visualizer";
import { Link } from "wouter";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              Welcome to the LOVE Lab 🔬
            </h1>
            <p className="text-lg text-muted-foreground">
              Life is an experiment. Play with curiosity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <HelpCircle className="w-4 h-4" /> How it works
            </Button>
            <Link href="/journal">
              <Button className="bg-[#6600ff] hover:bg-[#5500dd] text-white font-bold px-6 shadow-lg shadow-primary/20 gap-2">
                <Play className="w-4 h-4 fill-current" /> Daily 5 V's
              </Button>
            </Link>
          </div>
        </div>

        {/* EQ Visualizer Section */}
        {/* <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🎚️</span> Your EQ Visualizer
            </h2>
            <span className="text-sm text-muted-foreground">Level 12 • Guide</span>
          </div>
          <EqVisualizer />
        </section> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Actions & Wonder */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Wonder Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-white border-none shadow-md overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl flex-shrink-0">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif mb-2 text-primary">Daily Wonder</h3>
                    <p className="text-xl font-medium text-foreground italic mb-6">
                      "What if life isn't a test you can fail... but an experiment you get to play?"
                    </p>
                    <Button variant="secondary" className="bg-white hover:bg-purple-50 text-primary border border-purple-100">
                      Capture Reflection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity / Feed */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Lab Community</h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {FEED_POSTS.map((post) => (
                  <FeedPost key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Widgets (Mobile only usually, but here reinforcing) */}
          <div className="space-y-6">
             {/* Current Experiment */}
            <Card className="border-none shadow-md overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
              <div className="h-32 bg-gray-900 relative">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop" 
                  alt="Experiment"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="text-xs font-bold bg-primary px-2 py-0.5 rounded-full mb-1 inline-block">Active Experiment</span>
                  <h3 className="font-bold text-lg leading-tight">Morning Miracle</h3>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Day 3 of 7</span>
                  <span className="font-bold text-primary">42%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div className="bg-primary h-2 rounded-full w-[42%]" />
                </div>
                <Button className="w-full" variant="outline">Continue</Button>
              </CardContent>
            </Card>

            {/* Toolbox Quick Access */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Your Toolbox</h3>
                <div className="space-y-2">
                  {['Snap! Breath', 'Vibe Check', 'Morning Dance'].map((tool, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                      <span className="text-sm font-medium">{tool}</span>
                      <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
