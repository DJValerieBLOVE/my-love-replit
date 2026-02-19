import { useState } from "react";
import { useNostr } from "@/contexts/nostr-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Key, Shield, ExternalLink, Loader2, CheckCircle, UserPlus, ArrowLeft, Mail, Eye, EyeOff, Lock } from "lucide-react";

interface NostrLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NostrLoginDialog({ open, onOpenChange }: NostrLoginDialogProps) {
  const { connectWithExtension, connectWithBunker, connectWithEmail, registerWithEmail, error, isLoading } = useNostr();
  const [hasExtension, setHasExtension] = useState<boolean | null>(null);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [showBunkerInput, setShowBunkerInput] = useState(false);
  const [bunkerUrl, setBunkerUrl] = useState("");
  const [activeTab, setActiveTab] = useState("email");
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const checkForExtension = () => {
    setHasExtension(!!window.nostr);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setTwoFactorCode("");
    setNeeds2FA(false);
    setLocalError(null);
    setShowPassword(false);
  };

  const handleSuccess = () => {
    setConnectSuccess(true);
    setTimeout(() => {
      onOpenChange(false);
      setConnectSuccess(false);
      resetForm();
      setShowBunkerInput(false);
      setBunkerUrl("");
    }, 1500);
  };

  const handleExtensionLogin = async () => {
    const success = await connectWithExtension();
    if (success) handleSuccess();
  };

  const handleBunkerLogin = async () => {
    if (!bunkerUrl.trim()) return;
    const success = await connectWithBunker(bunkerUrl.trim());
    if (success) handleSuccess();
  };

  const handleEmailLogin = async () => {
    setLocalError(null);
    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    try {
      const result = await connectWithEmail(email, password, needs2FA ? twoFactorCode : undefined);
      if (result.requires2FA) {
        setNeeds2FA(true);
        return;
      }
      if (result.success) {
        handleSuccess();
      }
    } catch (e: any) {
      setLocalError(e.message);
    }
  };

  const handleEmailRegister = async () => {
    setLocalError(null);
    if (!email || !password || !name) {
      setLocalError("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }

    const success = await registerWithEmail(email, password, name);
    if (success) handleSuccess();
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowBunkerInput(false);
      setBunkerUrl("");
      resetForm();
    }
    onOpenChange(open);
  };

  const displayError = localError || error;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={checkForExtension}>
        {connectSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-green-600">You're in!</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl font-serif">
                Welcome to My Masterpiece
              </DialogTitle>
              <DialogDescription>
                Begin your personal growth journey
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); resetForm(); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" data-testid="tab-email-login" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="nostr" data-testid="tab-nostr-login" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Nostr
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="mt-4">
                {needs2FA ? (
                  <div className="flex flex-col gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => setNeeds2FA(false)}
                      className="w-fit -ml-2"
                      data-testid="button-back-from-2fa"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>

                    <div className="text-center py-2">
                      <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="2fa-code">Verification Code</Label>
                      <Input
                        id="2fa-code"
                        placeholder="000000"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="h-12 text-center text-xl tracking-widest"
                        maxLength={6}
                        data-testid="input-2fa-code"
                      />
                    </div>

                    {displayError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        {displayError}
                      </div>
                    )}

                    <Button
                      onClick={handleEmailLogin}
                      disabled={isLoading || twoFactorCode.length !== 6}
                      className="w-full h-12 bg-gradient-to-r from-[#6600ff] to-[#9900ff] hover:from-[#5500dd] hover:to-[#8800dd] text-white"
                      data-testid="button-verify-2fa"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      Verify
                    </Button>
                  </div>
                ) : emailMode === "login" ? (
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                        data-testid="input-login-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 pr-10"
                          onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                          data-testid="input-login-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {displayError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        {displayError}
                      </div>
                    )}

                    <Button
                      onClick={handleEmailLogin}
                      disabled={isLoading || !email || !password}
                      className="w-full h-12 bg-gradient-to-r from-[#6600ff] to-[#9900ff] hover:from-[#5500dd] hover:to-[#8800dd] text-white"
                      data-testid="button-email-login"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Mail className="w-5 h-5 mr-2" />}
                      Login
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                      Don't have an account?{" "}
                      <button
                        onClick={() => { setEmailMode("register"); setLocalError(null); }}
                        className="text-[#6600ff] hover:underline font-medium"
                        data-testid="link-switch-to-register"
                      >
                        Create one
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Your Name</Label>
                      <Input
                        id="register-name"
                        placeholder="What should we call you?"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12"
                        data-testid="input-register-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                        data-testid="input-register-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 pr-10"
                          onKeyDown={(e) => e.key === "Enter" && handleEmailRegister()}
                          data-testid="input-register-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {displayError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        {displayError}
                      </div>
                    )}

                    <Button
                      onClick={handleEmailRegister}
                      disabled={isLoading || !email || !password || !name}
                      className="w-full h-12 bg-gradient-to-r from-[#6600ff] to-[#9900ff] hover:from-[#5500dd] hover:to-[#8800dd] text-white"
                      data-testid="button-email-register"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                      Create Account
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        onClick={() => { setEmailMode("login"); setLocalError(null); }}
                        className="text-[#6600ff] hover:underline font-medium"
                        data-testid="link-switch-to-login"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="nostr" className="mt-4">
                {showBunkerInput ? (
                  <div className="flex flex-col gap-4">
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
                        <Label className="mb-2 block">Bunker Connection URL</Label>
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
                        <a href="https://nsec.app" target="_blank" rel="noopener noreferrer" className="text-[#6600ff] hover:underline">
                          nsec.app
                        </a>
                        {" "}or your bunker app.
                      </p>
                    </div>

                    {displayError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        {displayError}
                      </div>
                    )}

                    <Button
                      onClick={handleBunkerLogin}
                      disabled={isLoading || !bunkerUrl.trim()}
                      className="w-full h-12 bg-gradient-to-r from-[#6600ff] to-[#9900ff] hover:from-[#5500dd] hover:to-[#8800dd] text-white"
                      data-testid="button-connect-bunker"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
                      Connect
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={handleExtensionLogin}
                      disabled={isLoading}
                      className="w-full h-14 bg-gradient-to-r from-[#6600ff] to-[#9900ff] hover:from-[#5500dd] hover:to-[#8800dd] text-white font-medium text-base"
                      data-testid="button-login-extension"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Key className="w-5 h-5 mr-2" />}
                      Connect with Extension
                    </Button>

                    {hasExtension === false && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                        <p className="font-medium text-amber-800 mb-2">No extension detected</p>
                        <p className="text-amber-700 mb-3">
                          Install a Nostr extension to login securely.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 underline">
                            Get Alby <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-amber-400">|</span>
                          <a href="https://github.com/nickydev/nos2x" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 underline">
                            Get nos2x <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {displayError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        {displayError}
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

                    <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        What is Nostr?
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Nostr is a decentralized protocol where YOU own your identity. No company controls your account.
                        Your keys are like your password - but you can use them anywhere on the Nostr network.
                      </p>
                      <a href="https://nostr.how" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#6600ff] hover:underline mt-2">
                        Learn more about Nostr <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
