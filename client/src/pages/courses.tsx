import Layout from "@/components/layout";
import { MISSIONS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Courses() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-serif font-bold">My Learning Journey</h1>
          <p className="text-muted-foreground">Continue where you left off.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MISSIONS.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-none shadow-sm bg-card">
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-3 right-3 z-20 bg-white/90 text-black hover:bg-white">
                  {course.category}
                </Badge>
                {course.progress > 0 && (
                  <div className="absolute bottom-3 left-3 right-3 z-20">
                    <div className="flex justify-between text-xs text-white font-medium mb-1 shadow-sm">
                      <span>{course.progress}% Complete</span>
                      <span>{course.completedLessons}/{course.totalLessons}</span>
                    </div>
                    <Progress value={course.progress} className="h-1.5 bg-white/30 [&>div]:bg-white" />
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  with {course.instructor}
                </p>
                
                <Button className="w-full gap-2 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-all">
                  {course.progress === 0 ? (
                    <>Start Course</>
                  ) : course.progress === 100 ? (
                    <><CheckCircle className="w-4 h-4" /> Completed</>
                  ) : (
                    <><PlayCircle className="w-4 h-4" /> Resume</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {/* Locked Course Teaser */}
          <Card className="overflow-hidden border-dashed border-2 bg-muted/20 opacity-70 hover:opacity-100 transition-opacity">
            <div className="h-48 bg-muted flex items-center justify-center">
              <Lock className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardContent className="p-5">
              <h3 className="font-bold text-lg leading-tight mb-1">Advanced Cohort</h3>
              <p className="text-sm text-muted-foreground mb-4">Coming Soon</p>
              <Button disabled className="w-full">Locked</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
