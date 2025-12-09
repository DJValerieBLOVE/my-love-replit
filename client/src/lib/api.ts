// API service for making backend calls
const API_BASE = "";

// Test user ID from seed (this should come from auth in production)
export const CURRENT_USER_ID = "e9594e8a-3846-4517-b815-b8b0756b084e";

// ===== JOURNAL ENTRIES =====

export async function getJournalEntries(userId: string, limit?: number) {
  const url = limit ? `/api/journal/${userId}?limit=${limit}` : `/api/journal/${userId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch journal entries");
  return response.json();
}

export async function getJournalEntryByDate(userId: string, date: Date) {
  const dateStr = date.toISOString().split('T')[0];
  const response = await fetch(`/api/journal/${userId}/date/${dateStr}`);
  if (!response.ok) throw new Error("Failed to fetch journal entry");
  return response.json();
}

export async function createJournalEntry(entry: any) {
  const response = await fetch("/api/journal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error("Failed to create journal entry");
  return response.json();
}

export async function updateJournalEntry(id: string, entry: any) {
  const response = await fetch(`/api/journal/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error("Failed to update journal entry");
  return response.json();
}

export async function deleteJournalEntry(id: string) {
  const response = await fetch(`/api/journal/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete journal entry");
  return response.ok;
}

// ===== DREAMS =====

export async function getDreams(userId: string) {
  const response = await fetch(`/api/dreams/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch dreams");
  return response.json();
}

export async function getDreamByArea(userId: string, areaId: string) {
  const response = await fetch(`/api/dreams/${userId}/area/${areaId}`);
  if (!response.ok) throw new Error("Failed to fetch dream");
  return response.json();
}

export async function saveDream(userId: string, areaId: string, dream: string) {
  const response = await fetch("/api/dreams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, areaId, dream }),
  });
  if (!response.ok) throw new Error("Failed to save dream");
  return response.json();
}

// ===== AREA PROGRESS =====

export async function getAreaProgress(userId: string) {
  const response = await fetch(`/api/progress/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch area progress");
  return response.json();
}

export async function updateAreaProgress(userId: string, areaId: string, progress: number) {
  const response = await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, areaId, progress }),
  });
  if (!response.ok) throw new Error("Failed to update area progress");
  return response.json();
}

// ===== EXPERIMENTS =====

export async function getAllExperiments() {
  const response = await fetch("/api/experiments");
  if (!response.ok) throw new Error("Failed to fetch experiments");
  return response.json();
}

export async function getUserExperiments(userId: string) {
  const response = await fetch(`/api/user-experiments/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user experiments");
  return response.json();
}

export async function enrollInExperiment(userId: string, experimentId: string) {
  const response = await fetch("/api/user-experiments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, experimentId, completedDiscoveries: 0, progress: 0 }),
  });
  if (!response.ok) throw new Error("Failed to enroll in experiment");
  return response.json();
}

// ===== EVENTS =====

export async function getAllEvents() {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
}

// ===== POSTS =====

export async function getRecentPosts(limit?: number) {
  const url = limit ? `/api/posts?limit=${limit}` : "/api/posts";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
}

export async function createPost(authorId: string, content: string, image?: string) {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authorId, content, image }),
  });
  if (!response.ok) throw new Error("Failed to create post");
  return response.json();
}

export async function likePost(postId: string) {
  const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to like post");
  return response.json();
}

export async function zapPost(postId: string, amount: number) {
  const response = await fetch(`/api/posts/${postId}/zap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) throw new Error("Failed to zap post");
  return response.json();
}

// ===== CLUBS =====

export async function getAllClubs() {
  const response = await fetch("/api/clubs");
  if (!response.ok) throw new Error("Failed to fetch clubs");
  return response.json();
}

// ===== USERS =====

export async function getUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}

export async function getLeaderboard(limit?: number) {
  const url = limit ? `/api/leaderboard?limit=${limit}` : "/api/leaderboard";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  return response.json();
}

export async function updateUserStats(userId: string, updates: any) {
  const response = await fetch(`/api/users/${userId}/stats`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update user stats");
  return response.json();
}
