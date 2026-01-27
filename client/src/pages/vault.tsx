import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Music, 
  Mic, 
  Wrench, 
  Plus, 
  Bookmark, 
  FileText, 
  Link as LinkIcon, 
  Download, 
  ExternalLink, 
  BookOpen,
  MoreHorizontal,
  Trash2,
  Bot,
  Heart,
  PenLine,
  FlaskConical,
  Lightbulb,
  Sparkles,
  Search,
  Lock,
  Sun,
  Eye,
  ChevronLeft,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getJournalEntries } from "@/lib/api";
import { useNostr } from "@/contexts/nostr-context";

const SAVED_EXPERIMENTS = [
  {
    id: 1,
    title: "Morning Miracle",
    category: "Routine",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=200&fit=crop",
    progress: 42
  },
  {
    id: 2,
    title: "Bitcoin Basics",
    category: "Finance",
    image: "https://images.unsplash.com/photo-1518546305927-5a5b0f98795f?w=400&h=200&fit=crop",
    progress: 10
  }
];

const WORKSHEETS = [
  {
    id: 1,
    title: "11x Life Audit Template",
    type: "PDF",
    size: "2.4 MB",
    date: "Nov 20, 2025"
  },
  {
    id: 2,
    title: "Daily 5 V's Tracker",
    type: "Excel",
    size: "1.1 MB",
    date: "Nov 22, 2025"
  },
  {
    id: 3,
    title: "Dream Journal Prompts",
    type: "PDF",
    size: "500 KB",
    date: "Nov 25, 2025"
  }
];

const BOOKMARKS = [
  {
    id: 1,
    title: "The Bitcoin Standard",
    author: "Saifedean Ammous",
    type: "Book",
    url: "#",
    cover: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=200&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Breaking the Habit of Being Yourself",
    author: "Dr. Joe Dispenza",
    type: "Book",
    url: "#",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop"
  },
  {
    id: 3,
    title: "Introduction to Lightning Network",
    author: "Article",
    type: "Link",
    url: "#",
    cover: null
  }
];

export default function Vault() {
  const [activeTab, setActiveTab] = useState("lab-notes");
  const { isConnected } = useNostr();

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journalEntries"],
    queryFn: () => getJournalEntries(10),
    enabled: isConnected,
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-muted-foreground flex items-center gap-3">
              <Wrench className="w-8 h-8 text-muted-foreground" /> Vault
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Your notes, tools, playlists, and saved content all in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/mentor">
              <Button variant="outline" className="gap-2">
                <Bot className="w-4 h-4 text-muted-foreground" /> Mentor Studio
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full md:w-auto bg-[#FAFAFA] p-1 h-auto flex-wrap justify-start">
            <TabsTrigger value="lab-notes" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <PenLine className="w-4 h-4" /> Lab Notes
            </TabsTrigger>
            <TabsTrigger value="toolbox" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Wrench className="w-4 h-4" /> My Vault
            </TabsTrigger>
            <TabsTrigger value="media" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Music className="w-4 h-4" /> Music & Meditations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lab-notes" className="space-y-6">
            <div className="flex gap-3 mb-6">
              <Link href="/journal?startPractice=true">
                <Button className="gap-2">
                  <Heart className="w-4 h-4" /> Daily LOVE Practice
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> New Note
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="focus:bg-love-body/10 focus:text-love-body cursor-pointer">
                    <FlaskConical className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Experiment Note
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-love-body/10 focus:text-love-body cursor-pointer">
                    <Lightbulb className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Discovery Note
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-love-body/10 focus:text-love-body cursor-pointer">
                    <Sparkles className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} /> Magic Mentor Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-muted-foreground/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input placeholder="Search notes..." className="h-9 pl-9 bg-transparent border border-border/40" />
              </div>
            </div>

            <div className="grid gap-4">
              {(journalEntries as any[]).slice(0, 5).map((entry: any) => (
                <Card key={entry.id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Heart className="w-3 h-3" strokeWidth={1.5} />
                        <span className="text-xs font-medium">Daily LOVE Practice</span>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-muted-foreground/40" strokeWidth={1.5} />
                    </div>
                    <div className="text-lg font-serif font-bold text-foreground mb-2">
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.gratitude || entry.reflection || "No content..."}
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              {journalEntries.length === 0 && (
                <Card className="border-dashed border-2 bg-muted/20">
                  <CardContent className="p-8 text-center">
                    <PenLine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">No notes yet</h3>
                    <p className="text-muted-foreground mb-4">Start your first Daily LOVE Practice to create your first note.</p>
                    <Link href="/journal?startPractice=true">
                      <Button className="gap-2">
                        <Heart className="w-4 h-4" /> Start Practice
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="toolbox" className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
                <Bookmark className="w-5 h-5 text-muted-foreground" /> Saved Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAVED_EXPERIMENTS.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-3 right-3 z-20 bg-white/90 text-black hover:bg-white font-normal">
                        {item.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2 mb-1">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${item.progress}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">{item.progress}% Complete</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
                <FileText className="w-5 h-5 text-muted-foreground" /> Worksheets & Files
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WORKSHEETS.map((file) => (
                  <div key={file.id} className="flex items-start justify-between p-3 bg-[#FAFAFA] rounded-md border border-[#E5E5E5]">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <FileText className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-medium text-sm leading-tight mb-1">{file.title}</p>
                        <p className="text-xs text-muted-foreground">{file.type} • {file.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary shrink-0 mt-0.5">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
                <LinkIcon className="w-5 h-5 text-muted-foreground" /> Books & Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BOOKMARKS.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-3 bg-[#FAFAFA] rounded-md border border-[#E5E5E5]">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                         {item.type === 'Book' ? <BookOpen className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} /> : 
                          <LinkIcon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm leading-tight mb-1 pr-2">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.type} • {item.author}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 mt-0.5">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="media" className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
                <Music className="w-5 h-5 text-muted-foreground" /> Music & Playlists
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

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-muted-foreground">
                <Mic className="w-5 h-5 text-muted-foreground" /> Meditations
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
