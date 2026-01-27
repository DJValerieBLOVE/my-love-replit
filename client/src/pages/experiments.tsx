import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Lock, BookOpen, Search, Clock, Users, Star, Share2, Plus, FlaskConical, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShareConfirmationDialog } from "@/components/share-confirmation-dialog";
import { useNostr } from "@/contexts/nostr-context";
import { useQuery } from "@tanstack/react-query";
import { getAllExperiments } from "@/lib/api";
import type { Experiment } from "@shared/schema";

const COURSES = [
  {
    id: "bitcoin-basics",
    title: "Bitcoin Basics",
    description: "Learn the fundamentals of Bitcoin and the Lightning Network",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
    level: "beginner",
    duration: "6 weeks",
    enrolled: 1234,
    rating: 4.8,
    instructor: "Satoshi Nakamoto",
    category: "Bitcoin",
    color: "from-orange-500 to-yellow-500",
    isValueForValue: true,
  },
  {
    id: "nostr-dev",
    title: "Build on Nostr",
    description: "Create decentralized applications using the Nostr protocol",
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=400&fit=crop",
    level: "intermediate",
    duration: "8 weeks",
    enrolled: 856,
    rating: 4.9,
    instructor: "Nostr Dev",
    category: "Development",
    color: "from-purple-500 to-pink-500",
    isValueForValue: true,
  },
  {
    id: "lightning-mastery",
    title: "Lightning Network Mastery",
    description: "Deep dive into Lightning Network architecture and development",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop",
    level: "advanced",
    duration: "10 weeks",
    enrolled: 432,
    rating: 4.7,
    instructor: "Lightning Labs",
    category: "Lightning",
    color: "from-blue-500 to-cyan-500",
    isValueForValue: true,
  },
];

export default function Grow() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [shareDialog, setShareDialog] = useState<{
    open: boolean;
    experiment: Experiment | null;
  }>({ open: false, experiment: null });
  const { isConnected } = useNostr();

  const { data: experiments = [], isLoading: experimentsLoading } = useQuery({
    queryKey: ["experiments"],
    queryFn: getAllExperiments,
  });

  const handleShareExperiment = (experiment: Experiment, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareDialog({ open: true, experiment });
  };

  const filteredCourses = COURSES.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    const matchesCategory = categoryFilter === "all" || course.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const filteredExperiments = (experiments as Experiment[]).filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-muted-foreground">Grow</h1>
          <p className="text-muted-foreground">Courses, experiments, and skill-building adventures</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-level">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bitcoin">Bitcoin</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="lightning">Lightning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
            <TabsTrigger value="experiments" data-testid="tab-experiments">Experiments</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Link key={course.id} href={`/experiments/course/${course.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-none shadow-sm bg-card cursor-pointer flex flex-col h-full">
                    {/* Course Header with Gradient */}
                    <div className={`relative h-32 bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                      <h3 className="text-2xl font-bold text-white text-center px-4">{course.title}</h3>
                    </div>
                    
                    <CardContent className="p-5 flex-1 flex flex-col">
                      {/* Level & Value Tags */}
                      <div className="flex gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs capitalize" data-testid={`badge-level-${course.id}`}>
                          {course.level}
                        </Badge>
                        {course.isValueForValue && (
                          <Badge className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-100">
                            Value for Value
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 flex-1">{course.description}</p>
                      
                      {/* Course Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{course.enrolled.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Rating & Instructor */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{course.rating}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">by {course.instructor}</span>
                      </div>

                      <Button className="w-full gap-2" data-testid={`button-course-${course.id}`}>
                        <BookOpen className="w-4 h-4" /> View Course
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredExperiments.length} experiment{filteredExperiments.length !== 1 ? "s" : ""}
              </p>
              {isConnected && (
                <Button onClick={() => setLocation("/experiments/create")} className="gap-2" data-testid="button-create-experiment">
                  <Plus className="w-4 h-4" />
                  Create Experiment
                </Button>
              )}
            </div>

            {experimentsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredExperiments.length === 0 ? (
              <Card className="p-8 text-center">
                <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-bold text-lg mb-2">No Experiments Yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to create an experiment!</p>
                {isConnected && (
                  <Button onClick={() => setLocation("/experiments/create")} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Experiment
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiments.map((experiment) => (
                  <Link key={experiment.id} href={`/experiments/${experiment.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-none shadow-sm bg-card cursor-pointer flex flex-col h-full rounded-xs">
                      <div className="h-[2px] w-full bg-primary" />
                      <div className="relative h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                        {experiment.image ? (
                          <img 
                            src={experiment.image} 
                            alt={experiment.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <FlaskConical className="w-16 h-16 text-white/50" />
                          </div>
                        )}
                        <Badge className="absolute top-3 right-3 z-20 bg-white/90 text-black hover:bg-white font-normal" data-testid={`badge-${experiment.id}`}>
                          {experiment.category}
                        </Badge>
                        <div className="absolute bottom-3 left-3 z-20">
                          <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                            {experiment.steps?.length || 0} step{(experiment.steps?.length || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg leading-tight mb-1 text-muted-foreground group-hover:text-primary transition-colors" data-testid={`text-experiment-${experiment.id}`}>
                          {experiment.title}
                        </h3>
                        <p className="text-base text-muted-foreground mb-4" data-testid={`text-guide-${experiment.id}`}>
                          with {experiment.guide}
                        </p>
                        
                        <div className="mt-auto">
                          <Button className="w-full gap-2" data-testid={`button-experiment-${experiment.id}`}>
                            <FlaskConical className="w-4 h-4" /> View Experiment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {shareDialog.experiment && (
        <ShareConfirmationDialog
          open={shareDialog.open}
          onOpenChange={(open) => setShareDialog(prev => ({ ...prev, open }))}
          contentType="experiment"
          contentTitle={`Completed: ${shareDialog.experiment.title}`}
          contentPreview={`I just completed the ${shareDialog.experiment.title} experiment with ${shareDialog.experiment.guide}! 🎉`}
        />
      )}
    </Layout>
  );
}
