import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ===== JOURNAL ENTRIES (Daily LOVE Practice) =====
  
  // Get all journal entries for a user
  app.get("/api/journal/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const entries = await storage.getJournalEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  // Get journal entry for specific date
  app.get("/api/journal/:userId/date/:date", async (req, res) => {
    try {
      const { userId, date } = req.params;
      const entry = await storage.getJournalEntryByDate(userId, new Date(date));
      res.json(entry || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entry" });
    }
  });

  // Create journal entry
  app.post("/api/journal", async (req, res) => {
    try {
      const validated = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(validated);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid journal entry data" });
    }
  });

  // Update journal entry
  app.patch("/api/journal/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const entry = await storage.updateJournalEntry(id, req.body);
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update journal entry" });
    }
  });

  // Delete journal entry
  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteJournalEntry(id);
      if (!success) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete journal entry" });
    }
  });

  // ===== DREAMS =====
  
  // Get all dreams for a user
  app.get("/api/dreams/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const dreams = await storage.getDreamsByUser(userId);
      res.json(dreams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dreams" });
    }
  });

  // Get dream for specific area
  app.get("/api/dreams/:userId/area/:areaId", async (req, res) => {
    try {
      const { userId, areaId } = req.params;
      const dream = await storage.getDreamByArea(userId, areaId);
      res.json(dream || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dream" });
    }
  });

  // Create or update dream
  app.post("/api/dreams", async (req, res) => {
    try {
      const validated = insertDreamSchema.parse(req.body);
      
      // Check if dream exists for this area
      const existing = await storage.getDreamByArea(validated.userId, validated.areaId);
      
      if (existing) {
        // Update existing dream
        const updated = await storage.updateDream(existing.id, { dream: validated.dream });
        res.json(updated);
      } else {
        // Create new dream
        const created = await storage.createDream(validated);
        res.status(201).json(created);
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid dream data" });
    }
  });

  // ===== AREA PROGRESS =====
  
  // Get area progress for a user
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getAreaProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch area progress" });
    }
  });

  // Update area progress
  app.post("/api/progress", async (req, res) => {
    try {
      const validated = insertAreaProgressSchema.parse(req.body);
      const progress = await storage.upsertAreaProgress(validated);
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid progress data" });
    }
  });

  // ===== EXPERIMENTS =====
  
  // Get all experiments
  app.get("/api/experiments", async (req, res) => {
    try {
      const experiments = await storage.getAllExperiments();
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch experiments" });
    }
  });

  // Create experiment (admin)
  app.post("/api/experiments", async (req, res) => {
    try {
      const validated = insertExperimentSchema.parse(req.body);
      const experiment = await storage.createExperiment(validated);
      res.status(201).json(experiment);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid experiment data" });
    }
  });

  // Get user's enrolled experiments
  app.get("/api/user-experiments/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const experiments = await storage.getUserExperiments(userId);
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user experiments" });
    }
  });

  // Enroll user in experiment
  app.post("/api/user-experiments", async (req, res) => {
    try {
      const validated = insertUserExperimentSchema.parse(req.body);
      const userExperiment = await storage.enrollUserInExperiment(validated);
      res.status(201).json(userExperiment);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid enrollment data" });
    }
  });

  // Update experiment progress
  app.patch("/api/user-experiments/:id", async (req, res) => {
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
  
  // Get experiment notes
  app.get("/api/experiment-notes/:userId/:experimentId", async (req, res) => {
    try {
      const { userId, experimentId } = req.params;
      const notes = await storage.getExperimentNotes(userId, experimentId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch experiment notes" });
    }
  });

  // Create experiment note
  app.post("/api/experiment-notes", async (req, res) => {
    try {
      const validated = insertExperimentNoteSchema.parse(req.body);
      const note = await storage.createExperimentNote(validated);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid note data" });
    }
  });

  // Update experiment note
  app.patch("/api/experiment-notes/:id", async (req, res) => {
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
  app.delete("/api/experiment-notes/:id", async (req, res) => {
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
  
  // Get discovery notes
  app.get("/api/discovery-notes/:userId/:experimentId", async (req, res) => {
    try {
      const { userId, experimentId } = req.params;
      const notes = await storage.getDiscoveryNotes(userId, experimentId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch discovery notes" });
    }
  });

  // Create discovery note
  app.post("/api/discovery-notes", async (req, res) => {
    try {
      const validated = insertDiscoveryNoteSchema.parse(req.body);
      const note = await storage.createDiscoveryNote(validated);
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid note data" });
    }
  });

  // Update discovery note
  app.patch("/api/discovery-notes/:id", async (req, res) => {
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
  app.delete("/api/discovery-notes/:id", async (req, res) => {
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
  
  // Get recent posts
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const posts = await storage.getRecentPosts(limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Create post
  app.post("/api/posts", async (req, res) => {
    try {
      const validated = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validated);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid post data" });
    }
  });

  // Like post
  app.post("/api/posts/:id/like", async (req, res) => {
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

  // Zap post
  app.post("/api/posts/:id/zap", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid zap amount" });
      }
      
      const post = await storage.zapPost(id, amount);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to zap post" });
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

  return httpServer;
}
