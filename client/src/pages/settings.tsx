import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNostr } from "@/contexts/nostr-context";
import { useMembership } from "@/hooks/use-membership";
import { getByokKeyStatus, saveByokKey, removeByokKey, getMembershipInfo, setup2FA, verify2FA, disable2FA, linkNostrAccount, getCurrentUser } from "@/lib/api";
import { getTierInfo, ALL_TIERS, type MembershipTier } from "@/lib/membership";
import { Bell, Shield, Palette, Key, Lock, Check, X, Crown, User, Mail, Smartphone, Link2, LogOut } from "lucide-react";
import { nip19 } from "nostr-tools";

export default function SettingsPage() {
  const { isConnected, loginMethod, profile, disconnect } = useNostr();
  const { tier, tierInfo, isBYOK, isPaidMember } = useMembership();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [twoFASetupData, setTwoFASetupData] = useState<{ secret: string; qrCode: string; otpauthUrl: string } | null>(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [linkedNpub, setLinkedNpub] = useState<string | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: isConnected,
  });

  const is2FAEnabled = currentUser?.twoFactorEnabled || false;

  const setup2FAMutation = useMutation({
    mutationFn: setup2FA,
    onSuccess: (data) => {
      setTwoFASetupData(data);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to setup 2FA", description: error.message, variant: "destructive" });
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: verify2FA,
    onSuccess: (data) => {
      setRecoveryCodes(data.recoveryCodes || []);
      setTwoFASetupData(null);
      setTwoFACode("");
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({ title: "2FA Enabled", description: "Two-factor authentication has been enabled." });
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: disable2FA,
    onSuccess: () => {
      setShowDisable2FA(false);
      setDisableCode("");
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been disabled." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to disable 2FA", description: error.message, variant: "destructive" });
    },
  });

  const linkNostrMutation = useMutation({
    mutationFn: ({ pubkey, source }: { pubkey: string; source: string }) => linkNostrAccount(pubkey, source),
    onSuccess: (_data, variables) => {
      const npub = nip19.npubEncode(variables.pubkey);
      setLinkedNpub(npub);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({ title: "Nostr account linked", description: "Your Nostr identity has been connected." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to link Nostr", description: error.message, variant: "destructive" });
    },
  });

  const handleConnectNostr = async () => {
    if (!window.nostr) {
      toast({ title: "No Nostr extension found", description: "Please install Alby, nos2x, or another NIP-07 compatible extension.", variant: "destructive" });
      return;
    }
    try {
      const pubkey = await window.nostr.getPublicKey();
      linkNostrMutation.mutate({ pubkey, source: 'extension' });
    } catch (e: any) {
      toast({ title: "Failed to get pubkey", description: e.message || "Could not get public key from extension.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    disconnect();
    window.location.reload();
  };

  const getLoginMethodLabel = () => {
    switch (loginMethod) {
      case "email": return "Email";
      case "extension": return "Nostr Extension";
      case "bunker": return "Bunker";
      case "ncryptsec": return "Encrypted Key";
      default: return "Unknown";
    }
  };

  const truncateNpub = (npub: string) => {
    if (npub.length <= 20) return npub;
    return `${npub.slice(0, 10)}...${npub.slice(-6)}`;
  };

  const { data: keyStatus } = useQuery({
    queryKey: ['byokKeyStatus'],
    queryFn: getByokKeyStatus,
    enabled: isConnected,
  });

  const { data: membershipInfo } = useQuery({
    queryKey: ['membershipInfo'],
    queryFn: getMembershipInfo,
    enabled: isConnected,
  });

  const saveKeyMutation = useMutation({
    mutationFn: saveByokKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['byokKeyStatus'] });
      queryClient.invalidateQueries({ queryKey: ['membershipInfo'] });
      setApiKeyInput("");
      setShowKeyInput(false);
      toast({ title: "API key saved", description: "Your key is stored securely on the server." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save key", description: error.message, variant: "destructive" });
    },
  });

  const removeKeyMutation = useMutation({
    mutationFn: removeByokKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['byokKeyStatus'] });
      queryClient.invalidateQueries({ queryKey: ['membershipInfo'] });
      toast({ title: "API key removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove key", variant: "destructive" });
    },
  });

  const handleSaveKey = () => {
    if (!apiKeyInput.trim()) return;
    saveKeyMutation.mutate(apiKeyInput.trim());
  };

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto pb-20 md:pb-4">
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-2" data-testid="text-settings-title">
              Settings
            </h1>
            <p className="text-muted-foreground" data-testid="text-settings-subtitle">
              Customize your experience
            </p>
          </div>

          {isConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg" data-testid="text-section-account">
                  <User className="w-5 h-5 text-muted-foreground" />
                  Account
                </CardTitle>
                <CardDescription data-testid="text-desc-account">Your login and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3 p-3 rounded-xs" style={{ backgroundColor: '#FAF8F5' }}>
                  {loginMethod === "email" ? (
                    <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm" data-testid="text-login-method">
                      Logged in with <span className="font-normal">{getLoginMethodLabel()}</span>
                    </p>
                    {loginMethod === "email" && currentUser?.email && (
                      <p className="text-xs text-muted-foreground" data-testid="text-user-email">{currentUser.email}</p>
                    )}
                    {loginMethod !== "email" && profile?.npub && (
                      <p className="text-xs text-muted-foreground" data-testid="text-user-npub">{truncateNpub(profile.npub)}</p>
                    )}
                  </div>
                </div>

                {loginMethod === "email" && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-normal" data-testid="text-2fa-title">Two-Factor Authentication</p>
                      </div>

                      {is2FAEnabled && !recoveryCodes ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4" style={{ color: '#00d81c' }} />
                            <p className="text-sm" style={{ color: '#00d81c' }} data-testid="text-2fa-enabled">2FA Enabled</p>
                          </div>
                          {!showDisable2FA ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowDisable2FA(true)}
                              data-testid="button-disable-2fa"
                            >
                              Disable 2FA
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">Enter your 6-digit code to disable 2FA</p>
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  maxLength={6}
                                  placeholder="000000"
                                  value={disableCode}
                                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                                  className="text-sm w-32"
                                  data-testid="input-disable-2fa-code"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => disable2FAMutation.mutate(disableCode)}
                                  disabled={disableCode.length !== 6 || disable2FAMutation.isPending}
                                  variant="destructive"
                                  data-testid="button-confirm-disable-2fa"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { setShowDisable2FA(false); setDisableCode(""); }}
                                  data-testid="button-cancel-disable-2fa"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : recoveryCodes ? (
                        <div className="space-y-3">
                          <div className="p-3 rounded-xs border border-yellow-300" style={{ backgroundColor: '#FFF9E6' }}>
                            <p className="text-sm font-normal mb-2" data-testid="text-recovery-warning">Save these recovery codes</p>
                            <p className="text-xs text-muted-foreground mb-3">Store them in a safe place. You will need them if you lose access to your authenticator app.</p>
                            <div className="grid grid-cols-2 gap-1">
                              {recoveryCodes.map((code, i) => (
                                <code key={i} className="text-xs p-1 rounded bg-white" data-testid={`text-recovery-code-${i}`}>{code}</code>
                              ))}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRecoveryCodes(null)}
                            data-testid="button-dismiss-recovery"
                          >
                            I have saved these codes
                          </Button>
                        </div>
                      ) : twoFASetupData ? (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <img src={twoFASetupData.qrCode} alt="2FA QR Code" className="w-48 h-48" data-testid="img-2fa-qr" />
                          </div>
                          <div className="p-2 rounded-xs text-center" style={{ backgroundColor: '#FAF8F5' }}>
                            <p className="text-xs text-muted-foreground mb-1">Or enter this secret manually:</p>
                            <code className="text-xs select-all" data-testid="text-2fa-secret">{twoFASetupData.secret}</code>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              maxLength={6}
                              placeholder="Enter 6-digit code"
                              value={twoFACode}
                              onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                              className="text-sm"
                              data-testid="input-2fa-verify-code"
                            />
                            <Button
                              size="sm"
                              onClick={() => verify2FAMutation.mutate(twoFACode)}
                              disabled={twoFACode.length !== 6 || verify2FAMutation.isPending}
                              style={{ backgroundColor: '#6600ff', color: 'white' }}
                              data-testid="button-verify-2fa"
                            >
                              Verify
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setTwoFASetupData(null); setTwoFACode(""); }}
                            className="text-xs"
                            data-testid="button-cancel-2fa-setup"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setup2FAMutation.mutate()}
                          disabled={setup2FAMutation.isPending}
                          data-testid="button-enable-2fa"
                        >
                          Enable 2FA
                        </Button>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-normal" data-testid="text-link-nostr-title">Link Nostr Identity</p>
                      </div>

                      {currentUser?.nostrPubkey || linkedNpub ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4" style={{ color: '#00d81c' }} />
                          <p className="text-sm" data-testid="text-linked-npub">
                            {linkedNpub
                              ? truncateNpub(linkedNpub)
                              : currentUser?.nostrPubkey
                                ? truncateNpub(nip19.npubEncode(currentUser.nostrPubkey))
                                : ""}
                          </p>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleConnectNostr}
                          disabled={linkNostrMutation.isPending}
                          data-testid="button-connect-nostr"
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Connect Nostr Extension
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isConnected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg" data-testid="text-section-membership">
                  <Crown className="w-5 h-5 text-muted-foreground" />
                  Membership
                </CardTitle>
                <CardDescription data-testid="text-desc-membership">Your current plan and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xs" style={{ backgroundColor: '#FAF8F5' }}>
                  <div>
                    <p className="text-sm" data-testid="text-current-tier">Current Plan</p>
                    <p className="text-lg" style={{ color: tierInfo.color }} data-testid="text-tier-name">
                      {tierInfo.name}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-tier-price">{tierInfo.price}</p>
                  </div>
                  {isPaidMember && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Token Balance</p>
                      <p className="text-sm" data-testid="text-token-balance">
                        {membershipInfo?.tokenBalance?.toLocaleString() || '0'} tokens
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground" data-testid="text-tier-description">
                  {tierInfo.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {ALL_TIERS.filter(t => t !== tier).slice(0, 4).map((t) => {
                    const info = getTierInfo(t);
                    return (
                      <div
                        key={t}
                        className="p-2 rounded-xs border text-center"
                        data-testid={`tier-option-${t}`}
                      >
                        <p className="text-xs" style={{ color: info.color }}>{info.name}</p>
                        <p className="text-xs text-muted-foreground">{info.price}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground text-center" data-testid="text-upgrade-note">
                  Payment integration coming soon. Contact admin for plan changes.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" data-testid="text-section-notifications">
                <Bell className="w-5 h-5 text-muted-foreground" />
                Notifications
              </CardTitle>
              <CardDescription data-testid="text-desc-notifications">Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-dms" className="flex flex-col gap-1">
                  <span>Direct Messages</span>
                  <span className="text-xs text-muted-foreground font-normal">Get notified when someone DMs you</span>
                </Label>
                <Switch id="notify-dms" defaultChecked data-testid="switch-notify-dms" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-mentions" className="flex flex-col gap-1">
                  <span>Mentions</span>
                  <span className="text-xs text-muted-foreground font-normal">When someone mentions you in a post</span>
                </Label>
                <Switch id="notify-mentions" defaultChecked data-testid="switch-notify-mentions" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-zaps" className="flex flex-col gap-1">
                  <span>Zaps</span>
                  <span className="text-xs text-muted-foreground font-normal">When you receive Bitcoin zaps</span>
                </Label>
                <Switch id="notify-zaps" defaultChecked data-testid="switch-notify-zaps" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify-streak" className="flex flex-col gap-1">
                  <span>Streak Reminders</span>
                  <span className="text-xs text-muted-foreground font-normal">Daily reminder to complete your practice</span>
                </Label>
                <Switch id="notify-streak" defaultChecked data-testid="switch-notify-streak" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" data-testid="text-section-privacy">
                <Shield className="w-5 h-5 text-muted-foreground" />
                Privacy
              </CardTitle>
              <CardDescription data-testid="text-desc-privacy">Control your data and visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="private-default" className="flex flex-col gap-1">
                  <span>Private by Default</span>
                  <span className="text-xs text-muted-foreground font-normal">New entries are private until you share them</span>
                </Label>
                <Switch id="private-default" defaultChecked data-testid="switch-private-default" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-progress" className="flex flex-col gap-1">
                  <span>Show Progress on Love Board</span>
                  <span className="text-xs text-muted-foreground font-normal">Let others see your streak and achievements</span>
                </Label>
                <Switch id="show-progress" defaultChecked data-testid="switch-show-progress" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xs" style={{ backgroundColor: '#FAF8F5' }}>
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground" data-testid="text-privacy-nostr">
                  Personal data (Big Dreams, journals, daily practice) is encrypted with your Nostr key using NIP-44 encryption. Only you can read it.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" data-testid="text-section-ai">
                <Key className="w-5 h-5 text-muted-foreground" />
                Magic Mentor AI
              </CardTitle>
              <CardDescription data-testid="text-desc-ai">Configure your AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-memory" className="flex flex-col gap-1">
                  <span>AI Memory</span>
                  <span className="text-xs text-muted-foreground font-normal">Let Magic Mentor learn from your journal entries and Big Dreams</span>
                </Label>
                <Switch id="ai-memory" defaultChecked data-testid="switch-ai-memory" />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm" data-testid="text-byok-title">Bring Your Own Key (BYOK)</p>
                    <p className="text-xs text-muted-foreground">Use your own Anthropic or OpenRouter API key for unlimited AI usage</p>
                  </div>
                  {keyStatus?.hasKey && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#00d81c' }}>
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                {keyStatus?.hasKey && !showKeyInput ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-xs border">
                      <code className="text-xs text-muted-foreground" data-testid="text-key-preview">
                        {keyStatus.keyPreview}
                      </code>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowKeyInput(true)}
                          data-testid="button-update-key"
                        >
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeKeyMutation.mutate()}
                          disabled={removeKeyMutation.isPending}
                          data-testid="button-remove-key"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {showKeyInput && keyStatus?.hasKey && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowKeyInput(false)}
                        className="text-xs"
                        data-testid="button-cancel-update"
                      >
                        Cancel
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="sk-ant-... or sk-or-..."
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        className="text-sm"
                        data-testid="input-api-key"
                      />
                      <Button
                        onClick={handleSaveKey}
                        disabled={!apiKeyInput.trim() || saveKeyMutation.isPending}
                        style={{ backgroundColor: '#6600ff', color: 'white' }}
                        data-testid="button-save-key"
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground" data-testid="text-byok-help">
                      Your key is stored on the server (encrypted). AI calls use your key directly — billed to your account with the provider.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" data-testid="text-section-appearance">
                <Palette className="w-5 h-5 text-muted-foreground" />
                Appearance
              </CardTitle>
              <CardDescription data-testid="text-desc-appearance">Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="flex flex-col gap-1">
                  <span>Dark Mode</span>
                  <span className="text-xs text-muted-foreground font-normal">Coming soon</span>
                </Label>
                <Switch id="dark-mode" disabled data-testid="switch-dark-mode" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
