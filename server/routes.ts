import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authMiddleware, optionalAuth, requireOwnership } from "./auth";
import {
  insertJournalEntrySchema,
  insertDreamSchema,
  insertAreaProgressSchema,
  insertExperimentSchema,
  insertUserExperimentSchema,
  insertExperimentNoteSchema,
  insertDiscoveryNoteSchema,
  insertEventSchema,
  insertPostSchema,
  insertClubSchema,
  insertZapSchema,
  updateEmailSchema,
  insertCourseSchema,
  insertLessonSchema,
  insertCourseEnrollmentSchema,
  insertCourseCommentSchema,
  insertLessonCommentSchema,
  insertCommunitySchema,
  insertCommunityMembershipSchema,
  insertCommunityPostSchema,
} from "@shared/schema";
import { chat, validateApiKey, type ChatMessage, type UserContext } from "./anthropic";

const FREE_TIER_DAILY_LIMIT = parseInt(process.env.FREE_TIER_DAILY_LIMIT || "5");
const MAX_TOKENS_PER_REQUEST = parseInt(process.env.MAX_TOKENS_PER_REQUEST || "2000");

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===== AUTH ROUTES =====
  
  // Login/register with Nostr - creates or updates user
  app.post("/api/auth/nostr", async (req, res) => {
    try {
      const { pubkey, name, picture, nip05, lud16 } = req.body;
      
      if (!pubkey) {
        return res.status(400).json({ error: "Pubkey is required" });
      }
      
      const user = await storage.createOrUpdateUserByPubkey(pubkey, {
        name: name || undefined,
        avatar: picture || undefined,
        nip05: nip05 || undefined,
        lud16: lud16 || undefined,
      });
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Failed to authenticate" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user email (required for trial access)
  app.post("/api/auth/email", authMiddleware, async (req, res) => {
    try {
      const result = updateEmailSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0]?.message || "Invalid email" });
      }
      
      const { email } = result.data;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== req.userId) {
        return res.status(400).json({ error: "This email is already in use" });
      }
      
      const user = await storage.updateUserEmail(req.userId!, email);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Email update error:", error);
      res.status(500).json({ error: "Failed to update email" });
    }
  });

  // Check if user profile is complete (has email)
  app.get("/api/auth/profile-status", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({
        profileComplete: !!user.email,
        hasEmail: !!user.email,
        trialStartedAt: user.trialStartedAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check profile status" });
    }
  });
  
  // ===== JOURNAL ENTRIES (Daily LOVE Practice) =====
  
  // Get all journal entries for authenticated user
  app.get("/api/journal", authMiddleware, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const entries = await storage.getJournalEntries(req.userId!, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  // Legacy route - kept for backwards compatibility but checks ownership
  app.get("/api/journal/:userId", authMiddleware, requireOwnership("userId"), async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const entries = await storage.getJournalEntries(req.userId!, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  // Get journal entry for specific date
  app.get("/api/journal/:userId/date/:date", authMiddleware, requireOwnership("userId"), async (req, res) => {
    try {
      const { date } = req.params;
      const entry = await storage.getJournalEntryByDate(req.userId!, new Date(date));
      res.json(entry || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entry" });
    }
  });

  // Create journal entry
  app.post("/api/journal", authMiddleware, async (req, res) => {
    try {
      const data = { ...req.body, userId: req.userId };
      const validated = insertJournalEntrySchema.parse(data);
      const entry = await storage.createJournalEntry(validated);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid journal entry data" });
    }
  });

  // Update journal entry
  app.patch("/api/journal/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getJournalEntry(id);
      if (!existing) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      if (existing.userId !== req.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const entry = await storage.updateJournalEntry(id, req.body);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update journal entry" });
    }
  });

  // Delete journal entry
  app.delete("/api/journal/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage.getJournalEntry(id);
      if (!existing) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      if (existing.userId !== req.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      await storage.deleteJournalEntry(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete journal entry" });
    }
  });

  // ===== DREAMS =====
  
  // Get all dreams for authenticated user
  app.get("/api/dreams", authMiddleware, async (req, res) => {
    try {
      const dreams = await storage.getDreamsByUser(req.userId!);
      res.json(dreams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dreams" });
    }
  });

  // Legacy route with ownership check
  app.get("/api/dreams/:userId", authMiddleware, requireOwnership("userId"), async (req, res) => {
    try {
      const dreams = await storage.getDreamsByUser(req.userId!);
      res.json(dreams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dreams" });
    }
  });

  // Get dream for specific area
  app.get("/api/dreams/:userId/area/:areaId", authMiddleware, requireOwnership("userId"), async (req, res) => {
    try {
      const { areaId } = req.params;
      const dream = await storage.getDreamByArea(req.userId!, areaId);
      res.json(dream || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dream" });
    }
  });

  // Create or update dream
  app.post("/api/dreams", authMiddleware, async (req, res) => {
    try {
      const data = { ...req.body, userId: req.userId };
      const validated = insertDreamSchema.parse(data);
      
      const existing = await storage.getDreamByArea(req.userId!, validated.areaId);
      
      if (existing) {
        const updated = await storage.updateDream(existing.id, { dream: validated.dream });
        res.json(updated);
      } else {
        const created = await storage.createDream(validated);
        res.status(201).json(created);
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid dream data" });
    }
  });

  // ===== AREA PROGRESS =====
  
  // Get area progress for authenticated user
  app.get("/api/progress", authMiddleware, async (req, res) => {
    try {
      const progress = await storage.getAreaProgress(req.userId!);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch area progress" });
    }
  });

  // Legacy route with ownership check
  app.get("/api/progress/:userId", authMiddleware, requireOwnership("userId"), async (req, res) => {
    try {
      const progress = await storage.getAreaProgress(req.userId!);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch area progress" });
    }
  });

  // Update area progress
  app.post("/api/progress", authMiddleware, async (req, res) => {
    try {
      const data = { ...req.body, userId: req.userId };
      const validated = insertAreaProgressSchema.parse(data);
      const progress = await storage.upsertAreaProgress(validated);
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid progress data" });
    }
  });

  // ===== EXPERIMENTS =====
  
  // Get all experiments (public)
  app.get("/api/experiments", async (req, res) => {
    try {
      const experiments = await storage.getAllExperiments();
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch experiments" });
    }
  });

  // Get single experiment
  app.get("/api/experiments/:id", async (req, res) => {
    try {
      const experiment = await storage.getExperiment(req.params.id);
      if (!experiment) {
        return res.status(404).json({ error: "Experiment not found" });
      }
      res.json(experiment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch experiment" });
    }
  });

  // Create experiment (any authenticated user can create)
  app.post("/api/experiments", authMiddleware, async (req, res) => {
    try {
      const data = { ...req.body, creatorId: req.userId };
      const validated = insertExperimentSchema.parse(data);
      const experiment = await storage.createExperiment(validated);
      res.status(201).json(experiment);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid experiment data" });
    }
  });

  // Get authenticated user's enrolled experiments
  app.get("/api/user-experiments", authMiddleware, async (req, res) => {
    try {
      const experiments = await storage.getUserExperiments(req.userId!);
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user experiments" });
    }
  });

  // Legacy route with ownership check
  app.get("/api/user-experiments/:userId", authMiddleware, requireOwnership("userId"), async (req, res) => {
    try {
      const experiments = await storage.getUserExperiments(req.userId!);
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user experiments" });
    }
  });

  // Enroll authenticated user in experiment
  app.post("/api/user-experiments", authMiddleware, async (req, res) => {
    try {
      const data = { ...req.body, userId: req.userId };
      const validated = insertUserExperimentSchema.parse(data);
      const userExperiment = await storage.enrollUserInExperiment(validated);
      res.status(201).json(userExperiment);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid enrollment data" });
    }
  });

  // Update experiment progress
  app.patch("/api/user-experiments/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userExperiment = await storage.updateUserExperimentProgress(id, req.body);
      if (!userExperiment) {
        return res.status(404).json({ error: "User experiment not found" });
      }
      res.json(userExperiment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update experiment progress" });
    }
  });

  // ===== CREATOR DASHBOARD =====

  // Get creator's experiments
  app.get("/api/creator/experiments", authMiddleware, async (req, res) => {
    try {
      const experiments = await storage.getExperimentsByCreator(req.userId!);
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch creator experiments" });
    }
  });

  // Get creator's courses
  app.get("/api/creator/courses", authMiddleware, async (req, res) => {
    try {
      const courses = await storage.getCoursesByCreator(req.userId!);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch creator courses" });
    }
  });

  // Get creator's communities
  app.get("/api/creator/communities", authMiddleware, async (req, res) => {
    try {
      const communities = await storage.getCommunitiesByCreator(req.userId!);
      res.json(communities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch creator communities" });
    }
  });

  // Get creator analytics
  app.get("/api/creator/analytics", authMiddleware, async (req, res) => {
    try {
      const analytics = await storage.getCreatorAnalytics(req.userId!);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch creator analytics" });
    }
  });

  // Get experiment participants (creator only)
  app.get("/api/experiments/:id/participants", authMiddleware, async (req, res) => {
    try {
      const experiment = await storage.getExperiment(req.params.id);
      if (!experiment) {
        return res.status(404).json({ error: "Experiment not found" });
      }
      if (experiment.creatorId !== req.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      const participants = await storage.getExperimentParticipants(req.params.id);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  // ===== EXPERIMENT NOTES =====
  
  // Get authenticated user's experiment notes
  app.get("/api/experiment-notes/:experimentId", authMiddleware, async (req, res) => {
    try {
      const { experimentId } = req.params;
      const notes = await storage.getExperimentNotes(req.userId!, experimentId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch experiment notes" });
    }
  });

  // Legacy route with ownership check
  app.get("/api/experiment-notes/:userId/:experimentId", authMiddleware, requireOwnership("userId"), async (req, res) => {
    try {
      const { experimentId } = req.params;
      const notes = await storage.getExperimentNotes(req.userId!, experimentId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch experiment notes" });
    }
  });

  // Create experiment note
  app.post("/api/experiment-notes", authMiddleware, async (req, res) => {
    try {
      const data = { ...req.body, userId: req.userId };
      const validated = insertExperimentNoteSchema.parse(data);
      const note = await storage.createExperimentNote(validated);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid note data" });
    }
  });

  // Update experiment note
  app.patch("/api/experiment-notes/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const note = await storage.updateExperimentNote(id, req.body);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  // Delete experiment note
  app.delete("/api/experiment-notes/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteExperimentNote(id);
      if (!success) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // ===== DISCOVERY NOTES =====
  
  // Get authenticated user's discovery notes
  app.get("/api/discovery-notes/:experimentId", authMiddleware, async (req, res) => {
    try {
      const { experimentId } = req.params;
      const notes = await storage.getDiscoveryNotes(req.userId!, experimentId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch discovery notes" });
    }
  });

  // Legacy route with ownership check
  app.get("/api/discovery-notes/:userId/:experimentId", authMiddleware, requireOwnership("userId"), async (req, res) => {
    try {
      const { experimentId } = req.params;
      const notes = await storage.getDiscoveryNotes(req.userId!, experimentId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch discovery notes" });
    }
  });

  // Create discovery note
  app.post("/api/discovery-notes", authMiddleware, async (req, res) => {
    try {
      const data = { ...req.body, userId: req.userId };
      const validated = insertDiscoveryNoteSchema.parse(data);
      const note = await storage.createDiscoveryNote(validated);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid note data" });
    }
  });

  // Update discovery note
  app.patch("/api/discovery-notes/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const note = await storage.updateDiscoveryNote(id, req.body);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  // Delete discovery note
  app.delete("/api/discovery-notes/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDiscoveryNote(id);
      if (!success) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // ===== EVENTS =====
  
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Create event
  app.post("/api/events", async (req, res) => {
    try {
      const validated = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validated);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid event data" });
    }
  });

  // ===== POSTS (Feed) =====
  
  // Get recent posts (public - with optional auth for enhanced features)
  app.get("/api/posts", optionalAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const posts = await storage.getRecentPosts(limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Create post - requires auth
  app.post("/api/posts", authMiddleware, async (req, res) => {
    try {
      const data = { ...req.body, authorId: req.userId };
      const validated = insertPostSchema.parse(data);
      const post = await storage.createPost(validated);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid post data" });
    }
  });

  // Like post - requires auth
  app.post("/api/posts/:id/like", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.likePost(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to like post" });
    }
  });

  // Zap post - requires auth
  app.post("/api/posts/:id/zap", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, comment, paymentHash, receiverId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid zap amount" });
      }
      
      if (!receiverId) {
        return res.status(400).json({ error: "Receiver ID required" });
      }
      
      const zap = await storage.createZap({
        senderId: req.userId!,
        receiverId,
        postId: id,
        amount,
        comment: comment || null,
        paymentHash: paymentHash || null,
      });
      
      res.json(zap);
    } catch (error) {
      console.error("Zap error:", error);
      res.status(500).json({ error: "Failed to zap post" });
    }
  });

  // Get user's zap history
  app.get("/api/zaps", authMiddleware, async (req, res) => {
    try {
      const type = (req.query.type as 'sent' | 'received') || 'received';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const zaps = await storage.getZapsByUser(req.userId!, type, limit);
      res.json(zaps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch zaps" });
    }
  });

  // Get user's zap stats
  app.get("/api/zaps/stats", authMiddleware, async (req, res) => {
    try {
      const stats = await storage.getUserZapStats(req.userId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch zap stats" });
    }
  });

  // ===== CLUBS =====
  
  // Get all clubs
  app.get("/api/clubs", async (req, res) => {
    try {
      const clubs = await storage.getAllClubs();
      res.json(clubs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clubs" });
    }
  });

  // Create club
  app.post("/api/clubs", async (req, res) => {
    try {
      const validated = insertClubSchema.parse(req.body);
      const club = await storage.createClub(validated);
      res.status(201).json(club);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid club data" });
    }
  });

  // ===== USERS =====
  
  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get public profile with content (courses, experiments, communities)
  app.get("/api/users/:id/profile", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get user's published content
      const experiments = await storage.getExperimentsByCreator(id);
      const courses = await storage.getCoursesByCreator(id);
      const communities = await storage.getCommunitiesByCreator(id);
      
      // Return public profile data (no password, email, etc.)
      // Only show public communities
      const publicCommunities = communities.filter(c => c.accessType === "public");
      
      const publicProfile = {
        id: user.id,
        name: user.name,
        handle: user.handle,
        avatar: user.avatar,
        nip05: user.nip05,
        level: user.level,
        sats: user.sats,
        streak: user.streak,
        badges: user.badges,
        satsGiven: user.satsGiven,
        satsReceived: user.satsReceived,
        lookingForBuddy: user.lookingForBuddy,
        buddyDescription: user.buddyDescription,
        labInterests: user.labInterests,
        createdAt: user.createdAt,
        content: {
          experiments: experiments.filter(e => e.isPublished),
          courses: courses.filter(c => c.isPublished),
          communities: publicCommunities,
        },
        stats: {
          experimentsCount: experiments.filter(e => e.isPublished).length,
          coursesCount: courses.filter(c => c.isPublished).length,
          communitiesCount: publicCommunities.length,
        }
      };
      
      res.json(publicProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update user stats
  app.patch("/api/users/:id/stats", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUserStats(id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user stats" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const users = await storage.getLeaderboard(limit);
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // ===== AI MAGIC MENTOR ROUTES =====

  // Check if AI is available
  app.get("/api/ai/status", (req, res) => {
    res.json({ 
      available: validateApiKey(),
      model: "claude-haiku-4-5"
    });
  });

  // Chat with Magic Mentor - requires auth
  app.post("/api/ai/chat", authMiddleware, async (req, res) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      if (!validateApiKey()) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      // Get user for context
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // BYOK validation (must have key set)
      if (user.tier === "byok" && !user.userApiKey) {
        return res.status(400).json({ error: "BYOK tier requires an API key. Please add your Anthropic API key in settings." });
      }
      
      // BYOK users use their own key
      const userApiKey = user.tier === "byok" && user.userApiKey ? user.userApiKey : undefined;

      // Phase 1: Reserve a slot atomically BEFORE calling AI
      // This enforces limits with row-level lock to prevent race conditions
      // For paid tier, reserves MAX_TOKENS_PER_REQUEST tokens upfront (worst case)
      const reserveResult = await storage.reserveAiUsageSlot({
        userId: user.id,
        tier: user.tier || "free",
        freeTierLimit: FREE_TIER_DAILY_LIMIT,
        estimatedTokens: MAX_TOKENS_PER_REQUEST + 500, // Reserve max output + estimated input
      });

      if (!reserveResult.success) {
        return res.status(reserveResult.errorCode).json({ error: reserveResult.error });
      }

      const tier = user.tier || "free";
      const tokensReserved = reserveResult.tokensReserved;

      // Get user's recent journal entries and dreams for context
      const recentJournals = await storage.getJournalEntries(user.id, 5);
      const dreams = await storage.getDreamsByUser(user.id);

      const userContext: UserContext = {
        name: user.name,
        coreGoals: user.coreGoals || undefined,
        currentChallenges: user.currentChallenges || undefined,
        interestsTags: user.interestsTags || undefined,
        communicationStyle: user.communicationStyle || undefined,
        recentJournalEntries: recentJournals.map(j => ({
          date: j.date.toISOString().split('T')[0],
          vibe: j.vibeRating?.toString() || "",
          vision: j.goal || "",
          value: j.gratitude || "",
          villain: j.lesson || "",
          victory: j.blessing || "",
        })),
        dreams: dreams.map(d => ({
          area: d.areaId,
          dream: d.dream || "",
        })),
      };

      // Call AI with configurable max tokens
      let result;
      try {
        result = await chat(messages, userContext, userApiKey, MAX_TOKENS_PER_REQUEST);
      } catch (aiError: any) {
        // AI call failed - release the reserved slot (and refund tokens for paid tier)
        await storage.releaseAiUsageSlot(user.id, tier, tokensReserved);
        console.error("AI call failed:", aiError);
        return res.status(500).json({ error: "Failed to get AI response", details: aiError.message });
      }

      // Phase 2: Finalize usage (log + adjust token balance for paid tier)
      try {
        await storage.finalizeAiUsage({
          userId: user.id,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          model: "claude-haiku-4-5",
          tier,
          tokensReserved,
        });
      } catch (finalizeError) {
        // If finalization fails, still return the AI response but log the error
        // The reservation stands (user consumed the slot) but actual usage wasn't logged
        console.error("Failed to finalize AI usage:", finalizeError);
        // Don't refund - the AI call succeeded, user consumed the service
      }

      res.json({
        response: result.response,
        usage: {
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
        },
        limits: user.tier === "free" ? {
          used: reserveResult.dailyUsed,
          limit: reserveResult.dailyLimit,
        } : undefined,
      });

    } catch (error: any) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to get AI response", details: error.message });
    }
  });

  // Update user AI profile
  app.patch("/api/ai/profile", authMiddleware, async (req, res) => {
    try {
      const { coreGoals, currentChallenges, interestsTags, communicationStyle } = req.body;
      
      const updated = await storage.updateUserAiProfile(req.userId!, {
        coreGoals,
        currentChallenges,
        interestsTags,
        communicationStyle,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update AI profile" });
    }
  });

  // ===== COURSE ROUTES =====

  // Get all published courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses({ published: true });
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  // Get courses created by current user
  app.get("/api/courses/my", authMiddleware, async (req, res) => {
    try {
      const courses = await storage.getCoursesByCreator(req.userId!);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch your courses" });
    }
  });

  // Get enrolled courses for current user
  app.get("/api/courses/enrolled", authMiddleware, async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsByUser(req.userId!);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enrolled courses" });
    }
  });

  // Get single course with lessons
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course" });
    }
  });

  // Create a course
  app.post("/api/courses", authMiddleware, async (req, res) => {
    try {
      const result = insertCourseSchema.safeParse({
        ...req.body,
        creatorId: req.userId,
      });
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0]?.message });
      }
      const course = await storage.createCourse(result.data);
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to create course" });
    }
  });

  // Update a course (owner only)
  app.patch("/api/courses/:id", authMiddleware, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      if (course.creatorId !== req.userId) {
        return res.status(403).json({ error: "Not authorized to edit this course" });
      }
      const updated = await storage.updateCourse(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  // Delete a course (owner only)
  app.delete("/api/courses/:id", authMiddleware, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      if (course.creatorId !== req.userId) {
        return res.status(403).json({ error: "Not authorized to delete this course" });
      }
      await storage.deleteCourse(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // ===== LESSON ROUTES =====

  // Get lessons for a course
  app.get("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessonsByCourse(req.params.courseId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  // Get single lesson
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lesson = await storage.getLesson(req.params.id);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });

  // Create a lesson (course owner only)
  app.post("/api/courses/:courseId/lessons", authMiddleware, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      if (course.creatorId !== req.userId) {
        return res.status(403).json({ error: "Not authorized to add lessons" });
      }
      const result = insertLessonSchema.safeParse({
        ...req.body,
        courseId: req.params.courseId,
      });
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0]?.message });
      }
      const lesson = await storage.createLesson(result.data);
      res.status(201).json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lesson" });
    }
  });

  // Update a lesson (course owner only)
  app.patch("/api/lessons/:id", authMiddleware, async (req, res) => {
    try {
      const lesson = await storage.getLesson(req.params.id);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      const course = await storage.getCourse(lesson.courseId);
      if (!course || course.creatorId !== req.userId) {
        return res.status(403).json({ error: "Not authorized to edit this lesson" });
      }
      const updated = await storage.updateLesson(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update lesson" });
    }
  });

  // Delete a lesson (course owner only)
  app.delete("/api/lessons/:id", authMiddleware, async (req, res) => {
    try {
      const lesson = await storage.getLesson(req.params.id);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      const course = await storage.getCourse(lesson.courseId);
      if (!course || course.creatorId !== req.userId) {
        return res.status(403).json({ error: "Not authorized to delete this lesson" });
      }
      await storage.deleteLesson(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lesson" });
    }
  });

  // Reorder lessons (course owner only)
  app.post("/api/courses/:courseId/lessons/reorder", authMiddleware, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      if (course.creatorId !== req.userId) {
        return res.status(403).json({ error: "Not authorized to reorder lessons" });
      }
      const { lessonIds } = req.body;
      if (!Array.isArray(lessonIds)) {
        return res.status(400).json({ error: "lessonIds must be an array" });
      }
      await storage.reorderLessons(req.params.courseId, lessonIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder lessons" });
    }
  });

  // ===== COURSE ENROLLMENT ROUTES =====

  // Enroll in a course
  app.post("/api/courses/:courseId/enroll", authMiddleware, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      // Check access type requirements
      if (course.accessType === "paid" && course.price > 0) {
        // For paid courses, check if payment was provided
        const { paymentProof } = req.body;
        if (!paymentProof) {
          return res.status(402).json({ 
            error: "Payment required",
            price: course.price,
            message: "This course requires payment. Please complete payment first."
          });
        }
        // TODO: Verify payment proof with Lightning backend
      }
      
      if (course.accessType === "community" && course.communityId) {
        // For community-locked courses, verify membership
        const membership = await storage.getMembership(req.userId!, course.communityId);
        if (!membership || membership.status !== "approved") {
          return res.status(403).json({
            error: "Community membership required",
            communityId: course.communityId,
            message: "You must be a member of the community to access this course."
          });
        }
      }
      
      const existing = await storage.getEnrollment(req.userId!, req.params.courseId);
      if (existing) {
        return res.status(400).json({ error: "Already enrolled in this course" });
      }
      const enrollment = await storage.enrollInCourse({
        userId: req.userId!,
        courseId: req.params.courseId,
      });
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ error: "Failed to enroll in course" });
    }
  });

  // Unenroll from a course
  app.delete("/api/courses/:courseId/enroll", authMiddleware, async (req, res) => {
    try {
      const success = await storage.unenrollFromCourse(req.userId!, req.params.courseId);
      if (!success) {
        return res.status(404).json({ error: "Enrollment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to unenroll" });
    }
  });

  // Get my enrollment for a course
  app.get("/api/courses/:courseId/enrollment", authMiddleware, async (req, res) => {
    try {
      const enrollment = await storage.getEnrollment(req.userId!, req.params.courseId);
      res.json(enrollment || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enrollment" });
    }
  });

  // Update enrollment progress (mark lesson complete)
  app.patch("/api/courses/:courseId/enrollment", authMiddleware, async (req, res) => {
    try {
      const enrollment = await storage.getEnrollment(req.userId!, req.params.courseId);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }
      
      // Validate and deduplicate completed lessons
      const { completedLessons, progress, completedAt } = req.body;
      
      if (completedLessons !== undefined) {
        if (!Array.isArray(completedLessons)) {
          return res.status(400).json({ error: "completedLessons must be an array" });
        }
        // Ensure no duplicates by using Set
        const uniqueLessons = [...new Set(completedLessons)];
        const course = await storage.getCourse(req.params.courseId);
        if (!course) {
          return res.status(404).json({ error: "Course not found" });
        }
        
        // Calculate accurate progress from unique lessons
        const totalLessons = course.totalLessons || 1;
        const calculatedProgress = Math.min(100, Math.round((uniqueLessons.length / totalLessons) * 100));
        
        const updated = await storage.updateEnrollmentProgress(enrollment.id, {
          completedLessons: uniqueLessons,
          progress: calculatedProgress,
          completedAt: calculatedProgress >= 100 ? new Date() : undefined,
        });
        return res.json(updated);
      }
      
      // Progress update only
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        return res.status(400).json({ error: "progress must be a number between 0 and 100" });
      }
      
      const updated = await storage.updateEnrollmentProgress(enrollment.id, {
        progress,
        completedAt: completedAt ? new Date(completedAt) : undefined,
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Get enrollees for a course (creator only)
  app.get("/api/courses/:courseId/enrollees", authMiddleware, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      if (course.creatorId !== req.userId) {
        return res.status(403).json({ error: "Not authorized to view enrollees" });
      }
      const enrollees = await storage.getEnrollmentsByCourse(req.params.courseId);
      res.json(enrollees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enrollees" });
    }
  });

  // ===== COURSE/LESSON COMMENT ROUTES =====

  // Get comments for a course
  app.get("/api/courses/:courseId/comments", async (req, res) => {
    try {
      const comments = await storage.getCourseComments(req.params.courseId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Add comment to a course
  app.post("/api/courses/:courseId/comments", authMiddleware, async (req, res) => {
    try {
      const result = insertCourseCommentSchema.safeParse({
        ...req.body,
        courseId: req.params.courseId,
        authorId: req.userId,
      });
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0]?.message });
      }
      const comment = await storage.createCourseComment(result.data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  // Get comments for a lesson
  app.get("/api/lessons/:lessonId/comments", async (req, res) => {
    try {
      const comments = await storage.getLessonComments(req.params.lessonId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Add comment to a lesson
  app.post("/api/lessons/:lessonId/comments", authMiddleware, async (req, res) => {
    try {
      const result = insertLessonCommentSchema.safeParse({
        ...req.body,
        lessonId: req.params.lessonId,
        authorId: req.userId,
      });
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0]?.message });
      }
      const comment = await storage.createLessonComment(result.data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  // ===== COMMUNITY ROUTES =====

  // Get all active communities
  app.get("/api/communities", async (req, res) => {
    try {
      const communities = await storage.getAllCommunities({ active: true });
      res.json(communities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });

  // Get communities I'm a member of
  app.get("/api/communities/my", authMiddleware, async (req, res) => {
    try {
      const memberships = await storage.getUserCommunities(req.userId!);
      res.json(memberships);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch your communities" });
    }
  });

  // Get communities I created
  app.get("/api/communities/created", authMiddleware, async (req, res) => {
    try {
      const communities = await storage.getCommunitiesByCreator(req.userId!);
      res.json(communities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch created communities" });
    }
  });

  // Get single community by ID
  app.get("/api/communities/:id", async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.id);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      res.json(community);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch community" });
    }
  });

  // Get community by slug
  app.get("/api/communities/slug/:slug", async (req, res) => {
    try {
      const community = await storage.getCommunityBySlug(req.params.slug);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      res.json(community);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch community" });
    }
  });

  // Create a community
  app.post("/api/communities", authMiddleware, async (req, res) => {
    try {
      const slug = req.body.slug || req.body.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const result = insertCommunitySchema.safeParse({
        ...req.body,
        slug,
        creatorId: req.userId,
      });
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0]?.message });
      }
      const community = await storage.createCommunity(result.data);
      res.status(201).json(community);
    } catch (error: any) {
      if (error.code === "23505") {
        return res.status(400).json({ error: "A community with this name already exists" });
      }
      res.status(500).json({ error: "Failed to create community" });
    }
  });

  // Update a community (creator only)
  app.patch("/api/communities/:id", authMiddleware, async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.id);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      if (community.creatorId !== req.userId) {
        return res.status(403).json({ error: "Not authorized to edit this community" });
      }
      const updated = await storage.updateCommunity(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update community" });
    }
  });

  // Delete a community (creator only)
  app.delete("/api/communities/:id", authMiddleware, async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.id);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      if (community.creatorId !== req.userId) {
        return res.status(403).json({ error: "Not authorized to delete this community" });
      }
      await storage.deleteCommunity(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete community" });
    }
  });

  // ===== COMMUNITY MEMBERSHIP ROUTES =====

  // Request to join a community
  app.post("/api/communities/:id/join", authMiddleware, async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.id);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      
      const existing = await storage.getMembership(req.userId!, req.params.id);
      if (existing) {
        if (existing.status === "approved") {
          return res.status(400).json({ error: "Already a member" });
        }
        if (existing.status === "pending") {
          return res.status(400).json({ error: "Join request already pending" });
        }
        if (existing.status === "banned") {
          return res.status(403).json({ error: "You are banned from this community" });
        }
      }

      const { approvalAnswers } = req.body;
      const status = community.accessType === "public" ? "approved" : "pending";
      
      const membership = await storage.requestMembership({
        userId: req.userId!,
        communityId: req.params.id,
        status,
        approvalAnswers,
      });

      // Auto-approve for public communities
      if (status === "approved") {
        await storage.approveMembership(membership.id);
      }

      res.status(201).json(membership);
    } catch (error) {
      res.status(500).json({ error: "Failed to join community" });
    }
  });

  // Leave a community
  app.delete("/api/communities/:id/membership", authMiddleware, async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.id);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      if (community.creatorId === req.userId) {
        return res.status(400).json({ error: "Creator cannot leave their own community" });
      }
      const success = await storage.removeMember(req.userId!, req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Membership not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to leave community" });
    }
  });

  // Get my membership status for a community
  app.get("/api/communities/:id/membership", authMiddleware, async (req, res) => {
    try {
      const membership = await storage.getMembership(req.userId!, req.params.id);
      res.json(membership || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch membership" });
    }
  });

  // Get community members (approved)
  app.get("/api/communities/:id/members", async (req, res) => {
    try {
      const members = await storage.getCommunityMembers(req.params.id, "approved");
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  // Get pending join requests (creator/admin only)
  app.get("/api/communities/:id/requests", authMiddleware, async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.id);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      
      const membership = await storage.getMembership(req.userId!, req.params.id);
      if (!membership || (membership.role !== "admin" && membership.role !== "moderator")) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const requests = await storage.getCommunityMembers(req.params.id, "pending");
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch join requests" });
    }
  });

  // Approve a join request (admin/moderator only)
  app.post("/api/communities/:communityId/members/:memberId/approve", authMiddleware, async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.communityId);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      
      const myMembership = await storage.getMembership(req.userId!, req.params.communityId);
      if (!myMembership || (myMembership.role !== "admin" && myMembership.role !== "moderator")) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const updated = await storage.approveMembership(req.params.memberId);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve member" });
    }
  });

  // Reject a join request (admin/moderator only)
  app.post("/api/communities/:communityId/members/:memberId/reject", authMiddleware, async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.communityId);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      
      const myMembership = await storage.getMembership(req.userId!, req.params.communityId);
      if (!myMembership || (myMembership.role !== "admin" && myMembership.role !== "moderator")) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const updated = await storage.rejectMembership(req.params.memberId);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject member" });
    }
  });

  // Remove a member (admin only)
  app.delete("/api/communities/:communityId/members/:userId", authMiddleware, async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.communityId);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      
      const myMembership = await storage.getMembership(req.userId!, req.params.communityId);
      if (!myMembership || myMembership.role !== "admin") {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      if (req.params.userId === community.creatorId) {
        return res.status(400).json({ error: "Cannot remove the community creator" });
      }
      
      const success = await storage.removeMember(req.params.userId, req.params.communityId);
      if (!success) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  // ===== MEMBERSHIP ROUTES (by membership ID) =====

  // Approve a join request by membership ID
  app.post("/api/memberships/:membershipId/approve", authMiddleware, async (req, res) => {
    try {
      const membership = await storage.getMembershipById(req.params.membershipId);
      if (!membership) {
        return res.status(404).json({ error: "Membership not found" });
      }
      
      const myMembership = await storage.getMembership(req.userId!, membership.communityId);
      if (!myMembership || (myMembership.role !== "admin" && myMembership.role !== "moderator")) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const updated = await storage.approveMembership(req.params.membershipId);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve member" });
    }
  });

  // Reject a join request by membership ID
  app.post("/api/memberships/:membershipId/reject", authMiddleware, async (req, res) => {
    try {
      const membership = await storage.getMembershipById(req.params.membershipId);
      if (!membership) {
        return res.status(404).json({ error: "Membership not found" });
      }
      
      const myMembership = await storage.getMembership(req.userId!, membership.communityId);
      if (!myMembership || (myMembership.role !== "admin" && myMembership.role !== "moderator")) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const updated = await storage.rejectMembership(req.params.membershipId);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject member" });
    }
  });

  // Update member role by membership ID
  app.patch("/api/memberships/:membershipId/role", authMiddleware, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || !["member", "moderator", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      const membership = await storage.getMembershipById(req.params.membershipId);
      if (!membership) {
        return res.status(404).json({ error: "Membership not found" });
      }
      
      const myMembership = await storage.getMembership(req.userId!, membership.communityId);
      if (!myMembership || myMembership.role !== "admin") {
        return res.status(403).json({ error: "Only admins can change roles" });
      }
      
      const updated = await storage.updateMemberRole(req.params.membershipId, role);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  // Remove member by membership ID
  app.delete("/api/memberships/:membershipId", authMiddleware, async (req, res) => {
    try {
      const membership = await storage.getMembershipById(req.params.membershipId);
      if (!membership) {
        return res.status(404).json({ error: "Membership not found" });
      }
      
      const community = await storage.getCommunity(membership.communityId);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      
      const myMembership = await storage.getMembership(req.userId!, membership.communityId);
      if (!myMembership || myMembership.role !== "admin") {
        return res.status(403).json({ error: "Only admins can remove members" });
      }
      
      if (membership.userId === community.creatorId) {
        return res.status(400).json({ error: "Cannot remove the community creator" });
      }
      
      const success = await storage.deleteMembership(req.params.membershipId);
      if (!success) {
        return res.status(404).json({ error: "Failed to remove member" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  // ===== COMMUNITY POST ROUTES =====

  // Get posts in a community (members only for private communities)
  app.get("/api/communities/:id/posts", optionalAuth, async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.id);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      
      // For non-public communities, check membership
      if (community.accessType !== "public") {
        if (!req.userId) {
          return res.status(401).json({ error: "Authentication required" });
        }
        const membership = await storage.getMembership(req.userId, req.params.id);
        if (!membership || membership.status !== "approved") {
          return res.status(403).json({ error: "Not a member of this community" });
        }
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const posts = await storage.getCommunityPosts(req.params.id, limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Create a post in a community (members only)
  app.post("/api/communities/:id/posts", authMiddleware, async (req, res) => {
    try {
      const membership = await storage.getMembership(req.userId!, req.params.id);
      if (!membership || membership.status !== "approved") {
        return res.status(403).json({ error: "Not a member of this community" });
      }
      
      const result = insertCommunityPostSchema.safeParse({
        ...req.body,
        communityId: req.params.id,
        authorId: req.userId,
      });
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0]?.message });
      }
      
      const post = await storage.createCommunityPost(result.data);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Like a community post
  app.post("/api/community-posts/:id/like", authMiddleware, async (req, res) => {
    try {
      const updated = await storage.likeCommunityPost(req.params.id);
      if (!updated) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to like post" });
    }
  });

  // Zap a community post
  app.post("/api/community-posts/:id/zap", authMiddleware, async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || amount < 1) {
        return res.status(400).json({ error: "Invalid zap amount" });
      }
      const updated = await storage.zapCommunityPost(req.params.id, amount);
      if (!updated) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to zap post" });
    }
  });

  return httpServer;
}
