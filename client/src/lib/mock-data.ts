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
import Course1 from "@assets/generated_images/missions_header.png";
import Course2 from "@assets/generated_images/bitcoin_course_cover.png";
import CommunityCover from "@assets/djvalerieblove_god_bless_bitcoin_colorful_psychedelic_radiant_dc9f44e7-c040-42ca-90d3-2004a003d993_2_1764334319902.png";
import MagicMentor from "@assets/djvalerieblove_twirling_bitcoin_goddess_colorful_vivid_psyche_4e0fb7f6-b95b-488f-9d18-eb77e7dd0a60_1_1764334332945.png";

export const CURRENT_USER = {
  id: "user-1",
  name: "Sarah Jenkins",
  handle: "@sarahj",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
  sats: 12500,
  level: "Guide",
  streak: 12,
  walletBalance: 21000, // sats
  satsGiven: 15420, // sats sent to others
  satsReceived: 8750, // sats received from others
  badges: ["Early Adopter", "Zap Queen", "Mission Accomplished"],
};

// 11x LOVE CODE BRAND COLORS (from Brand Guidelines)
// GOD/LOVE: #eb00a8 | Romance: #e60023 | Family: #ff6600 | Community: #ffdf00
// Mission: #a2f005 | Money: #00d81c | Time: #00ccff | Environment: #0033ff
// Body: #6600ff | Mind: #9900ff | Soul: #cc00ff

export const EXPERIMENT_TAGS = [
  "Self-Paced",
  "Live",
  "Group",
  "Solo",
  "Quick Win",
  "Short",
  "Deep Dive",
  "Confidence",
  "Clarity",
  "Healing",
  "Abundance",
  "Connection",
  "Discipline",
  "Creativity",
  "Peace",
  "Leadership",
  "Gratitude",
  "Freedom",
  "Vitality",
  "Focus",
];

export const ELEVEN_DIMENSIONS = [
  { id: "god-love", name: "GOD/LOVE", color: "bg-[#eb00a8]", hex: "#eb00a8", progress: 85, dream: "To feel universally connected and lead with unconditional love in every interaction.", value: "Daily Prayer", villain: "Ego", victory: "Peace" },
  { id: "romance", name: "Romance", color: "bg-[#e60023]", hex: "#e60023", progress: 60, dream: "To build a partnership based on deep trust, wild passion, and shared growth.", value: "Date Night", villain: "Busyness", victory: "Connection" },
  { id: "family", name: "Family", color: "bg-[#ff6600]", hex: "#ff6600", progress: 75, dream: "To create a legacy of laughter, support, and freedom for my children.", value: "Dinner Together", villain: "Screens", victory: "Laughter" },
  { id: "community", name: "Community", color: "bg-[#ffdf00]", hex: "#ffdf00", progress: 90, dream: "To spark a movement where every member feels seen, heard, and valued.", value: "Outreach", villain: "Isolation", victory: "Belonging" },
  { id: "mission", name: "Mission", color: "bg-[#a2f005]", hex: "#a2f005", progress: 60, dream: "To build the 11x LOVE Lab into a global force for consciousness evolution.", value: "Focus Work", villain: "Distraction", victory: "Impact" },
  { id: "money", name: "Money", color: "bg-[#00d81c]", hex: "#00d81c", progress: 55, dream: "To achieve financial sovereignty and circulate abundance to fuel my mission.", value: "Budgeting", villain: "Scarcity", victory: "Freedom" },
  { id: "time", name: "Time", color: "bg-[#00ccff]", hex: "#00ccff", progress: 80, dream: "To master my flow state and own my calendar, not let it own me.", value: "Blocking", villain: "Overcommitment", victory: "Flow" },
  { id: "environment", name: "Environment", color: "bg-[#0033ff]", hex: "#0033ff", progress: 70, dream: "To live in a space that rejuvenates my spirit and reflects my inner clarity.", value: "Cleaning", villain: "Clutter", victory: "Serenity" },
  { id: "body", name: "Body", color: "bg-[#6600ff]", hex: "#6600ff", progress: 65, dream: "To inhabit a vessel that is strong, flexible, and vibrant with energy.", value: "Movement", villain: "Lethargy", victory: "Vitality" },
  { id: "mind", name: "Mind", color: "bg-[#9900ff]", hex: "#9900ff", progress: 80, dream: "To cultivate a mind that is sharp, curious, and peaceful amidst chaos.", value: "Meditation", villain: "Anxiety", victory: "Clarity" },
  { id: "soul", name: "Soul", color: "bg-[#cc00ff]", hex: "#cc00ff", progress: 95, dream: "To live in complete alignment with my highest truth and soul's purpose.", value: "Silence", villain: "Noise", victory: "Alignment" },
];

export const LOVE_CODE_AREAS = ELEVEN_DIMENSIONS;

export const CLUBS = [
  {
    id: "space-1",
    name: "Magic Money Mamas",
    icon: Zap,
    color: "text-[hsl(35,100%,60%)]",
    description: "Bitcoin, wealth sovereignty, and financial freedom",
  },
  {
    id: "space-2",
    name: "Soulful Sisters",
    icon: Users,
    color: "text-[hsl(270,100%,65%)]",
    description: "Meditation, spirituality, and deep connection",
  },
  {
    id: "space-3",
    name: "Tech Goddesses",
    icon: MessageSquare,
    color: "text-[hsl(200,100%,60%)]",
    description: "Nostr, Lightning, and building the future",
  },
  {
    id: "space-4",
    name: "Creative Flow",
    icon: LayoutGrid,
    color: "text-[hsl(320,100%,60%)]",
    description: "Art, writing, and expressing your unique voice",
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
    content: "The new Bitcoin Mission is fire! 🔥 Finally understand how Lightning channels work under the hood. Highly recommend checking it out.",
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
  {
    id: "post-4",
    author: {
      name: "Marcus Stone",
      handle: "@mstone",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    },
    content: "Testing out the new 11x LOVE Lab features. This platform feels different... in a good way. 🚀",
    likes: 0,
    comments: 0,
    zaps: 0,
    timestamp: "Just now",
  },
];

export const EXPERIMENTS = [
  {
    id: "exp-1",
    title: "Mindful Leadership",
    progress: 75,
    totalDiscoveries: 12,
    completedDiscoveries: 9,
    image: Course1,
    dimension: "mind",
  },
  {
    id: "exp-2",
    title: "Bitcoin for Beginners",
    progress: 30,
    totalDiscoveries: 20,
    completedDiscoveries: 6,
    image: Course2,
    dimension: "money",
  },
  {
    id: "exp-3",
    title: "Community Building 101",
    progress: 0,
    totalDiscoveries: 8,
    completedDiscoveries: 0,
    image: HeroBg,
    dimension: "community",
  },
];

export const EVENTS = [
  {
    id: "event-1",
    title: "All Community Meeting",
    host: "Maureen Anderson",
    date: "Today",
    time: "8:00am",
    type: "Repeat Event",
    recurrence: "Weekly",
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
    recurrence: "Weekly",
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
    title: "Get started in the 11x LOVE LaB",
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

export const STREAK_DATA = [
  { day: "M", active: true },
  { day: "T", active: true },
  { day: "W", active: true },
  { day: "T", active: false },
  { day: "F", active: true },
  { day: "S", active: true },
  { day: "S", active: false }, // Today
];

export const LEADERBOARD_DATA = [
  {
    id: "user-5",
    name: "Luna Starlight",
    handle: "@lunastar",
    avatar: "https://images.unsplash.com/photo-1517849465015-4b3f237764c5?w=150&h=150&fit=crop&crop=faces",
    level: "Master Guide",
    sats: 125000,
    streak: 45,
    badges: ["Ascended", "Bitcoin Pioneer", "Soul Seeker"],
  },
  {
    id: "user-3",
    name: "Alex Nova",
    handle: "@alexnova",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    level: "Guide Master",
    sats: 102000,
    streak: 38,
    badges: ["Lightning Fast", "Enlightened"],
  },
  {
    id: "user-4",
    name: "Quinn Ethereal",
    handle: "@quinn_e",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    level: "Guide",
    sats: 89000,
    streak: 32,
    badges: ["Community Star"],
  },
  {
    id: "user-1",
    name: "Sarah Jenkins",
    handle: "@sarahj",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    level: "Guide",
    sats: 78500,
    streak: 12,
    badges: ["Early Adopter", "Zap Queen"],
  },
  {
    id: "user-2",
    name: "Marcus Stone",
    handle: "@mstone",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    level: "Guide",
    sats: 62000,
    streak: 28,
    badges: [],
  },
  {
    id: "user-6",
    name: "Zara Phoenix",
    handle: "@zaraphx",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c006ae30?w=150&h=150&fit=crop&crop=faces",
    level: "Initiate",
    sats: 45000,
    streak: 18,
    badges: ["Commitment Champion"],
  },
];
