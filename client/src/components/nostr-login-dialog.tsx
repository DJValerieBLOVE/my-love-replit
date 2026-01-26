import { useState } from "react";
import { useNostr } from "@/contexts/nostr-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Key, Shield, ExternalLink, Loader2, CheckCircle, UserPlus, ArrowLeft } from "lucide-react";

interface NostrLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NostrLoginDialog({ open, onOpenChange }: NostrLoginDialogProps) {
  const { connectWithExtension, connectWithBunker, error, isLoading } = useNostr();
  const [hasExtension, setHasExtension] = useState<boolean | null>(null);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [showBunkerInput, setShowBunkerInput] = useState(false);
  const [bunkerUrl, setBunkerUrl] = useState("");

  const checkForExtension = () => {
    setHasExtension(!!window.nostr);
  };

  const handleExtensionLogin = async () => {
    const success = await connectWithExtension();
    if (success) {
      setConnectSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setConnectSuccess(false);
      }, 1500);
    }
  };

  const handleBunkerLogin = async () => {
    if (!bunkerUrl.trim()) return;
    const success = await connectWithBunker(bunkerUrl.trim());
    if (success) {
      setConnectSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setConnectSuccess(false);
        setShowBunkerInput(false);
        setBunkerUrl("");
      }, 1500);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowBunkerInput(false);
      setBunkerUrl("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={checkForExtension}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-serif">
            <Zap className="w-6 h-6 text-love-family" />
            Login with Nostr
          </DialogTitle>
          <DialogDescription>
            Your keys, your identity. No passwords to remember.
          </DialogDescription>
        </DialogHeader>

        {connectSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-green-600">Connected!</p>
          </div>
        ) : showBunkerInput ? (
          <div className="flex flex-col gap-4 py-4">
            <Button
              variant="ghost"
              onClick={() => setShowBunkerInput(false)}
              className="w-fit -ml-2"
              data-testid="button-back-to-login"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Bunker Connection URL</label>
                <Input
                  placeholder="bunker://..."
                  value={bunkerUrl}
                  onChange={(e) => setBunkerUrl(e.target.value)}
                  className="h-12"
                  data-testid="input-bunker-url"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Get your connection URL from{" "}
                <a
                  href="https://nsec.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-love-body hover:underline"
                >
                  nsec.app
                </a>
                {" "}or your bunker app.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              onClick={handleBunkerLogin}
              disabled={isLoading || !bunkerUrl.trim()}
              className="w-full h-12 bg-gradient-to-r from-[#6600ff] to-[#cc00ff] hover:from-[#5500dd] hover:to-[#bb00dd] text-white"
              data-testid="button-connect-bunker"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Shield className="w-5 h-5 mr-2" />
              )}
              Connect
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            <Button
              onClick={handleExtensionLogin}
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#6600ff] to-[#cc00ff] hover:from-[#5500dd] hover:to-[#bb00dd] text-white font-medium text-base"
              data-testid="button-login-extension"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Key className="w-5 h-5 mr-2" />
              )}
              Connect with Extension
            </Button>

            {hasExtension === false && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-amber-800 mb-2">No extension detected</p>
                <p className="text-amber-700 mb-3">
                  Install a Nostr extension to login securely. Your private key never leaves your browser.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://getalby.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 underline"
                  >
                    Get Alby <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-amber-400">|</span>
                  <a
                    href="https://github.com/nickydev/nos2x"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 underline"
                  >
                    Get nos2x <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowBunkerInput(true)}
              className="w-full h-12"
              data-testid="button-login-bunker"
            >
              <Shield className="w-4 h-4 mr-2" />
              Connect with Bunker (NIP-46)
            </Button>
            <p className="text-xs text-muted-foreground text-center -mt-2">
              For maximum security with nsec.app or nsecBunker
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">New to Nostr?</span>
              </div>
            </div>

            <a
              href="https://nsec.app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full h-12 border-dashed"
                data-testid="button-create-account"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create New Account
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </a>
            <p className="text-xs text-muted-foreground text-center -mt-2">
              Set up your Nostr identity with nsec.app - no extension required
            </p>

            <div className="mt-2 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-love-family" />
                What is Nostr?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nostr is a decentralized protocol where YOU own your identity. No company controls your account. 
                Your keys are like your password - but you can use them anywhere on the Nostr network.
              </p>
              <a
                href="https://nostr.how"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-love-body hover:underline mt-2"
              >
                Learn more about Nostr <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
