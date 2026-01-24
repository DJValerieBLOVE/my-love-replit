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
import { Zap, Key, Shield, ExternalLink, Loader2, CheckCircle } from "lucide-react";

interface NostrLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NostrLoginDialog({ open, onOpenChange }: NostrLoginDialogProps) {
  const { connectWithExtension, error, isLoading } = useNostr();
  const [hasExtension, setHasExtension] = useState<boolean | null>(null);
  const [connectSuccess, setConnectSuccess] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <span className="bg-background px-2 text-muted-foreground">Coming Soon</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 opacity-50">
              <Button variant="outline" disabled className="w-full h-12" data-testid="button-login-bunker">
                <Shield className="w-4 h-4 mr-2" />
                Connect with Bunker (NIP-46)
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                For maximum security with nsec.app or nsecBunker
              </p>
            </div>

            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-love-family" />
                New to Nostr?
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
