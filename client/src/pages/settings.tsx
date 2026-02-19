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
import { getByokKeyStatus, saveByokKey, removeByokKey, getMembershipInfo } from "@/lib/api";
import { getTierInfo, ALL_TIERS, type MembershipTier } from "@/lib/membership";
import { Bell, Shield, Palette, Key, Lock, Check, X, Crown } from "lucide-react";

export default function SettingsPage() {
  const { isConnected } = useNostr();
  const { tier, tierInfo, isBYOK, isPaidMember } = useMembership();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

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
