import { useRoute } from "wouter";
import Layout from "@/components/layout";
import { MISSIONS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, PlayCircle, Award, Clock, BookOpen, Zap } from "lucide-react";
import { Link } from "wouter";

export default function MissionDetail() {
  const [, params] = useRoute("/missions/:id");
  const mission = MISSIONS.find(m => m.id === params?.id);

  if (!mission) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          <p className="text-muted-foreground">Mission not found</p>
        </div>
      </Layout>
    );
  }

  const lessons = [
    { num: 1, title: "Introduction", duration: "8 min", locked: false },
    { num: 2, title: "Core Concepts", duration: "12 min", locked: false },
    { num: 3, title: "Practical Application", duration: "15 min", locked: false },
    { num: 4, title: "Deep Dive", duration: "20 min", locked: mission.completedLessons < 3 },
    { num: 5, title: "Workshop Challenge", duration: "25 min", locked: mission.completedLessons < 4 },
  ];

  const isInProgress = mission.progress > 0 && mission.progress < 100;
  const isCompleted = mission.progress === 100;
  const notStarted = mission.progress === 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Back Button */}
        <Link href="/courses">
          <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            Back to Missions
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden h-80">
          <div className="absolute inset-0 bg-black/30 z-10" />
          <img 
            src={mission.image} 
            alt={mission.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-3 bg-white/90 text-black hover:bg-white" data-testid={`badge-category-${mission.id}`}>
                  {mission.category}
                </Badge>
                <h1 className="text-4xl font-serif font-bold text-white mb-2">{mission.title}</h1>
                <p className="text-white/90 text-lg">with {mission.instructor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Stats & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Progress Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-purple-900/10 to-pink-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" data-testid={`text-progress-${mission.id}`}>Your Progress</h3>
                <div className="text-3xl font-black text-primary">{mission.progress}%</div>
              </div>
              <Progress value={mission.progress} className="h-3 mb-4" />
              <p className="text-sm text-muted-foreground">
                {mission.completedLessons} of {mission.totalLessons} lessons completed
              </p>
            </CardContent>
          </Card>

          {/* Time Investment */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-cyan-500" />
                <h3 className="font-bold text-lg">Time Investment</h3>
              </div>
              <p className="text-3xl font-black text-cyan-500 mb-2">~{mission.totalLessons * 2}h</p>
              <p className="text-sm text-muted-foreground">Average completion time</p>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-yellow-500" />
                <h3 className="font-bold text-lg">Rewards</h3>
              </div>
              <p className="text-3xl font-black text-yellow-500 mb-2">5000 Sats</p>
              <p className="text-sm text-muted-foreground">+ Exclusive Badge</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <Button 
          className="w-full mb-8 py-6 text-lg font-semibold gap-2 bg-primary hover:bg-primary/90" 
          data-testid={`button-${isCompleted ? 'review' : isInProgress ? 'resume' : 'start'}-mission`}
        >
          {isCompleted ? (
            <><CheckCircle className="w-5 h-5" /> Review Mission</>
          ) : isInProgress ? (
            <><PlayCircle className="w-5 h-5" /> Resume Mission</>
          ) : (
            <><PlayCircle className="w-5 h-5" /> Start Mission</>
          )}
        </Button>

        {/* Lessons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-serif mb-6">Mission Lessons</h2>
          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <Card 
                key={lesson.num} 
                className={`border-none shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  idx < mission.completedLessons ? 'bg-primary/5' : ''
                }`}
                data-testid={`card-lesson-${mission.id}-${lesson.num}`}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {idx < mission.completedLessons ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {lesson.num}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold" data-testid={`text-lesson-title-${lesson.num}`}>{lesson.title}</h3>
                      <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.locked && (
                      <Badge variant="secondary" className="text-xs">Locked</Badge>
                    )}
                    <div className="text-muted-foreground">→</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Description */}
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              About This Mission
            </h3>
            <p className="text-foreground leading-relaxed mb-4">
              This comprehensive mission guides you through {mission.category.toLowerCase()} principles and practices. 
              You'll learn from industry experts, engage with real-world examples, and complete hands-on challenges to solidify your knowledge.
            </p>
            <p className="text-foreground leading-relaxed">
              By completing this mission, you'll gain valuable skills aligned with the 11x LOVE Code methodology and earn rewards 
              that contribute to your overall growth across all life dimensions.
            </p>
          </CardContent>
        </Card>

        {/* Gamification Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm text-center">
            <CardContent className="p-4">
              <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="font-bold text-lg">12</p>
              <p className="text-xs text-muted-foreground">XP Points</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm text-center">
            <CardContent className="p-4">
              <Award className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="font-bold text-lg">1</p>
              <p className="text-xs text-muted-foreground">Badge Unlock</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm text-center">
            <CardContent className="p-4">
              <PlayCircle className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
              <p className="font-bold text-lg">{mission.totalLessons - mission.completedLessons}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm text-center">
            <CardContent className="p-4">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-lg">{mission.progress === 100 ? '✓' : '−'}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
