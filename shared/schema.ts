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

// Experiments (can be user-created or system)
export const experiments = pgTable("experiments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "set null" }), // null = system experiment
  title: text("title").notNull(),
  guide: text("guide").notNull(),
  description: text("description"),
  image: text("image"),
  category: text("category").notNull(),
  loveCodeArea: text("love_code_area"), // god-love, romance, family, etc.
  steps: jsonb("steps").$type<{ order: number; title: string; prompt: string; }[]>().default([]),
  totalDiscoveries: integer("total_discoveries").default(0).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  accessType: text("access_type").default("public").notNull(), // public, community, paid
  communityId: varchar("community_id"), // If access_type is 'community'
  price: integer("price").default(0).notNull(), // In sats
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertExperimentSchema = createInsertSchema(experiments).omit({
  id: true,
  totalDiscoveries: true,
  createdAt: true,
  updatedAt: true,
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

// Courses (user-created learning content)
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  loveCodeArea: text("love_code_area"), // god-love, romance, family, etc.
  isPublished: boolean("is_published").default(false).notNull(),
  accessType: text("access_type").default("public").notNull(), // public, community, paid
  communityId: varchar("community_id"), // If access_type is 'community'
  price: integer("price").default(0).notNull(), // In sats, if access_type is 'paid'
  totalEnrollments: integer("total_enrollments").default(0).notNull(),
  totalLessons: integer("total_lessons").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  totalEnrollments: true,
  totalLessons: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Course Lessons
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"), // Rich text/markdown content
  videoUrl: text("video_url"),
  order: integer("order").default(0).notNull(),
  duration: integer("duration"), // In minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

// Course Enrollments
export const courseEnrollments = pgTable("course_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  progress: integer("progress").default(0).notNull(), // 0-100
  completedLessons: text("completed_lessons").array().default(sql`ARRAY[]::text[]`).notNull(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments).omit({
  id: true,
  progress: true,
  completedLessons: true,
  lastAccessedAt: true,
  enrolledAt: true,
  completedAt: true,
});

export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;

// Lesson Comments (per-lesson discussion)
export const lessonComments = pgTable("lesson_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentId: varchar("parent_id"), // For replies
  likes: integer("likes").default(0).notNull(),
  zaps: integer("zaps").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLessonCommentSchema = createInsertSchema(lessonComments).omit({
  id: true,
  likes: true,
  zaps: true,
  createdAt: true,
});

export type InsertLessonComment = z.infer<typeof insertLessonCommentSchema>;
export type LessonComment = typeof lessonComments.$inferSelect;

// Course Comments (overall course discussion)
export const courseComments = pgTable("course_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentId: varchar("parent_id"), // For replies
  likes: integer("likes").default(0).notNull(),
  zaps: integer("zaps").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseCommentSchema = createInsertSchema(courseComments).omit({
  id: true,
  likes: true,
  zaps: true,
  createdAt: true,
});

export type InsertCourseComment = z.infer<typeof insertCourseCommentSchema>;
export type CourseComment = typeof courseComments.$inferSelect;

// Communities (multi-tenant groups)
export const communities = pgTable("communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  coverImage: text("cover_image"),
  accessType: text("access_type").default("public").notNull(), // public, approval, paid
  price: integer("price").default(0).notNull(), // In sats, if access_type is 'paid'
  approvalQuestions: jsonb("approval_questions").$type<string[]>().default([]),
  memberCount: integer("member_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  memberCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Community = typeof communities.$inferSelect;

// Community Memberships
export const communityMemberships = pgTable("community_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  communityId: varchar("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(), // admin, moderator, member
  status: text("status").default("pending").notNull(), // pending, approved, rejected, banned
  approvalAnswers: jsonb("approval_answers").$type<string[]>().default([]),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityMembershipSchema = createInsertSchema(communityMemberships).omit({
  id: true,
  joinedAt: true,
  createdAt: true,
});

export type InsertCommunityMembership = z.infer<typeof insertCommunityMembershipSchema>;
export type CommunityMembership = typeof communityMemberships.$inferSelect;

// Community Posts (internal feed)
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  image: text("image"),
  likes: integer("likes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  zaps: integer("zaps").default(0).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likes: true,
  comments: true,
  zaps: true,
  createdAt: true,
});

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

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

// Sats Rewards - tracks all sats earned/spent
export const satsRewards = pgTable("sats_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // journal_entry, experiment_complete, streak_7, streak_30, etc.
  amount: integer("amount").notNull(), // positive = earned, negative = spent
  description: text("description"),
  relatedId: varchar("related_id"), // optional: journal entry ID, experiment ID, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSatsRewardSchema = createInsertSchema(satsRewards).omit({
  id: true,
  createdAt: true,
});

export type InsertSatsReward = z.infer<typeof insertSatsRewardSchema>;
export type SatsReward = typeof satsRewards.$inferSelect;

// Reward action types with amounts
export const REWARD_ACTIONS = {
  journal_entry: { amount: 21, description: "Completed Daily LOVE Practice" },
  experiment_step: { amount: 11, description: "Completed experiment step" },
  experiment_complete: { amount: 111, description: "Completed experiment" },
  dream_created: { amount: 11, description: "Set a Big Dream" },
  streak_7: { amount: 77, description: "7-day streak bonus" },
  streak_30: { amount: 333, description: "30-day streak bonus" },
  streak_100: { amount: 1111, description: "100-day streak bonus" },
  first_journal: { amount: 100, description: "First journal entry!" },
  profile_complete: { amount: 50, description: "Completed profile" },
} as const;
