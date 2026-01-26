const API_BASE = "";

function getAuthHeaders(): HeadersInit {
  const pubkey = localStorage.getItem("nostr_pubkey");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (pubkey) {
    headers["x-nostr-pubkey"] = pubkey;
  }
  return headers;
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}

export async function loginWithNostr(pubkey: string, profile?: { name?: string; picture?: string; nip05?: string; lud16?: string }) {
  const response = await fetch("/api/auth/nostr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pubkey, ...profile }),
  });
  if (!response.ok) throw new Error("Failed to authenticate");
  return response.json();
}

export async function getCurrentUser() {
  const response = await authFetch("/api/auth/me");
  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error("Failed to fetch current user");
  }
  return response.json();
}

export async function updateUserEmail(email: string) {
  const response = await authFetch("/api/auth/email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Failed to update email" }));
    throw new Error(data.error || "Failed to update email");
  }
  return response.json();
}

export async function getProfileStatus() {
  const response = await authFetch("/api/auth/profile-status");
  if (!response.ok) {
    throw new Error("Failed to fetch profile status");
  }
  return response.json();
}

export async function getJournalEntries(limit?: number) {
  const url = limit ? `/api/journal?limit=${limit}` : "/api/journal";
  const response = await authFetch(url);
  if (!response.ok) throw new Error("Failed to fetch journal entries");
  return response.json();
}

export async function getJournalEntryByDate(date: Date) {
  const pubkey = localStorage.getItem("nostr_pubkey");
  if (!pubkey) throw new Error("Not authenticated");
  
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  
  const dateStr = date.toISOString().split('T')[0];
  const response = await authFetch(`/api/journal/${user.id}/date/${dateStr}`);
  if (!response.ok) throw new Error("Failed to fetch journal entry");
  return response.json();
}

export async function createJournalEntry(entry: any) {
  const response = await authFetch("/api/journal", {
    method: "POST",
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error("Failed to create journal entry");
  return response.json();
}

export async function updateJournalEntry(id: string, entry: any) {
  const response = await authFetch(`/api/journal/${id}`, {
    method: "PATCH",
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error("Failed to update journal entry");
  return response.json();
}

export async function deleteJournalEntry(id: string) {
  const response = await authFetch(`/api/journal/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete journal entry");
  return response.ok;
}

export async function getDreams() {
  const response = await authFetch("/api/dreams");
  if (!response.ok) throw new Error("Failed to fetch dreams");
  return response.json();
}

export async function getDreamByArea(areaId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  
  const response = await authFetch(`/api/dreams/${user.id}/area/${areaId}`);
  if (!response.ok) throw new Error("Failed to fetch dream");
  return response.json();
}

export async function saveDream(areaId: string, dream: string) {
  const response = await authFetch("/api/dreams", {
    method: "POST",
    body: JSON.stringify({ areaId, dream }),
  });
  if (!response.ok) throw new Error("Failed to save dream");
  return response.json();
}

export async function getAreaProgress() {
  const response = await authFetch("/api/progress");
  if (!response.ok) throw new Error("Failed to fetch area progress");
  return response.json();
}

export async function updateAreaProgress(areaId: string, progress: number) {
  const response = await authFetch("/api/progress", {
    method: "POST",
    body: JSON.stringify({ areaId, progress }),
  });
  if (!response.ok) throw new Error("Failed to update area progress");
  return response.json();
}

export async function getAllExperiments() {
  const response = await fetch("/api/experiments");
  if (!response.ok) throw new Error("Failed to fetch experiments");
  return response.json();
}

export async function getUserExperiments() {
  const response = await authFetch("/api/user-experiments");
  if (!response.ok) throw new Error("Failed to fetch user experiments");
  return response.json();
}

export async function enrollInExperiment(experimentId: string) {
  const response = await authFetch("/api/user-experiments", {
    method: "POST",
    body: JSON.stringify({ experimentId, completedDiscoveries: 0, progress: 0 }),
  });
  if (!response.ok) throw new Error("Failed to enroll in experiment");
  return response.json();
}

export async function getAllEvents() {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
}

export async function getRecentPosts(limit?: number) {
  const url = limit ? `/api/posts?limit=${limit}` : "/api/posts";
  const response = await authFetch(url);
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
}

export async function createPost(content: string, image?: string) {
  const response = await authFetch("/api/posts", {
    method: "POST",
    body: JSON.stringify({ content, image }),
  });
  if (!response.ok) throw new Error("Failed to create post");
  return response.json();
}

export async function likePost(postId: string) {
  const response = await authFetch(`/api/posts/${postId}/like`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to like post");
  return response.json();
}

export async function getAllClubs() {
  const response = await fetch("/api/clubs");
  if (!response.ok) throw new Error("Failed to fetch clubs");
  return response.json();
}

export async function getUser(userId: string) {
  const response = await authFetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}

export async function getLeaderboard(limit?: number) {
  const url = limit ? `/api/leaderboard?limit=${limit}` : "/api/leaderboard";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  return response.json();
}

export async function updateUserStats(updates: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  
  const response = await authFetch(`/api/users/${user.id}/stats`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update user stats");
  return response.json();
}

export async function zapPost(postId: string, receiverId: string, amount: number, comment?: string, paymentHash?: string) {
  const response = await authFetch(`/api/posts/${postId}/zap`, {
    method: "POST",
    body: JSON.stringify({ amount, receiverId, comment, paymentHash }),
  });
  if (!response.ok) throw new Error("Failed to record zap");
  return response.json();
}

export async function getZapHistory(type: 'sent' | 'received' = 'received', limit?: number) {
  const params = new URLSearchParams({ type });
  if (limit) params.set('limit', limit.toString());
  const response = await authFetch(`/api/zaps?${params}`);
  if (!response.ok) throw new Error("Failed to fetch zap history");
  return response.json();
}

export async function getZapStats() {
  const response = await authFetch("/api/zaps/stats");
  if (!response.ok) throw new Error("Failed to fetch zap stats");
  return response.json();
}
