import { useState, useEffect } from "react";
import { 
  Palette, 
  Check, 
  RotateCcw, 
  LayoutTemplate,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const THEMES = [
  {
    id: "cosmic-latte",
    name: "Cosmic Latte",
    colors: {
      "--primary": "270 50% 45%",
      "--background": "36 33% 97%",
      "--sidebar": "36 33% 97%",
      "--radius": "0.75rem"
    }
  },
  {
    id: "11x-love",
    name: "11x LOVE",
    colors: {
      "--primary": "280 85% 60%", // Vibrant Purple
      "--background": "0 0% 100%", // Pure White
      "--sidebar": "280 50% 98%", // Light Lavender
      "--radius": "1rem" // Rounder
    }
  },
  {
    id: "ocean-calm",
    name: "Ocean Calm",
    colors: {
      "--primary": "200 80% 40%", // Deep Blue
      "--background": "210 30% 98%", // Cool White
      "--sidebar": "200 20% 96%",
      "--radius": "0.5rem" // Sharper
    }
  },
  {
    id: "dark-future",
    name: "Dark Future",
    colors: {
      "--primary": "140 70% 50%", // Neon Green
      "--background": "240 10% 4%", // Almost Black
      "--sidebar": "240 10% 8%",
      "--radius": "0px" // Square
    }
  }
];

export function ThemeCustomizer() {
  const [activeTheme, setActiveTheme] = useState("cosmic-latte");
  const [customPrimary, setCustomPrimary] = useState("#7C3AED");

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;

    setActiveTheme(themeId);
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Special handling for Dark Future
    if (themeId === "dark-future") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-20 right-4 lg:bottom-4 lg:right-4 h-12 w-12 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 z-50 border-2 border-white/20">
          <Palette className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-serif">Customize Your Community</SheetTitle>
          <SheetDescription>
            Make the platform match your brand identity. Changes apply instantly.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="themes">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="themes" className="flex-1">Themes</TabsTrigger>
            <TabsTrigger value="colors" className="flex-1">Colors</TabsTrigger>
            <TabsTrigger value="branding" className="flex-1">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {THEMES.map((theme) => (
                <div 
                  key={theme.id}
                  className={`
                    cursor-pointer rounded-md
                    ${activeTheme === theme.id ? "border-primary ring-2 ring-primary/20" : "border-muted"}
                  `}
                  onClick={() => applyTheme(theme.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{theme.name}</span>
                    {activeTheme === theme.id && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border shadow-sm"
                      style={{ background: `hsl(${theme.colors["--background"]})` }} 
                    />
                    <div 
                      className="w-8 h-8 rounded-full border shadow-sm"
                      style={{ background: `hsl(${theme.colors["--primary"]})` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Primary Brand Color</Label>
                <div className="flex gap-3 mt-2">
                  <div className="h-10 flex-1 rounded-lg border bg-muted px-3 flex items-center">
                    {customPrimary}
                  </div>
                  <input 
                    type="color" 
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="h-10 w-10 rounded-lg cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Used for buttons, links, and active states.
                </p>
              </div>

              <Separator />

              <div>
                <Label>Sidebar Color</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button variant="outline" className="bg-white">Light</Button>
                  <Button variant="outline" className="bg-gray-900 text-white hover:bg-gray-800 hover:text-white">Dark</Button>
                  <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-white">Brand</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-md border border-muted text-center">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                <LayoutTemplate className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium">Community Logo</h3>
              <p className="text-xs text-muted-foreground mb-3">Recommended size: 512x512px</p>
              <Button size="sm" variant="outline">Upload Logo</Button>
            </div>

            <div className="space-y-4">
              <Label>Typography</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg cursor-pointer hover:border-primary">
                  <h4 className="font-serif font-bold text-lg mb-1">Elegant</h4>
                  <p className="text-xs text-muted-foreground">Lora + Jakarta</p>
                </div>
                <div className="p-3 border rounded-lg cursor-pointer hover:border-primary">
                  <h4 className="font-sans font-bold text-lg mb-1">Modern</h4>
                  <p className="text-xs text-muted-foreground">Inter + Inter</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
