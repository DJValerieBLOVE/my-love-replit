import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Sparkles, Beaker, Lightbulb, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Define the types for our journal entries
export type JournalEntry = {
  id: number | string;
  type: "daily-practice" | "experiment" | "discovery";
  date: string;
  time?: string;
  tags: string[];
  content: string;
  // Daily Practice Fields
  vibe?: number;
  morningVibe?: number;
  eveningVibe?: number;
  gratitude?: string;
  vision?: string;
  focusArea?: {
    name: string;
    dream: string;
    color: string;
    progress: number;
  };
  villain?: string;
  value?: string;
  victory?: string;
  // Experiment Fields
  experimentTitle?: string;
  hypothesis?: string;
  observation?: string;
  conclusion?: string;
  rating?: number;
  // Discovery Fields
  ahaMoment?: string;
  context?: string;
  actionItem?: string;
};

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EntryDetailModal({ entry, isOpen, onClose }: EntryDetailModalProps) {
  if (!entry) return null;

  const renderHeaderIcon = () => {
    switch (entry.type) {
      case "daily-practice":
        return <Heart className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />;
      case "experiment":
        return <Beaker className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />;
      case "discovery":
        return <Lightbulb className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />;
      default:
        return <Heart className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />;
    }
  };

  const renderHeaderTitle = () => {
    switch (entry.type) {
      case "daily-practice":
        return "Daily LOVE Practice";
      case "experiment":
        return entry.experimentTitle || "Experiment Log";
      case "discovery":
        return "Discovery Note";
      default:
        return "Journal Entry";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden bg-background border-none shadow-2xl flex flex-col">
        {/* Notion-style Cover Image Placeholder (Optional) */}
        <div className="h-32 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 w-full shrink-0" />
        
        <ScrollArea className="flex-1">
          <div className="p-8 lg:p-12 max-w-3xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-muted-foreground mb-4">
                {renderHeaderIcon()}
                <span className="text-sm font-medium uppercase tracking-wider">{renderHeaderTitle()}</span>
              </div>
              
              <h1 className="text-4xl font-serif font-bold text-foreground leading-tight">
                {entry.type === 'daily-practice' 
                  ? `Journal Entry: ${entry.date}` 
                  : (entry.experimentTitle || entry.ahaMoment || "Untitled Entry")}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{entry.date}</span>
                </div>
                <div className="flex gap-2 ml-2">
                  {entry.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="font-normal bg-muted/50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Content Section based on Type */}
            <div className="space-y-8 font-serif text-lg leading-relaxed text-foreground/90">
              
              {/* Daily Practice View */}
              {entry.type === "daily-practice" && (
                <>
                  {/* 5 V's Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border border-border/40">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-muted-foreground uppercase">Vision</div>
                      <div className="font-medium">{entry.vision}</div>
                    </div>
                    {entry.gratitude && (
                      <div className="space-y-1 col-span-full">
                        <div className="text-xs font-bold text-muted-foreground uppercase">Gratitude</div>
                        <div className="font-medium italic text-muted-foreground">"{entry.gratitude}"</div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-muted-foreground uppercase">Value</div>
                      <div className="font-medium">{entry.value}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-muted-foreground uppercase">Victory</div>
                      <div className="font-medium text-green-600">{entry.victory}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-muted-foreground uppercase">Villain</div>
                      <div className="font-medium text-red-500">{entry.villain}</div>
                    </div>
                    <div className="col-span-full pt-2 border-t border-border/20 mt-2 flex items-center justify-between">
                       <div className="text-xs font-bold text-muted-foreground uppercase">Morning Vibe</div>
                       <div className="font-bold text-primary text-xl">{entry.morningVibe || entry.vibe || "-"}/10</div>
                    </div>
                    <div className="col-span-full flex items-center justify-between">
                       <div className="text-xs font-bold text-muted-foreground uppercase">Evening Vibe</div>
                       <div className="font-bold text-primary text-xl">{entry.eveningVibe || "-"}/10</div>
                    </div>
                    
                    {entry.focusArea && (
                      <div className="col-span-full mt-2 pt-4 border-t border-border/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-bold text-muted-foreground uppercase">Focus Area</div>
                          <Badge variant="outline" className="font-normal text-[10px] uppercase tracking-wider" style={{borderColor: entry.focusArea.color, color: entry.focusArea.color}}>
                            {entry.focusArea.name}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium italic text-muted-foreground">"{entry.focusArea.dream}"</div>
                          <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${entry.focusArea.progress}%`, backgroundColor: entry.focusArea.color }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <h3>Reflection</h3>
                    <p>{entry.content}</p>
                  </div>
                </>
              )}

              {/* Experiment View */}
              {entry.type === "experiment" && (
                <>
                   <div className="bg-secondary/5 p-6 rounded-xl border border-secondary/20">
                      <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Hypothesis</h3>
                      <p className="italic text-xl">"{entry.hypothesis}"</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <h4 className="font-bold text-muted-foreground uppercase text-sm">Observation</h4>
                        <p>{entry.observation}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-muted-foreground uppercase text-sm">Conclusion</h4>
                        <p>{entry.conclusion}</p>
                      </div>
                   </div>
                   
                   <div className="prose prose-lg dark:prose-invert max-w-none pt-4">
                    <h3>Additional Notes</h3>
                    <p>{entry.content}</p>
                  </div>
                </>
              )}

              {/* Discovery View */}
              {entry.type === "discovery" && (
                <>
                  <div className="flex items-start gap-4 bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <Lightbulb className="w-8 h-8 text-muted-foreground shrink-0 mt-1" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-400">The "Aha!" Moment</h3>
                      <p className="text-xl font-medium italic leading-relaxed">"{entry.ahaMoment}"</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-muted-foreground uppercase text-sm mb-2">Context</h4>
                      <p>{entry.context}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-muted-foreground uppercase text-sm mb-2">Action Item</h4>
                      <div className="flex items-center gap-3 p-4 bg-card border rounded-lg">
                         <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                         <span className="font-medium">{entry.actionItem}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="prose prose-lg dark:prose-invert max-w-none pt-4">
                    <h3>Reflection</h3>
                    <p>{entry.content}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
