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

  // Create experiment (admin only - TODO: add admin check)
  app.post("/api/experiments", authMiddleware, async (req, res) => {
    try {
      const validated = insertExperimentSchema.parse(req.body);
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

  return httpServer;
}
