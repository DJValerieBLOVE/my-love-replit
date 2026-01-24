import Layout from "@/components/layout";
import { EXPERIMENTS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Lock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Learning() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-muted-foreground">Learning</h1>
          <p className="text-muted-foreground italic">Courses, experiments, and guided journeys to grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPERIMENTS.map((experiment) => (
            <Link key={experiment.id} href={`/learning/${experiment.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-none shadow-sm bg-card cursor-pointer flex flex-col">
                <div className="h-[2px] w-full bg-primary" />
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                  <img 
                    src={experiment.image} 
                    alt={experiment.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-3 right-3 z-20 bg-white/90 text-black hover:bg-white font-normal" data-testid={`badge-${experiment.id}`}>
                    {experiment.category}
                  </Badge>
                  {experiment.progress > 0 && (
                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <div className="flex justify-between text-xs text-white font-medium mb-1 shadow-sm">
                        <span>{experiment.progress}% Complete</span>
                        <span>{experiment.completedDiscoveries}/{experiment.totalDiscoveries}</span>
                      </div>
                      <Progress value={experiment.progress} className="h-1.5 bg-white/30 [&>div]:bg-white" />
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg leading-tight mb-1 text-muted-foreground group-hover:text-primary transition-colors" data-testid={`text-experiment-${experiment.id}`}>
                    {experiment.title}
                  </h3>
                  <p className="text-base text-muted-foreground mb-4" data-testid={`text-guide-${experiment.id}`}>
                    with {experiment.guide}
                  </p>
                  
                  <Button className="w-full gap-2" data-testid={`button-experiment-${experiment.id}`}>
                    {experiment.progress === 0 ? (
                      <><BookOpen className="w-4 h-4" /> Start Learning</>
                    ) : experiment.progress === 100 ? (
                      <><CheckCircle className="w-4 h-4" /> Completed</>
                    ) : (
                      <><PlayCircle className="w-4 h-4" /> Resume</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {/* Locked Experiment Teaser */}
          <Card className="overflow-hidden border-dashed border-2 bg-muted/20 opacity-70 hover:opacity-100 transition-opacity">
            <div className="h-48 bg-muted flex items-center justify-center">
              <Lock className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardContent className="p-5">
              <h3 className="font-bold text-lg leading-tight mb-1">Advanced Lab</h3>
              <p className="text-base text-muted-foreground mb-4">Coming Soon</p>
              <Button disabled className="w-full">Locked</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
