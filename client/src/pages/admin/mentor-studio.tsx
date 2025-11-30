import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Bot, 
  Upload, 
  FileText, 
  Book, 
  Sparkles, 
  BrainCircuit, 
  MessageSquare, 
  Settings2, 
  UserCog,
  Plus,
  Trash2,
  Save
} from "lucide-react";
import { useState } from "react";

export default function MentorStudio() {
  const [files, setFiles] = useState([
    { id: 1, name: "11x_LOVE_Methodology.pdf", type: "PDF", size: "2.4 MB", status: "Trained" },
    { id: 2, name: "The_Morning_5Vs_Guide.docx", type: "DOCX", size: "1.1 MB", status: "Trained" },
    { id: 3, name: "Sacred_Geometry_Meanings.txt", type: "TXT", size: "15 KB", status: "Processing..." },
  ]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-muted-foreground mb-2 flex items-center gap-2">
              <Bot className="w-8 h-8 text-[#6600ff]" /> Magic Mentor Studio
            </h1>
            <p className="text-muted-foreground">
              Train your AI companion and configure its personality.
            </p>
          </div>
          <Button className="gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>

        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-3 h-12 bg-muted/50 p-1">
            <TabsTrigger value="knowledge" className="font-serif">Knowledge Base</TabsTrigger>
            <TabsTrigger value="personality" className="font-serif">Personality & Tone</TabsTrigger>
            <TabsTrigger value="user-settings" className="font-serif">User Controls</TabsTrigger>
          </TabsList>

          {/* KNOWLEDGE BASE TAB */}
          <TabsContent value="knowledge" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Upload Area */}
              <Card className="md:col-span-2 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-primary" /> Core Knowledge
                  </CardTitle>
                  <CardDescription>
                    Upload your books, course materials, and guides. The Mentor will use these to answer questions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg mb-1">Upload Training Materials</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag & drop PDF, DOCX, or TXT files here
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">Select Files</Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Knowledge Sources</h4>
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="bg-background p-2 rounded shadow-sm">
                              {file.type === "PDF" ? <FileText className="w-5 h-5 text-red-500" /> : 
                               file.type === "DOCX" ? <FileText className="w-5 h-5 text-blue-500" /> : 
                               <FileText className="w-5 h-5 text-gray-500" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{file.size} • {file.status}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats / Info */}
              <div className="space-y-6">
                <Card className="border-none shadow-sm bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Training Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Documents Processed</span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Knowledge Tokens</span>
                      <span className="font-bold">145k</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Update</span>
                      <span className="font-bold">2h ago</span>
                    </div>
                    <Separator className="bg-primary/20" />
                    <div className="pt-2">
                      <Button className="w-full shadow-sm">
                        <Sparkles className="w-4 h-4 mr-2" /> Test Knowledge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* PERSONALITY TAB */}
          <TabsContent value="personality" className="mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" /> Base Personality
                </CardTitle>
                <CardDescription>
                  Define how the Magic Mentor speaks and behaves by default.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="font-medium">Tone Warmth</label>
                    <span className="text-sm text-muted-foreground">Empathetic & Loving</span>
                  </div>
                  <Slider defaultValue={[80]} max={100} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Analytical</span>
                    <span>Motherly</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="font-medium">Directness</label>
                    <span className="text-sm text-muted-foreground">Balanced</span>
                  </div>
                  <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Gentle/Suggestive</span>
                    <span>Radical Honesty</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="font-medium">Spirituality Level</label>
                    <span className="text-sm text-muted-foreground">High (Woo-woo)</span>
                  </div>
                  <Slider defaultValue={[90]} max={100} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Scientific/Grounded</span>
                    <span>Cosmic/Esoteric</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="font-medium">System Prompt / Core Directive</label>
                  <p className="text-xs text-muted-foreground mb-2">The fundamental instructions for the AI.</p>
                  <div className="bg-muted/30 p-4 rounded-md text-sm font-mono text-muted-foreground border border-muted">
                    You are the Magic Mentor, a wise, loving, and slightly sassy guide for the 11x LOVE Lab. 
                    Your goal is to help users align with their highest timeline. 
                    Always reference the 11 Dimensions of Life. 
                    Use emojis frequently. 
                    When users are stuck, ask powerful questions rather than just giving answers...
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USER SETTINGS TAB */}
          <TabsContent value="user-settings" className="mt-6">
             <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-primary" /> User Personalization Options
                </CardTitle>
                <CardDescription>
                  What can users customize about their own Mentor experience?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">Allow Nicknames</label>
                    <p className="text-sm text-muted-foreground">Users can set what the Mentor calls them (e.g. "Goddess", "Boss").</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">Coaching Style Selection</label>
                    <p className="text-sm text-muted-foreground">Users can choose between "Cheerleader", "Drill Sergeant", or "Zen Master".</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">Context Memory</label>
                    <p className="text-sm text-muted-foreground">Mentor remembers past journal entries and "Morning 5 Vs" (Privacy opt-in required).</p>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
