import Layout from "@/components/layout";
import { ONBOARDING_STEPS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, Plus, Trash2, Save, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function AdminOnboarding() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold">Onboarding Settings</h1>
            <p className="text-muted-foreground">Customize the welcome experience for your members.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Eye className="w-4 h-4 mr-2" /> Preview</Button>
            <Button><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Checklist</CardTitle>
                <CardDescription>
                  Create a step-by-step guide for new members to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Checklist Title</Label>
                    <Input defaultValue="Get started in the Lumina community" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Steps</Label>
                      <Button variant="ghost" size="sm" className="text-primary h-8"><Plus className="w-3 h-3 mr-1" /> Add Step</Button>
                    </div>
                    
                    <div className="space-y-2">
                      {ONBOARDING_STEPS[0].steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg group border border-transparent hover:border-border transition-all">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab opacity-50 group-hover:opacity-100" />
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-mono text-muted-foreground">
                            {index + 1}
                          </div>
                          <Input defaultValue={step.label} className="h-9 bg-transparent border-none shadow-none focus-visible:ring-0 px-0" />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Celebration Settings</CardTitle>
                <CardDescription>Configure what happens when a user completes the checklist.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Confetti Explosion</Label>
                    <p className="text-sm text-muted-foreground">Trigger a confetti animation on completion</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Award Badge</Label>
                    <p className="text-sm text-muted-foreground">Automatically grant a badge</p>
                  </div>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">Select Badge +</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Show on Home</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show in Sidebar</Label>
                  <Switch />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">New Members</Badge>
                    <Badge variant="outline" className="border-dashed text-muted-foreground hover:border-primary cursor-pointer">+ Add</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">84%</div>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">2.4 days</div>
                  <p className="text-xs text-muted-foreground">Avg. Time to Complete</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
