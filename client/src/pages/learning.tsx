import Layout from "@/components/layout";
import { EXPERIMENTS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle, Lock, BookOpen, Search, Clock, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function Learning() {
  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredCourses = COURSES.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    const matchesCategory = categoryFilter === "all" || course.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const filteredExperiments = EXPERIMENTS.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-muted-foreground">Learn</h1>
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
                <Link key={course.id} href={`/learning/${course.id}`}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiments.map((experiment) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
