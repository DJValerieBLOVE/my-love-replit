import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Share2, AlertTriangle, Globe, Users } from "lucide-react";
import { useNostr } from "@/contexts/nostr-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export type ShareContentType = "dream" | "journal" | "experiment" | "milestone";
export type ShareDestination = "nostr" | "club";

interface ShareConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ShareContentType;
  contentTitle: string;
  contentPreview: string;
  onSuccess?: () => void;
}

const CONTENT_TYPE_LABELS: Record<ShareContentType, string> = {
  dream: "Big Dream",
  journal: "Journal Entry",
  experiment: "Experiment Completion",
  milestone: "Milestone Achievement",
};

const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
];

export function ShareConfirmationDialog({
  open,
  onOpenChange,
  contentType,
  contentTitle,
  contentPreview,
  onSuccess,
}: ShareConfirmationDialogProps) {
  const [caption, setCaption] = useState("");
  const [shareDestination, setShareDestination] = useState<ShareDestination>("nostr");
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const { signEvent, profile } = useNostr();
  const { toast } = useToast();

  const { data: clubs = [] } = useQuery({
    queryKey: ["/api/clubs"],
    queryFn: async () => {
      const res = await fetch("/api/clubs");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const handleShareToClub = async () => {
    if (!selectedClub) {
      toast({
        title: "Select a group",
        description: "Please select which group to share with.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      toast({
        title: "Shared to group!",
        description: `Your ${CONTENT_TYPE_LABELS[contentType].toLowerCase()} has been shared with your group.`,
      });
      setCaption("");
      setSelectedClub("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Share error:", error);
      toast({
        title: "Failed to share",
        description: error.message || "Could not share to group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareToNostr = async () => {
    if (!profile?.pubkey || !signEvent) {
      toast({
        title: "Not connected",
        description: "Please connect with your Nostr extension first.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      const contentLabel = CONTENT_TYPE_LABELS[contentType];
      const fullContent = caption 
        ? `${caption}\n\n---\n${contentLabel}: ${contentTitle}\n\n${contentPreview}`
        : `${contentLabel}: ${contentTitle}\n\n${contentPreview}`;

      const event = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["t", "mymasterpiece"],
          ["t", contentType],
        ],
        content: fullContent,
        pubkey: profile.pubkey,
      };

      const signedEvent = await signEvent(event);
      
      const publishPromises = DEFAULT_RELAYS.map(async (relay) => {
        try {
          const ws = new WebSocket(relay);
          return new Promise<boolean>((resolve) => {
            const timeout = setTimeout(() => {
              ws.close();
              resolve(false);
            }, 5000);

            ws.onopen = () => {
              ws.send(JSON.stringify(["EVENT", signedEvent]));
            };

            ws.onmessage = (msg) => {
              try {
                const data = JSON.parse(msg.data);
                if (data[0] === "OK" && data[1] === signedEvent.id) {
                  clearTimeout(timeout);
                  ws.close();
                  resolve(true);
                }
              } catch {
                clearTimeout(timeout);
                ws.close();
                resolve(false);
              }
            };

            ws.onerror = () => {
              clearTimeout(timeout);
              ws.close();
              resolve(false);
            };
            
            ws.onclose = () => {
              clearTimeout(timeout);
            };
          });
        } catch {
          return false;
        }
      });

      const results = await Promise.all(publishPromises);
      const successCount = results.filter(Boolean).length;

      if (successCount > 0) {
        toast({
          title: "Shared to Nostr!",
          description: `Your ${CONTENT_TYPE_LABELS[contentType].toLowerCase()} has been shared to ${successCount} relay${successCount > 1 ? 's' : ''}.`,
        });
        setCaption("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error("Failed to publish to any relay");
      }
    } catch (error: any) {
      console.error("Share error:", error);
      toast({
        title: "Failed to share",
        description: error.message || "Could not publish to Nostr. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = async () => {
    if (shareDestination === "nostr") {
      await handleShareToNostr();
    } else {
      await handleShareToClub();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-serif">
            <Share2 className="w-5 h-5 text-love-body" />
            Share Your Win
          </DialogTitle>
          <DialogDescription className="pt-2">
            Choose how you want to share this {CONTENT_TYPE_LABELS[contentType].toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-normal">Share with</Label>
            <RadioGroup
              value={shareDestination}
              onValueChange={(value) => setShareDestination(value as ShareDestination)}
              className="grid gap-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="nostr" id="nostr" />
                <Label htmlFor="nostr" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Globe className="w-4 h-4 text-love-body" />
                  <div>
                    <p className="font-normal text-sm">Public to Nostr</p>
                    <p className="text-xs text-muted-foreground">Share with all your followers</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-3 opacity-60 cursor-not-allowed">
                <RadioGroupItem value="club" id="club" disabled />
                <Label htmlFor="club" className="flex items-center gap-2 cursor-not-allowed flex-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-normal text-sm text-muted-foreground">Share with a Group</p>
                    <p className="text-xs text-muted-foreground">Coming soon - Only group members can see</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {shareDestination === "club" && (
            <div className="space-y-2">
              <Label>Select Group</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger data-testid="select-club">
                  <SelectValue placeholder="Choose a group..." />
                </SelectTrigger>
                <SelectContent>
                  {clubs.length === 0 ? (
                    <SelectItem value="none" disabled>No groups available</SelectItem>
                  ) : (
                    clubs.map((club: any) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {shareDestination === "nostr" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                This will share publicly to your Nostr followers. Make sure you're comfortable sharing this content.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-normal">Preview</Label>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-normal text-sm">{contentTitle}</p>
              <p className="text-sm text-muted-foreground line-clamp-3">{contentPreview}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Add a caption (optional)</Label>
            <Textarea
              id="caption"
              placeholder="Share your thoughts about this moment..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[80px] resize-none"
              data-testid="input-share-caption"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSharing}
            data-testid="button-cancel-share"
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSharing || (shareDestination === "club" && !selectedClub)}
            className="bg-gradient-to-r from-love-body to-love-soul text-white"
            data-testid="button-confirm-share"
          >
            {isSharing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                {shareDestination === "nostr" ? "Share to Nostr" : "Share to Group"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
