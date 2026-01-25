import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Shield, Palette, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto pb-20 md:pb-4">
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2" data-testid="text-settings-title">
              Settings
            </h1>
            <p className="text-muted-foreground" data-testid="text-settings-subtitle">
              Customize your experience
            </p>
          </div>

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
                  <span>Show Progress on Leaderboard</span>
                  <span className="text-xs text-muted-foreground font-normal">Let others see your streak and achievements</span>
                </Label>
                <Switch id="show-progress" defaultChecked data-testid="switch-show-progress" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg" data-testid="text-section-ai">
                <Key className="w-5 h-5 text-muted-foreground" />
                AI Settings
              </CardTitle>
              <CardDescription data-testid="text-desc-ai">Configure your Magic Mentor AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-memory" className="flex flex-col gap-1">
                  <span>AI Memory</span>
                  <span className="text-xs text-muted-foreground font-normal">Let AI learn from your journal entries</span>
                </Label>
                <Switch id="ai-memory" defaultChecked data-testid="switch-ai-memory" />
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full" data-testid="button-byok">
                  Add Your Own API Key (BYOK)
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center" data-testid="text-byok-helper">
                  Bring your own OpenRouter key for unlimited AI usage
                </p>
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
