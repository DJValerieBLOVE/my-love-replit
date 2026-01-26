import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { updateUserEmail } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProfileCompletionDialogProps {
  open: boolean;
  onComplete: () => void;
  userName?: string;
}

export function ProfileCompletionDialog({ open, onComplete, userName }: ProfileCompletionDialogProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserEmail(email);
      
      toast({
        title: "Welcome to My Masterpiece!",
        description: "Your 2-week free trial has started.",
      });
      
      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to save email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-center">
            Welcome{userName ? `, ${userName}` : ""}!
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Enter your email to start your 2-week free trial and unlock all features.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              data-testid="input-email"
            />
            {error && (
              <p className="text-sm text-red-500" data-testid="text-email-error">{error}</p>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            We will only use your email to send you important updates and help you get the most out of your journey.
          </p>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-love-body to-love-soul text-white"
            disabled={isSubmitting}
            data-testid="button-start-trial"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting your trial...
              </>
            ) : (
              "Start My Free Trial"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
