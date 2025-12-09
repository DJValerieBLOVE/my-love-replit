import { storage } from "./storage";
import { db } from "./db";
import { clubs, users, experiments, events } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Check if already seeded
  const existingClubs = await storage.getAllClubs();
  if (existingClubs.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Create default clubs
  const defaultClubs = [
    {
      name: "Magic Money Mamas",
      icon: "Zap",
      color: "text-[hsl(35,100%,60%)]",
      description: "Bitcoin, wealth sovereignty, and financial freedom",
    },
    {
      name: "Soulful Sisters",
      icon: "Users",
      color: "text-[hsl(270,100%,65%)]",
      description: "Meditation, spirituality, and deep connection",
    },
    {
      name: "Tech Goddesses",
      icon: "MessageSquare",
      color: "text-[hsl(200,100%,60%)]",
      description: "Nostr, Lightning, and building the future",
    },
    {
      name: "Creative Flow",
      icon: "LayoutGrid",
      color: "text-[hsl(320,100%,60%)]",
      description: "Art, writing, and expressing your unique voice",
    },
  ];

  for (const club of defaultClubs) {
    await storage.createClub(club);
  }
  console.log("Created default clubs");

  // Create default experiments
  const defaultExperiments = [
    {
      title: "Mindful Leadership",
      guide: "Dr. Maya Angelou",
      image: "/placeholder-experiment-1.jpg",
      category: "Wellness",
      totalDiscoveries: 12,
    },
    {
      title: "Bitcoin for Beginners",
      guide: "Satoshi University",
      image: "/placeholder-experiment-2.jpg",
      category: "Money",
      totalDiscoveries: 20,
    },
    {
      title: "Community Building 101",
      guide: "Lumina Team",
      image: "/placeholder-experiment-3.jpg",
      category: "Business",
      totalDiscoveries: 8,
    },
  ];

  for (const experiment of defaultExperiments) {
    await storage.createExperiment(experiment);
  }
  console.log("Created default experiments");

  // Create default events
  const defaultEvents = [
    {
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

  for (const event of defaultEvents) {
    await storage.createEvent(event);
  }
  console.log("Created default events");

  // Create test user (Sarah Jenkins from mock data)
  const testUser = await storage.createUser({
    username: "sarahj",
    password: "demo123", // In production, this should be hashed
    name: "Sarah Jenkins",
    handle: "@sarahj",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
  });

  // Update user stats
  await storage.updateUserStats(testUser.id, {
    sats: 12500,
    level: "Guide",
    streak: 12,
    walletBalance: 21000,
    badges: ["Early Adopter", "Zap Queen", "Mission Accomplished"],
  });
  console.log("Created test user: Sarah Jenkins");

  // Create sample area progress for test user
  const areas = [
    { id: "god-love", progress: 85 },
    { id: "romance", progress: 60 },
    { id: "family", progress: 75 },
    { id: "community", progress: 90 },
    { id: "mission", progress: 60 },
    { id: "money", progress: 55 },
    { id: "time", progress: 80 },
    { id: "environment", progress: 70 },
    { id: "body", progress: 65 },
    { id: "mind", progress: 80 },
    { id: "soul", progress: 95 },
  ];

  for (const area of areas) {
    await storage.upsertAreaProgress({
      userId: testUser.id,
      areaId: area.id,
      progress: area.progress,
    });
  }
  console.log("Created area progress for test user");

  // Create sample dreams
  const dreams = [
    { areaId: "god-love", dream: "To feel universally connected and lead with unconditional love in every interaction." },
    { areaId: "romance", dream: "To build a partnership based on deep trust, wild passion, and shared growth." },
    { areaId: "family", dream: "To create a legacy of laughter, support, and freedom for my children." },
    { areaId: "community", dream: "To spark a movement where every member feels seen, heard, and valued." },
    { areaId: "mission", dream: "To build the 11x LOVE Lab into a global force for consciousness evolution." },
    { areaId: "money", dream: "To achieve financial sovereignty and circulate abundance to fuel my mission." },
    { areaId: "time", dream: "To master my flow state and own my calendar, not let it own me." },
    { areaId: "environment", dream: "To live in a space that rejuvenates my spirit and reflects my inner clarity." },
    { areaId: "body", dream: "To inhabit a vessel that is strong, flexible, and vibrant with energy." },
    { areaId: "mind", dream: "To cultivate a mind that is sharp, curious, and peaceful amidst chaos." },
    { areaId: "soul", dream: "To live in complete alignment with my highest truth and soul's purpose." },
  ];

  for (const dream of dreams) {
    await storage.createDream({
      userId: testUser.id,
      ...dream,
    });
  }
  console.log("Created dreams for test user");

  console.log("Database seeding complete!");
  console.log(`Test user ID: ${testUser.id}`);
}

seed().catch(console.error);
