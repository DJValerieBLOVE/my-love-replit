import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  FlaskConical, 
  BookOpen, 
  Users, 
  Plus, 
  Eye, 
  Loader2,
  TrendingUp,
  UserCheck,
  Settings,
  ChevronDown,
  ChevronUp,
  User
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useNostr } from "@/contexts/nostr-context";
import { useState } from "react";
import { getCreatorExperiments, getCreatorCourses, getCreatorCommunities, getCreatorAnalytics, getExperimentParticipants, getCourseEnrollees } from "@/lib/api";
import type { Experiment, Course, Community } from "@shared/schema";

function ParticipantsList({ experimentId }: { experimentId: string }) {
  const { data: participants = [], isLoading } = useQuery({
    queryKey: ["experiment-participants", experimentId],
    queryFn: () => getExperimentParticipants(experimentId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">No participants yet</p>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {participants.map((p: any) => (
        <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded" data-testid={`participant-${p.id}`}>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{p.user?.displayName || "Anonymous"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {p.progress}% complete
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function EnrolleesList({ courseId }: { courseId: string }) {
  const { data: enrollees = [], isLoading } = useQuery({
    queryKey: ["course-enrollees", courseId],
    queryFn: () => getCourseEnrollees(courseId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (enrollees.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">No enrollees yet</p>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {enrollees.map((e: any) => (
        <div key={e.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded" data-testid={`enrollee-${e.id}`}>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{e.user?.displayName || "Anonymous"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {e.currentLessonIndex || 0} lessons completed
            </Badge>
            {e.completedAt && (
              <Badge variant="default" className="text-xs">
                Completed
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperimentCard({ experiment, setLocation }: { experiment: Experiment; setLocation: (path: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="rounded-xs" data-testid={`card-experiment-${experiment.id}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xs overflow-hidden bg-muted flex-shrink-0">
                {experiment.image ? (
                  <img src={experiment.image} alt={experiment.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-white/50" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-muted-foreground" data-testid={`text-experiment-${experiment.id}`}>
                  {experiment.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {experiment.steps?.length || 0} steps · {experiment.category}
                </p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge variant={experiment.isPublished ? "default" : "secondary"} data-testid={`badge-status-${experiment.id}`}>
                    {experiment.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant="outline" data-testid={`badge-access-${experiment.id}`}>{experiment.accessType}</Badge>
                  <Badge variant="outline" data-testid={`badge-enrolled-${experiment.id}`}>
                    <UserCheck className="w-3 h-3 mr-1" />
                    {experiment.totalDiscoveries} enrolled
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-toggle-participants-${experiment.id}`}>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation(`/experiments/${experiment.id}`)}
                data-testid={`button-view-experiment-${experiment.id}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            <div className="border-t mt-4 pt-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">Participants</p>
              <ParticipantsList experimentId={experiment.id} />
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

function CourseCard({ course, setLocation }: { course: Course; setLocation: (path: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="rounded-xs" data-testid={`card-course-${course.id}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xs overflow-hidden bg-muted flex-shrink-0">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white/50" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-muted-foreground" data-testid={`text-course-${course.id}`}>
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {course.description}
                </p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge variant={course.isPublished ? "default" : "secondary"} data-testid={`badge-status-${course.id}`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant="outline" data-testid={`badge-access-${course.id}`}>{course.accessType}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-toggle-enrollees-${course.id}`}>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation(`/experiments/course/${course.id}`)}
                data-testid={`button-view-course-${course.id}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            <div className="border-t mt-4 pt-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">Enrollees</p>
              <EnrolleesList courseId={course.id} />
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

function CommunityCard({ community, setLocation }: { community: Community; setLocation: (path: string) => void }) {
  return (
    <Card className="rounded-xs" data-testid={`card-community-${community.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xs overflow-hidden bg-muted flex-shrink-0">
              {community.coverImage || community.thumbnail ? (
                <img src={community.coverImage || community.thumbnail || ""} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white/50" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-muted-foreground" data-testid={`text-community-${community.id}`}>
                {community.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {community.description}
              </p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge variant="outline" data-testid={`badge-access-${community.id}`}>{community.accessType}</Badge>
                <Badge variant="outline" data-testid={`badge-members-${community.id}`}>
                  <Users className="w-3 h-3 mr-1" />
                  {community.memberCount || 0} members
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation(`/community/${community.id}/admin`)}
              data-testid={`button-admin-community-${community.id}`}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation(`/community/${community.id}`)}
              data-testid={`button-view-community-${community.id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreatorDashboard() {
  const [, setLocation] = useLocation();
  const { isConnected } = useNostr();

  const { data: experiments = [], isLoading: experimentsLoading } = useQuery({
    queryKey: ["creator", "experiments"],
    queryFn: getCreatorExperiments,
    enabled: isConnected,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["creator", "courses"],
    queryFn: getCreatorCourses,
    enabled: isConnected,
  });

  const { data: communities = [], isLoading: communitiesLoading } = useQuery({
    queryKey: ["creator", "communities"],
    queryFn: getCreatorCommunities,
    enabled: isConnected,
  });

  const { data: analytics = { totalCourseEnrollments: 0, totalExperimentEnrollments: 0 }, isLoading: analyticsLoading } = useQuery({
    queryKey: ["creator", "analytics"],
    queryFn: getCreatorAnalytics,
    enabled: isConnected,
  });

  const isLoading = experimentsLoading || coursesLoading || communitiesLoading || analyticsLoading;

  if (!isConnected) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4" data-testid="text-login-prompt">Please log in to access your creator dashboard.</p>
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">Go Home</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const experimentsList = experiments as Experiment[];
  const coursesList = courses as Course[];
  const communitiesList = communities as Community[];

  const totalExperiments = experimentsList.length;
  const publishedExperiments = experimentsList.filter(e => e.isPublished).length;
  const totalCourses = coursesList.length;
  const publishedCourses = coursesList.filter(c => c.isPublished).length;
  const totalCommunities = communitiesList.length;
  const totalMembers = communitiesList.reduce((sum, c) => sum + (c.memberCount || 0), 0);
  const totalEnrollments = (analytics as { totalCourseEnrollments: number; totalExperimentEnrollments: number }).totalCourseEnrollments + 
                           (analytics as { totalCourseEnrollments: number; totalExperimentEnrollments: number }).totalExperimentEnrollments;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-muted-foreground" data-testid="heading-creator-dashboard">Creator Dashboard</h1>
            <p className="text-muted-foreground">Manage your content and track your community</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setLocation("/experiments/create")} className="gap-2" data-testid="button-new-experiment">
              <FlaskConical className="w-4 h-4" />
              New Experiment
            </Button>
            <Button variant="outline" onClick={() => setLocation("/experiments/course/create")} className="gap-2" data-testid="button-new-course">
              <BookOpen className="w-4 h-4" />
              New Course
            </Button>
            <Button onClick={() => setLocation("/community/create")} className="gap-2" data-testid="button-new-community">
              <Users className="w-4 h-4" />
              New Community
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-xs" data-testid="card-stat-experiments">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Experiments</p>
                      <p className="text-3xl font-bold">{totalExperiments}</p>
                      <p className="text-xs text-muted-foreground">{publishedExperiments} published</p>
                    </div>
                    <FlaskConical className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xs" data-testid="card-stat-enrolled">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Enrolled</p>
                      <p className="text-3xl font-bold">{totalEnrollments}</p>
                      <p className="text-xs text-muted-foreground">across all content</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xs" data-testid="card-stat-courses">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Courses</p>
                      <p className="text-3xl font-bold">{totalCourses}</p>
                      <p className="text-xs text-muted-foreground">{publishedCourses} published</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xs" data-testid="card-stat-communities">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Communities</p>
                      <p className="text-3xl font-bold">{totalCommunities}</p>
                      <p className="text-xs text-muted-foreground">{totalMembers} total members</p>
                    </div>
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="experiments" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="experiments" data-testid="tab-experiments">
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Experiments ({totalExperiments})
                </TabsTrigger>
                <TabsTrigger value="courses" data-testid="tab-courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Courses ({totalCourses})
                </TabsTrigger>
                <TabsTrigger value="communities" data-testid="tab-communities">
                  <Users className="w-4 h-4 mr-2" />
                  Communities ({totalCommunities})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="experiments">
                {totalExperiments === 0 ? (
                  <Card className="p-8 text-center rounded-xs" data-testid="card-empty-experiments">
                    <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-bold text-lg mb-2">No Experiments Yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first experiment to help others grow</p>
                    <Button onClick={() => setLocation("/experiments/create")} className="gap-2" data-testid="button-create-first-experiment">
                      <Plus className="w-4 h-4" />
                      Create Experiment
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {experimentsList.map((experiment) => (
                      <ExperimentCard key={experiment.id} experiment={experiment} setLocation={setLocation} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="courses">
                {totalCourses === 0 ? (
                  <Card className="p-8 text-center rounded-xs" data-testid="card-empty-courses">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-bold text-lg mb-2">No Courses Yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first course to share your knowledge</p>
                    <Button onClick={() => setLocation("/experiments/course/create")} className="gap-2" data-testid="button-create-first-course">
                      <Plus className="w-4 h-4" />
                      Create Course
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {coursesList.map((course) => (
                      <CourseCard key={course.id} course={course} setLocation={setLocation} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="communities">
                {totalCommunities === 0 ? (
                  <Card className="p-8 text-center rounded-xs" data-testid="card-empty-communities">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-bold text-lg mb-2">No Communities Yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first community to build your tribe</p>
                    <Button onClick={() => setLocation("/community/create")} className="gap-2" data-testid="button-create-first-community">
                      <Plus className="w-4 h-4" />
                      Create Community
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {communitiesList.map((community) => (
                      <CommunityCard key={community.id} community={community} setLocation={setLocation} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}
