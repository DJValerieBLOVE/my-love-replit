import { 
  Users, 
  MessageSquare, 
  Zap, 
  Calendar, 
  Award, 
  BookOpen, 
  LayoutGrid, 
  Home 
} from "lucide-react";

import HeroBg from "@assets/generated_images/hero_background.png";
import Course1 from "@assets/generated_images/meditation_course_cover.png";
import Course2 from "@assets/generated_images/bitcoin_course_cover.png";
import CommunityCover from "@assets/generated_images/community_cover.png";

export const CURRENT_USER = {
  id: "user-1",
  name: "Sarah Jenkins",
  handle: "@sarahj",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
  xp: 2450,
  level: "Guide",
  streak: 12,
  walletBalance: 12500, // sats
  badges: ["Early Adopter", "Zap Queen", "Course Finisher"],
};

export const EVENTS = [
  {
    id: "event-1",
    title: "All Community Meeting",
    host: "Maureen Anderson",
    date: "Today",
    time: "8:00am",
    type: "Repeat Event",
    attendees: 68,
    image: "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&q=80",
    description: "This is an open meeting for anyone in the community to attend.",
    category: "Gathering"
  },
  {
    id: "event-2",
    title: "Embodiment Sobriety Support",
    host: "Tammi Scott / Kelvin...",
    date: "Today",
    time: "1:00pm",
    type: "Repeat Event",
    attendees: 84,
    image: "https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&q=80",
    description: "Click 'Zoom' or 'Join Now' at the time of the meeting to join.",
    category: "Support"
  },
  {
    id: "event-3",
    title: "11x LOVE Method Masterclass",
    host: "Sarah Jenkins",
    date: "Tomorrow",
    time: "10:00am",
    type: "Live Workshop",
    attendees: 120,
    image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&q=80",
    description: "Deep dive into the 5 Badassery pillars. Bring your journals!",
    category: "Workshop"
  }
];

export const ONBOARDING_STEPS = [
  {
    id: "step-1",
    title: "Get started in the Lumina community",
    completed: false,
    steps: [
      { id: "s1-1", label: "Complete your profile", isCompleted: true },
      { id: "s1-2", label: "Customize your notifications", isCompleted: true },
      { id: "s1-3", label: "Get to know gamification", isCompleted: true },
      { id: "s1-4", label: "How to find what you're looking for", isCompleted: false },
      { id: "s1-5", label: "Community Guidelines", isCompleted: false },
    ]
  }
];

export const SPACES = [
  {
    id: "space-1",
    name: "General Lounge",
    icon: MessageSquare,
    color: "text-blue-500",
    description: "Hang out and chat with everyone",
  },
  {
    id: "space-2",
    name: "Bitcoin & Tech",
    icon: Zap,
    color: "text-orange-500",
    description: "Discussing the future of money",
  },
  {
    id: "space-3",
    name: "Wellness & Mind",
    icon: Users,
    color: "text-purple-500",
    description: "Meditation, health, and spirit",
  },
];

export const FEED_POSTS = [
  {
    id: "post-1",
    author: {
      name: "Elena Rodriguez",
      handle: "@elena_r",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    },
    content: "Just finished the morning meditation session. Feeling so grounded and ready to tackle the day! 🧘‍♀️✨ #MorningRoutine #Mindfulness",
    image: CommunityCover,
    likes: 24,
    comments: 5,
    zaps: 1200, // sats
    timestamp: "2h ago",
  },
  {
    id: "post-2",
    author: {
      name: "David Chen",
      handle: "@dchen_btc",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    },
    content: "The new Bitcoin course module is fire! 🔥 Finally understand how Lightning channels work under the hood. Highly recommend checking it out.",
    likes: 45,
    comments: 12,
    zaps: 5000,
    timestamp: "4h ago",
  },
  {
    id: "post-3",
    author: {
      name: "Sarah Jenkins",
      handle: "@sarahj",
      avatar: CURRENT_USER.avatar,
    },
    content: "Who wants to join me for a 7-day gratitude challenge starting Monday? Let's keep each other accountable! 🙌",
    likes: 18,
    comments: 8,
    zaps: 500,
    timestamp: "5h ago",
  },
];

export const COURSES = [
  {
    id: "course-1",
    title: "Mindful Leadership",
    instructor: "Dr. Maya Angelou",
    progress: 75,
    totalLessons: 12,
    completedLessons: 9,
    image: Course1,
    category: "Wellness",
  },
  {
    id: "course-2",
    title: "Bitcoin for Beginners",
    instructor: "Satoshi University",
    progress: 30,
    totalLessons: 20,
    completedLessons: 6,
    image: Course2,
    category: "Finance",
  },
  {
    id: "course-3",
    title: "Community Building 101",
    instructor: "Lumina Team",
    progress: 0,
    totalLessons: 8,
    completedLessons: 0,
    image: HeroBg,
    category: "Business",
  },
];

export const STREAK_DATA = [
  { day: "M", active: true },
  { day: "T", active: true },
  { day: "W", active: true },
  { day: "T", active: false },
  { day: "F", active: true },
  { day: "S", active: true },
  { day: "S", active: false }, // Today
];
