import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nostrPubkey: text("nostr_pubkey").unique(),
  username: text("username").notNull().unique(),
  password: text("password"),
  name: text("name").notNull(),
  handle: text("handle").notNull().unique(),
  email: text("email"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  avatar: text("avatar"),
  nip05: text("nip05"),
  lud16: text("lud16"),
  sats: integer("sats").default(0).notNull(),
  satsGiven: integer("sats_given").default(0).notNull(),
  satsReceived: integer("sats_received").default(0).notNull(),
  level: text("level").default("Initiate").notNull(),
  streak: integer("streak").default(0).notNull(),
  walletBalance: integer("wallet_balance").default(0).notNull(),
  badges: text("badges").array().default(sql`ARRAY[]::text[]`).notNull(),
  lookingForBuddy: boolean("looking_for_buddy").default(false).notNull(),
  buddyDescription: text("buddy_description"),
  labInterests: text("lab_interests").array().default(sql`ARRAY[]::text[]`).notNull(),
  trialStartedAt: timestamp("trial_started_at"),
  // AI Profile fields for Magic Mentor personalization
  coreGoals: text("core_goals"),
  currentChallenges: text("current_challenges"),
  interestsTags: text("interests_tags").array().default(sql`ARRAY[]::text[]`).notNull(),
  communicationStyle: text("communication_style").default("warm"),
  // Billing/tier fields
  tier: text("tier").default("free").notNull(), // free, paid, byok
  tokenBalance: integer("token_balance").default(0).notNull(),
  dailyMessagesUsed: integer("daily_messages_used").default(0).notNull(),
  dailyMessagesResetAt: timestamp("daily_messages_reset_at"),
  userApiKey: text("user_api_key"), // For BYOK users
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  nostrPubkey: true,
  username: true,
  name: true,
  handle: true,
  email: true,
  avatar: true,
  nip05: true,
  lud16: true,
});

export const updateEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Daily LOVE Practice entries
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  vibeRating: integer("vibe_rating").notNull(), // 1-11 scale
  gratitude: text("gratitude"),
  gratitudePhoto: text("gratitude_photo"), // URL to uploaded photo
  lesson: text("lesson"),
  blessing: text("blessing"),
  goal: text("goal"),
  reflection: text("reflection"),
  isPrivate: boolean("is_private").default(true).notNull(),
  sharedClubs: text("shared_clubs").array().default(sql`ARRAY[]::text[]`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

// Big Dreams
export const dreams = pgTable("dreams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  areaId: text("area_id").notNull(), // god-love, romance, family, etc.
  dream: text("dream").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDreamSchema = createInsertSchema(dreams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDream = z.infer<typeof insertDreamSchema>;
export type Dream = typeof dreams.$inferSelect;

// User Area Progress (for EQ visualizer)
export const areaProgress = pgTable("area_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  areaId: text("area_id").notNull(), // god-love, romance, family, etc.
  progress: integer("progress").default(0).notNull(), // 0-100
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAreaProgressSchema = createInsertSchema(areaProgress).omit({
  id: true,
  updatedAt: true,
});

export type InsertAreaProgress = z.infer<typeof insertAreaProgressSchema>;
export type AreaProgress = typeof areaProgress.$inferSelect;

// Experiments
export const experiments = pgTable("experiments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  guide: text("guide").notNull(),
  image: text("image"),
  category: text("category").notNull(),
  totalDiscoveries: integer("total_discoveries").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExperimentSchema = createInsertSchema(experiments).omit({
  id: true,
  createdAt: true,
});

export type InsertExperiment = z.infer<typeof insertExperimentSchema>;
export type Experiment = typeof experiments.$inferSelect;

// User Experiment Progress
export const userExperiments = pgTable("user_experiments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  experimentId: varchar("experiment_id").notNull().references(() => experiments.id, { onDelete: "cascade" }),
  completedDiscoveries: integer("completed_discoveries").default(0).notNull(),
  progress: integer("progress").default(0).notNull(), // 0-100
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

export const insertUserExperimentSchema = createInsertSchema(userExperiments).omit({
  id: true,
  enrolledAt: true,
});

export type InsertUserExperiment = z.infer<typeof insertUserExperimentSchema>;
export type UserExperiment = typeof userExperiments.$inferSelect;

// Experiment Notes (user's personal notes)
export const experimentNotes = pgTable("experiment_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  experimentId: varchar("experiment_id").notNull().references(() => experiments.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").default(true).notNull(),
  sharedClubs: text("shared_clubs").array().default(sql`ARRAY[]::text[]`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertExperimentNoteSchema = createInsertSchema(experimentNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertExperimentNote = z.infer<typeof insertExperimentNoteSchema>;
export type ExperimentNote = typeof experimentNotes.$inferSelect;

// Discovery Notes (tied to experiment lessons)
export const discoveryNotes = pgTable("discovery_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  experimentId: varchar("experiment_id").notNull().references(() => experiments.id, { onDelete: "cascade" }),
  discoveryNumber: integer("discovery_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").default(true).notNull(),
  sharedClubs: text("shared_clubs").array().default(sql`ARRAY[]::text[]`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDiscoveryNoteSchema = createInsertSchema(discoveryNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDiscoveryNote = z.infer<typeof insertDiscoveryNoteSchema>;
export type DiscoveryNote = typeof discoveryNotes.$inferSelect;

// Events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  host: text("host").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(),
  recurrence: text("recurrence"),
  attendees: integer("attendees").default(0).notNull(),
  image: text("image"),
  description: text("description"),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Feed Posts
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  image: text("image"),
  likes: integer("likes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  zaps: integer("zaps").default(0).notNull(), // sats
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likes: true,
  comments: true,
  zaps: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Clubs
export const clubs = pgTable("clubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // icon name
  color: text("color").notNull(), // CSS color class
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClubSchema = createInsertSchema(clubs).omit({
  id: true,
  createdAt: true,
});

export type InsertClub = z.infer<typeof insertClubSchema>;
export type Club = typeof clubs.$inferSelect;

// Zaps (tracking P2P Lightning transactions within community)
export const zaps = pgTable("zaps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(),
  comment: text("comment"),
  paymentHash: text("payment_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertZapSchema = createInsertSchema(zaps).omit({
  id: true,
  createdAt: true,
});

export type InsertZap = z.infer<typeof insertZapSchema>;
export type Zap = typeof zaps.$inferSelect;

// AI Usage Logs (tracking token usage for billing)
export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiUsageLogSchema = createInsertSchema(aiUsageLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAiUsageLog = z.infer<typeof insertAiUsageLogSchema>;
export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
