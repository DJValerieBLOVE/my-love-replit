import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Share2, AlertTriangle } from "lucide-react";
import { useNostr } from "@/contexts/nostr-context";
import { useToast } from "@/hooks/use-toast";

export type ShareContentType = "dream" | "journal" | "experiment" | "milestone";

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
  const [isSharing, setIsSharing] = useState(false);
  const { signEvent, profile } = useNostr();
  const { toast } = useToast();

  const handleShare = async () => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-serif">
            <Share2 className="w-5 h-5 text-love-body" />
            Share to Nostr
          </DialogTitle>
          <DialogDescription className="pt-2">
            Share this {CONTENT_TYPE_LABELS[contentType].toLowerCase()} with your Nostr network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              This will share publicly to your Nostr followers. Make sure you're comfortable sharing this content.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">{contentTitle}</p>
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
            disabled={isSharing}
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
                Share to Nostr
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
