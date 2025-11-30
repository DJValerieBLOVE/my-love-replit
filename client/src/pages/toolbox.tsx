import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
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
  Bot
} from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock Data for Toolbox
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

export default function Toolbox() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-muted-foreground flex items-center gap-3">
              <Wrench className="w-8 h-8 text-primary" /> My Toolbox
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Your personalized collection of bookmarks, worksheets, and resources.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/mentor">
              <Button variant="outline" className="gap-2">
                <Bot className="w-4 h-4 text-[#6600ff]" /> Mentor Studio
              </Button>
            </Link>
            <Button className="px-6 gap-2">
              <Plus className="w-4 h-4" /> Add New Item
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="w-full md:w-auto bg-muted/50 p-1 h-auto flex-wrap justify-start">
            <TabsTrigger value="all" className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">All Items</TabsTrigger>
            <TabsTrigger value="experiments" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bookmark className="w-4 h-4" /> Saved Experiments
            </TabsTrigger>
            <TabsTrigger value="worksheets" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4" /> Files & Worksheets
            </TabsTrigger>
            <TabsTrigger value="links" className="px-6 py-2 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <LinkIcon className="w-4 h-4" /> Links & Books
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {/* Combined View Section 1: Favorites/Experiments */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" /> Recent Saves
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

            {/* Combined View Section 2: Files */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Worksheets & Files
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {WORKSHEETS.map((file) => (
                  <Card key={file.id} className="border-none shadow-sm hover:bg-muted/30 transition-colors group">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{file.title}</h4>
                        <p className="text-xs text-muted-foreground">{file.type} • {file.size}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Download className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Combined View Section 3: Bookmarks */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" /> Books & Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BOOKMARKS.map((item) => (
                  <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all group">
                    <CardContent className="p-4 flex gap-4">
                      {item.cover ? (
                        <div className="w-16 h-24 rounded-md bg-gray-200 shrink-0 overflow-hidden shadow-sm">
                          <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-24 rounded-md bg-gray-100 shrink-0 flex items-center justify-center text-muted-foreground">
                          <LinkIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex flex-col justify-between flex-1 py-1">
                        <div>
                          <Badge variant="outline" className="mb-2 text-[10px] h-5 px-1.5">{item.type}</Badge>
                          <h4 className="font-bold text-sm leading-tight mb-1 line-clamp-2">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.author}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="experiments">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAVED_EXPERIMENTS.map((item) => (
                <Card key={item.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group cursor-pointer">
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-3 right-3 z-20 bg-white/90 text-black hover:bg-white font-normal">
                      {item.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                    <div className="w-full bg-muted rounded-full h-2 mt-2 mb-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center mt-4">
                       <span className="text-sm text-muted-foreground">{item.progress}% Complete</span>
                       <Button size="sm">Continue</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="worksheets">
            <Card className="border-dashed border-2 border-muted bg-muted/30 mb-8">
              <CardContent className="p-12 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Drop files here to upload</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                  Upload worksheets, PDFs, or images to keep them handy in your toolbox.
                </p>
                <Button variant="outline" className="mt-4 gap-2">
                   Select Files
                </Button>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WORKSHEETS.map((file) => (
                <Card key={file.id} className="border-none shadow-sm hover:bg-muted/30 transition-colors group">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="font-bold text-base truncate">{file.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{file.type} • {file.size} • Added {file.date}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="links">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BOOKMARKS.map((item) => (
                <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
                  <div className="aspect-[2/3] w-full bg-gray-100 relative overflow-hidden rounded-t-xl">
                    {item.cover ? (
                      <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                        <LinkIcon className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <Badge variant="secondary" className="w-fit mb-2">{item.type}</Badge>
                    <h3 className="font-bold text-base leading-tight mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.author}</p>
                    <div className="mt-auto pt-2 border-t flex justify-between items-center">
                       <span className="text-xs text-muted-foreground">Added 2d ago</span>
                       <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 px-2">Remove</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
