import {
  users, journalEntries, dreams, areaProgress, experiments, userExperiments,
  experimentNotes, discoveryNotes, events, posts, clubs, zaps, aiUsageLogs,
  courses, lessons, courseEnrollments, lessonComments, courseComments,
  communities, communityMemberships, communityPosts,
  type User, type InsertUser,
  type JournalEntry, type InsertJournalEntry,
  type Dream, type InsertDream,
  type AreaProgress, type InsertAreaProgress,
  type Experiment, type InsertExperiment,
  type UserExperiment, type InsertUserExperiment,
  type ExperimentNote, type InsertExperimentNote,
  type DiscoveryNote, type InsertDiscoveryNote,
  type Event, type InsertEvent,
  type Post, type InsertPost,
  type Club, type InsertClub,
  type Zap, type InsertZap,
  type Course, type InsertCourse,
  type Lesson, type InsertLesson,
  type CourseEnrollment, type InsertCourseEnrollment,
  type LessonComment, type InsertLessonComment,
  type CourseComment, type InsertCourseComment,
  type Community, type InsertCommunity,
  type CommunityMembership, type InsertCommunityMembership,
  type CommunityPost, type InsertCommunityPost,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByHandle(handle: string): Promise<User | undefined>;
  getUserByNostrPubkey(pubkey: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createOrUpdateUserByPubkey(pubkey: string, data: Partial<InsertUser>): Promise<User>;
  updateUserEmail(userId: string, email: string): Promise<User>;
  updateUserStats(userId: string, updates: Partial<Pick<User, 'sats' | 'streak' | 'level' | 'walletBalance' | 'badges'>>): Promise<User | undefined>;
  getLeaderboard(limit?: number): Promise<User[]>;

  // Journal Entries (Daily LOVE Practice)
  getJournalEntries(userId: string, limit?: number): Promise<JournalEntry[]>;
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  getJournalEntryByDate(userId: string, date: Date): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: string, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: string): Promise<boolean>;

  // Dreams
  getDreamsByUser(userId: string): Promise<Dream[]>;
  getDreamByArea(userId: string, areaId: string): Promise<Dream | undefined>;
  createDream(dream: InsertDream): Promise<Dream>;
  updateDream(id: string, dream: Partial<InsertDream>): Promise<Dream | undefined>;
  deleteDream(id: string): Promise<boolean>;

  // Area Progress
  getAreaProgress(userId: string): Promise<AreaProgress[]>;
  getAreaProgressByArea(userId: string, areaId: string): Promise<AreaProgress | undefined>;
  upsertAreaProgress(progress: InsertAreaProgress): Promise<AreaProgress>;

  // Experiments
  getAllExperiments(): Promise<Experiment[]>;
  getExperiment(id: string): Promise<Experiment | undefined>;
  createExperiment(experiment: InsertExperiment): Promise<Experiment>;
  getExperimentsByCreator(creatorId: string): Promise<Experiment[]>;
  getExperimentParticipants(experimentId: string): Promise<(UserExperiment & { user: { id: string; nostrPubkey: string | null; displayName: string | null; } })[]>;

  // User Experiments
  getUserExperiments(userId: string): Promise<(UserExperiment & { experiment: Experiment })[]>;
  enrollUserInExperiment(userExperiment: InsertUserExperiment): Promise<UserExperiment>;
  updateUserExperimentProgress(id: string, updates: Partial<Pick<UserExperiment, 'completedDiscoveries' | 'progress'>>): Promise<UserExperiment | undefined>;

  // Experiment Notes
  getExperimentNotes(userId: string, experimentId: string): Promise<ExperimentNote[]>;
  createExperimentNote(note: InsertExperimentNote): Promise<ExperimentNote>;
  updateExperimentNote(id: string, note: Partial<InsertExperimentNote>): Promise<ExperimentNote | undefined>;
  deleteExperimentNote(id: string): Promise<boolean>;

  // Discovery Notes
  getDiscoveryNotes(userId: string, experimentId: string): Promise<DiscoveryNote[]>;
  createDiscoveryNote(note: InsertDiscoveryNote): Promise<DiscoveryNote>;
  updateDiscoveryNote(id: string, note: Partial<InsertDiscoveryNote>): Promise<DiscoveryNote | undefined>;
  deleteDiscoveryNote(id: string): Promise<boolean>;

  // Events
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Posts
  getRecentPosts(limit?: number): Promise<(Post & { author: User })[]>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(postId: string): Promise<Post | undefined>;
  zapPost(postId: string, amount: number): Promise<Post | undefined>;

  // Clubs
  getAllClubs(): Promise<Club[]>;
  createClub(club: InsertClub): Promise<Club>;

  // Zaps
  createZap(zap: InsertZap): Promise<Zap>;
  getZapsByUser(userId: string, type: 'sent' | 'received', limit?: number): Promise<(Zap & { sender?: User; receiver?: User; post?: Post })[]>;
  getUserZapStats(userId: string): Promise<{ satsGiven: number; satsReceived: number }>;

  // AI Usage
  logAiUsage(log: { userId: string; inputTokens: number; outputTokens: number; model: string }): Promise<void>;
  updateUserDailyMessages(userId: string, count: number, resetAt?: Date): Promise<void>;
  deductUserTokens(userId: string, tokens: number): Promise<void>;
  updateUserAiProfile(userId: string, profile: { coreGoals?: string; currentChallenges?: string; interestsTags?: string[]; communicationStyle?: string }): Promise<User | undefined>;
  updateUserTier(userId: string, tier: string): Promise<User | undefined>;
  updateUserApiKey(userId: string, apiKey: string | null): Promise<User | undefined>;
  
  // Phase 1: Reserve a slot atomically - checks limits and increments counter BEFORE AI call
  // For paid tier, reserves estimated tokens (deducted upfront)
  reserveAiUsageSlot(params: {
    userId: string;
    tier: string;
    freeTierLimit: number;
    estimatedTokens?: number; // For paid tier, reserve this many tokens
  }): Promise<{ success: true; dailyUsed: number; dailyLimit: number; tokensReserved?: number } | { success: false; error: string; errorCode: number }>;
  
  // Phase 2: Finalize usage - log actual tokens and adjust balance for paid tier
  finalizeAiUsage(params: {
    userId: string;
    inputTokens: number;
    outputTokens: number;
    model: string;
    tier: string;
    tokensReserved?: number; // For paid tier, the amount reserved in phase 1
  }): Promise<void>;

  // Rollback: Release a reserved slot if AI call fails
  releaseAiUsageSlot(userId: string, tier: string, tokensReserved?: number): Promise<void>;

  // Creator Analytics
  getCreatorAnalytics(creatorId: string): Promise<{
    totalCourseEnrollments: number;
    totalExperimentEnrollments: number;
  }>;

  // Courses
  getAllCourses(options?: { published?: boolean }): Promise<(Course & { creator: User })[]>;
  getCoursesByCreator(creatorId: string): Promise<Course[]>;
  getCourse(id: string): Promise<(Course & { creator: User; lessons: Lesson[] }) | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;

  // Lessons
  getLessonsByCourse(courseId: string): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson | undefined>;
  deleteLesson(id: string): Promise<boolean>;
  reorderLessons(courseId: string, lessonIds: string[]): Promise<void>;

  // Course Enrollments
  getEnrollmentsByCourse(courseId: string): Promise<(CourseEnrollment & { user: User })[]>;
  getEnrollmentsByUser(userId: string): Promise<(CourseEnrollment & { course: Course })[]>;
  getEnrollment(userId: string, courseId: string): Promise<CourseEnrollment | undefined>;
  enrollInCourse(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment>;
  updateEnrollmentProgress(id: string, updates: { progress?: number; completedLessons?: string[]; completedAt?: Date }): Promise<CourseEnrollment | undefined>;
  unenrollFromCourse(userId: string, courseId: string): Promise<boolean>;

  // Course & Lesson Comments
  getCourseComments(courseId: string): Promise<(CourseComment & { author: User })[]>;
  createCourseComment(comment: InsertCourseComment): Promise<CourseComment>;
  getLessonComments(lessonId: string): Promise<(LessonComment & { author: User })[]>;
  createLessonComment(comment: InsertLessonComment): Promise<LessonComment>;

  // Communities
  getAllCommunities(options?: { active?: boolean }): Promise<(Community & { creator: User })[]>;
  getCommunitiesByCreator(creatorId: string): Promise<Community[]>;
  getCommunity(id: string): Promise<(Community & { creator: User }) | undefined>;
  getCommunityBySlug(slug: string): Promise<(Community & { creator: User }) | undefined>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  updateCommunity(id: string, community: Partial<InsertCommunity>): Promise<Community | undefined>;
  deleteCommunity(id: string): Promise<boolean>;

  // Community Memberships
  getCommunityMembers(communityId: string, status?: string): Promise<(CommunityMembership & { user: User })[]>;
  getUserCommunities(userId: string): Promise<(CommunityMembership & { community: Community })[]>;
  getMembership(userId: string, communityId: string): Promise<CommunityMembership | undefined>;
  getMembershipById(id: string): Promise<CommunityMembership | undefined>;
  requestMembership(membership: InsertCommunityMembership): Promise<CommunityMembership>;
  updateMembership(id: string, updates: Partial<InsertCommunityMembership>): Promise<CommunityMembership | undefined>;
  approveMembership(id: string): Promise<CommunityMembership | undefined>;
  rejectMembership(id: string): Promise<CommunityMembership | undefined>;
  updateMemberRole(id: string, role: string): Promise<CommunityMembership | undefined>;
  deleteMembership(id: string): Promise<boolean>;
  removeMember(userId: string, communityId: string): Promise<boolean>;

  // Community Posts
  getCommunityPosts(communityId: string, limit?: number): Promise<(CommunityPost & { author: User })[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  likeCommunityPost(postId: string): Promise<CommunityPost | undefined>;
  zapCommunityPost(postId: string, amount: number): Promise<CommunityPost | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByHandle(handle: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.handle, handle));
    return user || undefined;
  }

  async getUserByNostrPubkey(pubkey: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.nostrPubkey, pubkey));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createOrUpdateUserByPubkey(pubkey: string, data: Partial<InsertUser>): Promise<User> {
    const existing = await this.getUserByNostrPubkey(pubkey);
    
    if (existing) {
      const [updated] = await db.update(users)
        .set({ ...data, nostrPubkey: pubkey })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    } else {
      const shortPubkey = pubkey.slice(0, 8);
      const [created] = await db.insert(users).values({
        nostrPubkey: pubkey,
        username: data.username || `nostr_${shortPubkey}`,
        name: data.name || `Nostr User`,
        handle: data.handle || `@${shortPubkey}`,
        avatar: data.avatar,
        nip05: data.nip05,
        lud16: data.lud16,
      }).returning();
      return created;
    }
  }

  async updateUserEmail(userId: string, email: string): Promise<User> {
    const now = new Date();
    const [user] = await db.update(users)
      .set({ 
        email, 
        trialStartedAt: sql`COALESCE(${users.trialStartedAt}, ${now})` 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStats(userId: string, updates: Partial<Pick<User, 'sats' | 'streak' | 'level' | 'walletBalance' | 'badges'>>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
    return user || undefined;
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.sats), desc(users.streak)).limit(limit);
  }

  // Journal Entries
  async getJournalEntries(userId: string, limit: number = 50): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.date))
      .limit(limit);
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async getJournalEntryByDate(userId: string, date: Date): Promise<JournalEntry | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [entry] = await db.select().from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          sql`${journalEntries.date} >= ${startOfDay} AND ${journalEntries.date} <= ${endOfDay}`
        )
      );
    return entry || undefined;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [created] = await db.insert(journalEntries).values(entry).returning();
    return created;
  }

  async updateJournalEntry(id: string, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [updated] = await db.update(journalEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteJournalEntry(id: string): Promise<boolean> {
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Dreams
  async getDreamsByUser(userId: string): Promise<Dream[]> {
    return await db.select().from(dreams).where(eq(dreams.userId, userId));
  }

  async getDreamByArea(userId: string, areaId: string): Promise<Dream | undefined> {
    const [dream] = await db.select().from(dreams)
      .where(and(eq(dreams.userId, userId), eq(dreams.areaId, areaId)));
    return dream || undefined;
  }

  async createDream(dream: InsertDream): Promise<Dream> {
    const [created] = await db.insert(dreams).values(dream).returning();
    return created;
  }

  async updateDream(id: string, dream: Partial<InsertDream>): Promise<Dream | undefined> {
    const [updated] = await db.update(dreams)
      .set({ ...dream, updatedAt: new Date() })
      .where(eq(dreams.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDream(id: string): Promise<boolean> {
    const result = await db.delete(dreams).where(eq(dreams.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Area Progress
  async getAreaProgress(userId: string): Promise<AreaProgress[]> {
    return await db.select().from(areaProgress).where(eq(areaProgress.userId, userId));
  }

  async getAreaProgressByArea(userId: string, areaId: string): Promise<AreaProgress | undefined> {
    const [progress] = await db.select().from(areaProgress)
      .where(and(eq(areaProgress.userId, userId), eq(areaProgress.areaId, areaId)));
    return progress || undefined;
  }

  async upsertAreaProgress(progress: InsertAreaProgress): Promise<AreaProgress> {
    const existing = await this.getAreaProgressByArea(progress.userId, progress.areaId);
    
    if (existing) {
      const [updated] = await db.update(areaProgress)
        .set({ progress: progress.progress, updatedAt: new Date() })
        .where(eq(areaProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(areaProgress).values(progress).returning();
      return created;
    }
  }

  // Experiments
  async getAllExperiments(): Promise<Experiment[]> {
    return await db.select().from(experiments).orderBy(desc(experiments.createdAt));
  }

  async getExperiment(id: string): Promise<Experiment | undefined> {
    const [experiment] = await db.select().from(experiments).where(eq(experiments.id, id));
    return experiment || undefined;
  }

  async createExperiment(experiment: InsertExperiment): Promise<Experiment> {
    const [created] = await db.insert(experiments).values(experiment).returning();
    return created;
  }

  async getExperimentsByCreator(creatorId: string): Promise<Experiment[]> {
    return db.select().from(experiments)
      .where(eq(experiments.creatorId, creatorId))
      .orderBy(desc(experiments.createdAt));
  }

  async getExperimentParticipants(experimentId: string): Promise<(UserExperiment & { user: { id: string; nostrPubkey: string | null; displayName: string | null; } })[]> {
    const results = await db.select()
      .from(userExperiments)
      .leftJoin(users, eq(userExperiments.userId, users.id))
      .where(eq(userExperiments.experimentId, experimentId));

    return results.map(row => ({
      ...row.user_experiments,
      user: {
        id: row.users!.id,
        nostrPubkey: row.users!.nostrPubkey,
        displayName: row.users!.displayName,
      },
    }));
  }

  // User Experiments
  async getUserExperiments(userId: string): Promise<(UserExperiment & { experiment: Experiment })[]> {
    const results = await db.select()
      .from(userExperiments)
      .leftJoin(experiments, eq(userExperiments.experimentId, experiments.id))
      .where(eq(userExperiments.userId, userId));

    return results.map(row => ({
      ...row.user_experiments,
      experiment: row.experiments!,
    }));
  }

  async enrollUserInExperiment(userExperiment: InsertUserExperiment): Promise<UserExperiment> {
    const [created] = await db.insert(userExperiments).values(userExperiment).returning();
    return created;
  }

  async updateUserExperimentProgress(id: string, updates: Partial<Pick<UserExperiment, 'completedDiscoveries' | 'progress'>>): Promise<UserExperiment | undefined> {
    const [updated] = await db.update(userExperiments)
      .set(updates)
      .where(eq(userExperiments.id, id))
      .returning();
    return updated || undefined;
  }

  // Experiment Notes
  async getExperimentNotes(userId: string, experimentId: string): Promise<ExperimentNote[]> {
    return await db.select().from(experimentNotes)
      .where(and(eq(experimentNotes.userId, userId), eq(experimentNotes.experimentId, experimentId)))
      .orderBy(desc(experimentNotes.createdAt));
  }

  async createExperimentNote(note: InsertExperimentNote): Promise<ExperimentNote> {
    const [created] = await db.insert(experimentNotes).values(note).returning();
    return created;
  }

  async updateExperimentNote(id: string, note: Partial<InsertExperimentNote>): Promise<ExperimentNote | undefined> {
    const [updated] = await db.update(experimentNotes)
      .set({ ...note, updatedAt: new Date() })
      .where(eq(experimentNotes.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteExperimentNote(id: string): Promise<boolean> {
    const result = await db.delete(experimentNotes).where(eq(experimentNotes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Discovery Notes
  async getDiscoveryNotes(userId: string, experimentId: string): Promise<DiscoveryNote[]> {
    return await db.select().from(discoveryNotes)
      .where(and(eq(discoveryNotes.userId, userId), eq(discoveryNotes.experimentId, experimentId)))
      .orderBy(discoveryNotes.discoveryNumber);
  }

  async createDiscoveryNote(note: InsertDiscoveryNote): Promise<DiscoveryNote> {
    const [created] = await db.insert(discoveryNotes).values(note).returning();
    return created;
  }

  async updateDiscoveryNote(id: string, note: Partial<InsertDiscoveryNote>): Promise<DiscoveryNote | undefined> {
    const [updated] = await db.update(discoveryNotes)
      .set({ ...note, updatedAt: new Date() })
      .where(eq(discoveryNotes.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDiscoveryNote(id: string): Promise<boolean> {
    const result = await db.delete(discoveryNotes).where(eq(discoveryNotes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  // Posts
  async getRecentPosts(limit: number = 50): Promise<(Post & { author: User })[]> {
    const results = await db.select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return results.map(row => ({
      ...row.posts,
      author: row.users!,
    }));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [created] = await db.insert(posts).values(post).returning();
    return created;
  }

  async likePost(postId: string): Promise<Post | undefined> {
    const [updated] = await db.update(posts)
      .set({ likes: sql`${posts.likes} + 1` })
      .where(eq(posts.id, postId))
      .returning();
    return updated || undefined;
  }

  async zapPost(postId: string, amount: number): Promise<Post | undefined> {
    const [updated] = await db.update(posts)
      .set({ zaps: sql`${posts.zaps} + ${amount}` })
      .where(eq(posts.id, postId))
      .returning();
    return updated || undefined;
  }

  // Clubs
  async getAllClubs(): Promise<Club[]> {
    return await db.select().from(clubs).orderBy(clubs.name);
  }

  async createClub(club: InsertClub): Promise<Club> {
    const [created] = await db.insert(clubs).values(club).returning();
    return created;
  }

  // Zaps
  async createZap(zap: InsertZap): Promise<Zap> {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(zaps).values(zap).returning();
      
      await tx.update(users)
        .set({ satsGiven: sql`${users.satsGiven} + ${zap.amount}` })
        .where(eq(users.id, zap.senderId));
      
      await tx.update(users)
        .set({ satsReceived: sql`${users.satsReceived} + ${zap.amount}` })
        .where(eq(users.id, zap.receiverId));
      
      if (zap.postId) {
        await tx.update(posts)
          .set({ zaps: sql`${posts.zaps} + ${zap.amount}` })
          .where(eq(posts.id, zap.postId));
      }
      
      return created;
    });
  }

  async getZapsByUser(userId: string, type: 'sent' | 'received', limit: number = 20): Promise<(Zap & { sender?: User; receiver?: User; post?: Post })[]> {
    const condition = type === 'sent' 
      ? eq(zaps.senderId, userId)
      : eq(zaps.receiverId, userId);
    
    const results = await db.select()
      .from(zaps)
      .leftJoin(users, type === 'sent' ? eq(zaps.receiverId, users.id) : eq(zaps.senderId, users.id))
      .leftJoin(posts, eq(zaps.postId, posts.id))
      .where(condition)
      .orderBy(desc(zaps.createdAt))
      .limit(limit);
    
    return results.map(r => ({
      ...r.zaps,
      sender: type === 'received' ? (r.users || undefined) : undefined,
      receiver: type === 'sent' ? (r.users || undefined) : undefined,
      post: r.posts || undefined,
    }));
  }

  async getUserZapStats(userId: string): Promise<{ satsGiven: number; satsReceived: number }> {
    const [user] = await db.select({
      satsGiven: users.satsGiven,
      satsReceived: users.satsReceived,
    }).from(users).where(eq(users.id, userId));
    
    return user || { satsGiven: 0, satsReceived: 0 };
  }

  // AI Usage Methods
  async logAiUsage(log: { userId: string; inputTokens: number; outputTokens: number; model: string }): Promise<void> {
    await db.execute(sql`
      INSERT INTO ai_usage_logs (user_id, input_tokens, output_tokens, model)
      VALUES (${log.userId}, ${log.inputTokens}, ${log.outputTokens}, ${log.model})
    `);
  }

  async updateUserDailyMessages(userId: string, count: number, resetAt?: Date): Promise<void> {
    if (resetAt) {
      await db.update(users)
        .set({ 
          dailyMessagesUsed: count,
          dailyMessagesResetAt: resetAt,
        })
        .where(eq(users.id, userId));
    } else {
      await db.update(users)
        .set({ dailyMessagesUsed: count })
        .where(eq(users.id, userId));
    }
  }

  async deductUserTokens(userId: string, tokens: number): Promise<void> {
    await db.update(users)
      .set({ tokenBalance: sql`GREATEST(0, ${users.tokenBalance} - ${tokens})` })
      .where(eq(users.id, userId));
  }

  async updateUserAiProfile(userId: string, profile: { coreGoals?: string; currentChallenges?: string; interestsTags?: string[]; communicationStyle?: string }): Promise<User | undefined> {
    const updates: Record<string, any> = {};
    if (profile.coreGoals !== undefined) updates.coreGoals = profile.coreGoals;
    if (profile.currentChallenges !== undefined) updates.currentChallenges = profile.currentChallenges;
    if (profile.interestsTags !== undefined) updates.interestsTags = profile.interestsTags;
    if (profile.communicationStyle !== undefined) updates.communicationStyle = profile.communicationStyle;

    if (Object.keys(updates).length === 0) return this.getUser(userId);

    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserTier(userId: string, tier: string): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ tier })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserApiKey(userId: string, apiKey: string | null): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ userApiKey: apiKey })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Estimated tokens to reserve for paid tier (covers typical request)
  private static readonly ESTIMATED_TOKENS_RESERVE = 2000;

  // Phase 1: Reserve a slot atomically - checks limits and increments counter BEFORE AI call
  // For paid tier, reserves estimated tokens upfront
  async reserveAiUsageSlot(params: {
    userId: string;
    tier: string;
    freeTierLimit: number;
    estimatedTokens?: number;
  }): Promise<{ success: true; dailyUsed: number; dailyLimit: number; tokensReserved?: number } | { success: false; error: string; errorCode: number }> {
    const { userId, tier, freeTierLimit, estimatedTokens } = params;
    const now = new Date();
    const tokensToReserve = tier === "paid" ? (estimatedTokens || DatabaseStorage.ESTIMATED_TOKENS_RESERVE) : 0;

    try {
      const result = await db.transaction(async (tx) => {
        // Lock the user row to prevent concurrent modifications
        const [user] = await tx.execute(sql`
          SELECT id, tier, token_balance, daily_messages_used, daily_messages_reset_at
          FROM users
          WHERE id = ${userId}
          FOR UPDATE
        `);

        if (!user) {
          return { success: false as const, error: "User not found", errorCode: 404 };
        }

        const userRow = user as any;
        const resetTime = userRow.daily_messages_reset_at ? new Date(userRow.daily_messages_reset_at) : null;
        const needsReset = !resetTime || (now.getTime() - resetTime.getTime()) > 24 * 60 * 60 * 1000;
        const currentDailyUsed = needsReset ? 0 : (userRow.daily_messages_used || 0);
        const currentBalance = userRow.token_balance || 0;

        // Enforce limits atomically
        if (tier === "free") {
          if (currentDailyUsed >= freeTierLimit) {
            return { 
              success: false as const, 
              error: "Daily message limit reached", 
              errorCode: 429 
            };
          }
        } else if (tier === "paid") {
          if (currentBalance < tokensToReserve) {
            return { 
              success: false as const, 
              error: "Token balance insufficient. Please add more credits.", 
              errorCode: 402 
            };
          }
        }

        // Reserve the slot by incrementing daily message count
        const newDailyUsed = needsReset ? 1 : currentDailyUsed + 1;
        
        await tx.update(users)
          .set({ 
            dailyMessagesUsed: newDailyUsed,
            dailyMessagesResetAt: needsReset ? now : resetTime,
          })
          .where(eq(users.id, userId));

        // For paid tier, reserve tokens by deducting upfront
        if (tier === "paid") {
          await tx.execute(sql`
            UPDATE users 
            SET token_balance = GREATEST(0, token_balance - ${tokensToReserve})
            WHERE id = ${userId}
          `);
        }

        return { 
          success: true as const, 
          dailyUsed: newDailyUsed, 
          dailyLimit: freeTierLimit,
          tokensReserved: tier === "paid" ? tokensToReserve : undefined
        };
      });

      return result;
    } catch (error: any) {
      console.error("AI slot reservation error:", error);
      return { success: false, error: "Failed to reserve AI usage slot", errorCode: 500 };
    }
  }

  // Phase 2: Finalize usage - log actual tokens and adjust balance for paid tier
  async finalizeAiUsage(params: {
    userId: string;
    inputTokens: number;
    outputTokens: number;
    model: string;
    tier: string;
    tokensReserved?: number;
  }): Promise<void> {
    const { userId, inputTokens, outputTokens, model, tier, tokensReserved } = params;
    const actualTokensUsed = inputTokens + outputTokens;

    await db.transaction(async (tx) => {
      // Log the AI usage
      await tx.insert(aiUsageLogs).values({
        userId,
        inputTokens,
        outputTokens,
        model,
      });

      // For paid tier, adjust balance: refund excess reserved tokens or deduct additional
      if (tier === "paid" && tokensReserved !== undefined) {
        const difference = tokensReserved - actualTokensUsed;
        if (difference !== 0) {
          // Positive difference = refund, negative difference = additional deduction
          await tx.execute(sql`
            UPDATE users 
            SET token_balance = GREATEST(0, token_balance + ${difference})
            WHERE id = ${userId}
          `);
        }
      }
    });
  }

  // Rollback: Release a reserved slot if AI call fails
  async releaseAiUsageSlot(userId: string, tier: string, tokensReserved?: number): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        // Decrement daily messages used (but don't go below 0)
        await tx.execute(sql`
          UPDATE users 
          SET daily_messages_used = GREATEST(0, COALESCE(daily_messages_used, 1) - 1)
          WHERE id = ${userId}
        `);

        // For paid tier, refund reserved tokens
        if (tier === "paid" && tokensReserved) {
          await tx.execute(sql`
            UPDATE users 
            SET token_balance = token_balance + ${tokensReserved}
            WHERE id = ${userId}
          `);
        }
      });
    } catch (error) {
      console.error("Failed to release AI usage slot:", error);
      // Don't throw - this is best effort cleanup
    }
  }

  // ============= CREATOR ANALYTICS =============

  async getCreatorAnalytics(creatorId: string): Promise<{
    totalCourseEnrollments: number;
    totalExperimentEnrollments: number;
  }> {
    const creatorCourses = await db.select({ id: courses.id })
      .from(courses)
      .where(eq(courses.creatorId, creatorId));
    
    let totalCourseEnrollments = 0;
    if (creatorCourses.length > 0) {
      const courseIds = creatorCourses.map(c => c.id);
      const enrollmentCounts = await db.select({ count: sql<number>`count(*)::int` })
        .from(courseEnrollments)
        .where(inArray(courseEnrollments.courseId, courseIds));
      totalCourseEnrollments = enrollmentCounts[0]?.count || 0;
    }

    const creatorExperiments = await db.select({ id: experiments.id })
      .from(experiments)
      .where(eq(experiments.creatorId, creatorId));
    
    let totalExperimentEnrollments = 0;
    if (creatorExperiments.length > 0) {
      const experimentIds = creatorExperiments.map(e => e.id);
      const experimentCounts = await db.select({ count: sql<number>`count(*)::int` })
        .from(userExperiments)
        .where(inArray(userExperiments.experimentId, experimentIds));
      totalExperimentEnrollments = experimentCounts[0]?.count || 0;
    }

    return {
      totalCourseEnrollments,
      totalExperimentEnrollments,
    };
  }

  // ============= COURSES =============

  async getAllCourses(options?: { published?: boolean }): Promise<(Course & { creator: User })[]> {
    let query = db.select()
      .from(courses)
      .leftJoin(users, eq(courses.creatorId, users.id))
      .orderBy(desc(courses.createdAt));
    
    if (options?.published !== undefined) {
      const results = await db.select()
        .from(courses)
        .leftJoin(users, eq(courses.creatorId, users.id))
        .where(eq(courses.isPublished, options.published))
        .orderBy(desc(courses.createdAt));
      return results.map(r => ({ ...r.courses, creator: r.users! }));
    }
    
    const results = await query;
    return results.map(r => ({ ...r.courses, creator: r.users! }));
  }

  async getCoursesByCreator(creatorId: string): Promise<Course[]> {
    return await db.select().from(courses)
      .where(eq(courses.creatorId, creatorId))
      .orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<(Course & { creator: User; lessons: Lesson[] }) | undefined> {
    const [result] = await db.select()
      .from(courses)
      .leftJoin(users, eq(courses.creatorId, users.id))
      .where(eq(courses.id, id));
    
    if (!result) return undefined;
    
    const courseLessons = await db.select()
      .from(lessons)
      .where(eq(lessons.courseId, id))
      .orderBy(lessons.order);
    
    return {
      ...result.courses,
      creator: result.users!,
      lessons: courseLessons,
    };
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [created] = await db.insert(courses).values(course).returning();
    return created;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | undefined> {
    const [updated] = await db.update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updated;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ============= LESSONS =============

  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return await db.select().from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(lessons.order);
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [created] = await db.insert(lessons).values(lesson).returning();
    // Update course total lessons count
    await db.update(courses)
      .set({ totalLessons: sql`${courses.totalLessons} + 1` })
      .where(eq(courses.id, lesson.courseId));
    return created;
  }

  async updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const [updated] = await db.update(lessons)
      .set({ ...lesson, updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning();
    return updated;
  }

  async deleteLesson(id: string): Promise<boolean> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    if (!lesson) return false;
    
    const result = await db.delete(lessons).where(eq(lessons.id, id));
    // Update course total lessons count
    await db.update(courses)
      .set({ totalLessons: sql`GREATEST(0, ${courses.totalLessons} - 1)` })
      .where(eq(courses.id, lesson.courseId));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (let i = 0; i < lessonIds.length; i++) {
        await tx.update(lessons)
          .set({ order: i })
          .where(and(eq(lessons.id, lessonIds[i]), eq(lessons.courseId, courseId)));
      }
    });
  }

  // ============= COURSE ENROLLMENTS =============

  async getEnrollmentsByCourse(courseId: string): Promise<(CourseEnrollment & { user: User })[]> {
    const results = await db.select()
      .from(courseEnrollments)
      .leftJoin(users, eq(courseEnrollments.userId, users.id))
      .where(eq(courseEnrollments.courseId, courseId))
      .orderBy(desc(courseEnrollments.enrolledAt));
    return results.map(r => ({ ...r.course_enrollments, user: r.users! }));
  }

  async getEnrollmentsByUser(userId: string): Promise<(CourseEnrollment & { course: Course })[]> {
    const results = await db.select()
      .from(courseEnrollments)
      .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(eq(courseEnrollments.userId, userId))
      .orderBy(desc(courseEnrollments.lastAccessedAt));
    return results.map(r => ({ ...r.course_enrollments, course: r.courses! }));
  }

  async getEnrollment(userId: string, courseId: string): Promise<CourseEnrollment | undefined> {
    const [enrollment] = await db.select().from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)));
    return enrollment || undefined;
  }

  async enrollInCourse(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment> {
    const [created] = await db.insert(courseEnrollments).values(enrollment).returning();
    // Increment course enrollment count
    await db.update(courses)
      .set({ totalEnrollments: sql`${courses.totalEnrollments} + 1` })
      .where(eq(courses.id, enrollment.courseId));
    return created;
  }

  async updateEnrollmentProgress(id: string, updates: { progress?: number; completedLessons?: string[]; completedAt?: Date }): Promise<CourseEnrollment | undefined> {
    const [updated] = await db.update(courseEnrollments)
      .set({ ...updates, lastAccessedAt: new Date() })
      .where(eq(courseEnrollments.id, id))
      .returning();
    return updated;
  }

  async unenrollFromCourse(userId: string, courseId: string): Promise<boolean> {
    const result = await db.delete(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)));
    if (result.rowCount && result.rowCount > 0) {
      await db.update(courses)
        .set({ totalEnrollments: sql`GREATEST(0, ${courses.totalEnrollments} - 1)` })
        .where(eq(courses.id, courseId));
      return true;
    }
    return false;
  }

  // ============= COURSE & LESSON COMMENTS =============

  async getCourseComments(courseId: string): Promise<(CourseComment & { author: User })[]> {
    const results = await db.select()
      .from(courseComments)
      .leftJoin(users, eq(courseComments.authorId, users.id))
      .where(eq(courseComments.courseId, courseId))
      .orderBy(desc(courseComments.createdAt));
    return results.map(r => ({ ...r.course_comments, author: r.users! }));
  }

  async createCourseComment(comment: InsertCourseComment): Promise<CourseComment> {
    const [created] = await db.insert(courseComments).values(comment).returning();
    return created;
  }

  async getLessonComments(lessonId: string): Promise<(LessonComment & { author: User })[]> {
    const results = await db.select()
      .from(lessonComments)
      .leftJoin(users, eq(lessonComments.authorId, users.id))
      .where(eq(lessonComments.lessonId, lessonId))
      .orderBy(desc(lessonComments.createdAt));
    return results.map(r => ({ ...r.lesson_comments, author: r.users! }));
  }

  async createLessonComment(comment: InsertLessonComment): Promise<LessonComment> {
    const [created] = await db.insert(lessonComments).values(comment).returning();
    return created;
  }

  // ============= COMMUNITIES =============

  async getAllCommunities(options?: { active?: boolean }): Promise<(Community & { creator: User })[]> {
    if (options?.active !== undefined) {
      const results = await db.select()
        .from(communities)
        .leftJoin(users, eq(communities.creatorId, users.id))
        .where(eq(communities.isActive, options.active))
        .orderBy(desc(communities.createdAt));
      return results.map(r => ({ ...r.communities, creator: r.users! }));
    }
    
    const results = await db.select()
      .from(communities)
      .leftJoin(users, eq(communities.creatorId, users.id))
      .orderBy(desc(communities.createdAt));
    return results.map(r => ({ ...r.communities, creator: r.users! }));
  }

  async getCommunitiesByCreator(creatorId: string): Promise<Community[]> {
    return await db.select().from(communities)
      .where(eq(communities.creatorId, creatorId))
      .orderBy(desc(communities.createdAt));
  }

  async getCommunity(id: string): Promise<(Community & { creator: User }) | undefined> {
    const [result] = await db.select()
      .from(communities)
      .leftJoin(users, eq(communities.creatorId, users.id))
      .where(eq(communities.id, id));
    
    if (!result) return undefined;
    return { ...result.communities, creator: result.users! };
  }

  async getCommunityBySlug(slug: string): Promise<(Community & { creator: User }) | undefined> {
    const [result] = await db.select()
      .from(communities)
      .leftJoin(users, eq(communities.creatorId, users.id))
      .where(eq(communities.slug, slug));
    
    if (!result) return undefined;
    return { ...result.communities, creator: result.users! };
  }

  async createCommunity(community: InsertCommunity): Promise<Community> {
    const [created] = await db.insert(communities).values(community).returning();
    // Auto-add creator as admin member
    await db.insert(communityMemberships).values({
      userId: community.creatorId,
      communityId: created.id,
      role: "admin",
      status: "approved",
    });
    return created;
  }

  async updateCommunity(id: string, community: Partial<InsertCommunity>): Promise<Community | undefined> {
    const [updated] = await db.update(communities)
      .set({ ...community, updatedAt: new Date() })
      .where(eq(communities.id, id))
      .returning();
    return updated;
  }

  async deleteCommunity(id: string): Promise<boolean> {
    const result = await db.delete(communities).where(eq(communities.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ============= COMMUNITY MEMBERSHIPS =============

  async getCommunityMembers(communityId: string, status?: string): Promise<(CommunityMembership & { user: User })[]> {
    if (status) {
      const results = await db.select()
        .from(communityMemberships)
        .leftJoin(users, eq(communityMemberships.userId, users.id))
        .where(and(eq(communityMemberships.communityId, communityId), eq(communityMemberships.status, status)))
        .orderBy(desc(communityMemberships.createdAt));
      return results.map(r => ({ ...r.community_memberships, user: r.users! }));
    }
    
    const results = await db.select()
      .from(communityMemberships)
      .leftJoin(users, eq(communityMemberships.userId, users.id))
      .where(eq(communityMemberships.communityId, communityId))
      .orderBy(desc(communityMemberships.createdAt));
    return results.map(r => ({ ...r.community_memberships, user: r.users! }));
  }

  async getUserCommunities(userId: string): Promise<(CommunityMembership & { community: Community })[]> {
    const results = await db.select()
      .from(communityMemberships)
      .leftJoin(communities, eq(communityMemberships.communityId, communities.id))
      .where(and(eq(communityMemberships.userId, userId), eq(communityMemberships.status, "approved")))
      .orderBy(desc(communityMemberships.joinedAt));
    return results.map(r => ({ ...r.community_memberships, community: r.communities! }));
  }

  async getMembership(userId: string, communityId: string): Promise<CommunityMembership | undefined> {
    const [membership] = await db.select().from(communityMemberships)
      .where(and(eq(communityMemberships.userId, userId), eq(communityMemberships.communityId, communityId)));
    return membership || undefined;
  }

  async getMembershipById(id: string): Promise<CommunityMembership | undefined> {
    const [membership] = await db.select().from(communityMemberships)
      .where(eq(communityMemberships.id, id));
    return membership || undefined;
  }

  async requestMembership(membership: InsertCommunityMembership): Promise<CommunityMembership> {
    const [created] = await db.insert(communityMemberships).values(membership).returning();
    return created;
  }

  async updateMembership(id: string, updates: Partial<InsertCommunityMembership>): Promise<CommunityMembership | undefined> {
    const [updated] = await db.update(communityMemberships)
      .set(updates)
      .where(eq(communityMemberships.id, id))
      .returning();
    return updated;
  }

  async approveMembership(id: string): Promise<CommunityMembership | undefined> {
    const [updated] = await db.update(communityMemberships)
      .set({ status: "approved", joinedAt: new Date() })
      .where(eq(communityMemberships.id, id))
      .returning();
    
    if (updated) {
      // Increment member count
      await db.update(communities)
        .set({ memberCount: sql`${communities.memberCount} + 1` })
        .where(eq(communities.id, updated.communityId));
    }
    return updated;
  }

  async rejectMembership(id: string): Promise<CommunityMembership | undefined> {
    const [updated] = await db.update(communityMemberships)
      .set({ status: "rejected" })
      .where(eq(communityMemberships.id, id))
      .returning();
    return updated;
  }

  async updateMemberRole(id: string, role: string): Promise<CommunityMembership | undefined> {
    const [updated] = await db.update(communityMemberships)
      .set({ role })
      .where(eq(communityMemberships.id, id))
      .returning();
    return updated;
  }

  async deleteMembership(id: string): Promise<boolean> {
    const membership = await this.getMembershipById(id);
    if (!membership) return false;
    
    const result = await db.delete(communityMemberships)
      .where(eq(communityMemberships.id, id));
    
    if (result.rowCount && result.rowCount > 0 && membership.status === "approved") {
      await db.update(communities)
        .set({ memberCount: sql`GREATEST(0, ${communities.memberCount} - 1)` })
        .where(eq(communities.id, membership.communityId));
    }
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async removeMember(userId: string, communityId: string): Promise<boolean> {
    const result = await db.delete(communityMemberships)
      .where(and(eq(communityMemberships.userId, userId), eq(communityMemberships.communityId, communityId)));
    if (result.rowCount && result.rowCount > 0) {
      await db.update(communities)
        .set({ memberCount: sql`GREATEST(0, ${communities.memberCount} - 1)` })
        .where(eq(communities.id, communityId));
      return true;
    }
    return false;
  }

  // ============= COMMUNITY POSTS =============

  async getCommunityPosts(communityId: string, limit: number = 50): Promise<(CommunityPost & { author: User })[]> {
    const results = await db.select()
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.authorId, users.id))
      .where(eq(communityPosts.communityId, communityId))
      .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt))
      .limit(limit);
    return results.map(r => ({ ...r.community_posts, author: r.users! }));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [created] = await db.insert(communityPosts).values(post).returning();
    return created;
  }

  async likeCommunityPost(postId: string): Promise<CommunityPost | undefined> {
    const [updated] = await db.update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} + 1` })
      .where(eq(communityPosts.id, postId))
      .returning();
    return updated;
  }

  async zapCommunityPost(postId: string, amount: number): Promise<CommunityPost | undefined> {
    const [updated] = await db.update(communityPosts)
      .set({ zaps: sql`${communityPosts.zaps} + ${amount}` })
      .where(eq(communityPosts.id, postId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
