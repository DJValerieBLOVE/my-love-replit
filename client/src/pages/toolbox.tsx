import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Plus } from "lucide-react";

export default function Toolbox() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif font-bold">My Toolbox</h1>
            <p className="text-muted-foreground">Your personalized collection of practices that work for YOU.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Add Tool
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder Tools */}
          {['Morning Dance', 'Snap! Breath', 'Vibe Check'].map((tool, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tool}</h3>
                  <p className="text-sm text-muted-foreground">Energy Shifter</p>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2">Use Tool</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
