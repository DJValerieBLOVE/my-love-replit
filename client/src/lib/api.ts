const API_BASE = "";

function getAuthHeaders(): HeadersInit {
  const pubkey = localStorage.getItem("nostr_pubkey");
  const jwtToken = localStorage.getItem("auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (pubkey) {
    headers["x-nostr-pubkey"] = pubkey;
  } else if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
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

export async function registerWithEmail(email: string, password: string, name: string, nostrPubkey?: string) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, nostrPubkey }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to register");
  return data;
}

export async function loginWithEmail(email: string, password: string, twoFactorCode?: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, twoFactorCode }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to login");
  return data;
}

export async function setup2FA() {
  const response = await authFetch("/api/auth/2fa/setup", { method: "POST" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to setup 2FA");
  return data;
}

export async function verify2FA(code: string) {
  const response = await authFetch("/api/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to verify 2FA");
  return data;
}

export async function disable2FA(code: string) {
  const response = await authFetch("/api/auth/2fa", {
    method: "DELETE",
    body: JSON.stringify({ code }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to disable 2FA");
  return data;
}

export async function linkNostrAccount(pubkey: string, source: string = 'extension') {
  const response = await authFetch("/api/auth/link-nostr", {
    method: "POST",
    body: JSON.stringify({ pubkey, source }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to link Nostr account");
  return data;
}

export async function getCurrentUser() {
  const response = await authFetch("/api/auth/me");
  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error("Failed to fetch current user");
  }
  return response.json();
}

export async function updateProfile(updates: { name?: string; lookingForBuddy?: boolean; buddyDescription?: string; labInterests?: string[] }) {
  const response = await authFetch("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Failed to update profile" }));
    throw new Error(data.error || "Failed to update profile");
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

export async function createExperiment(data: {
  title: string;
  guide: string;
  description?: string;
  image?: string;
  category: string;
  loveCodeArea?: string;
  steps?: { order: number; title: string; prompt: string; }[];
  accessType?: string;
  communityId?: string;
  price?: number;
  isPublished?: boolean;
}) {
  const response = await authFetch("/api/experiments", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create experiment");
  return response.json();
}

export async function getExperiment(id: string) {
  const response = await fetch(`/api/experiments/${id}`);
  if (!response.ok) throw new Error("Failed to fetch experiment");
  return response.json();
}

export async function getCreatorExperiments() {
  const response = await authFetch("/api/creator/experiments");
  if (!response.ok) throw new Error("Failed to fetch creator experiments");
  return response.json();
}

export async function getCreatorCourses() {
  const response = await authFetch("/api/creator/courses");
  if (!response.ok) throw new Error("Failed to fetch creator courses");
  return response.json();
}

export async function getCreatorCommunities() {
  const response = await authFetch("/api/creator/communities");
  if (!response.ok) throw new Error("Failed to fetch creator communities");
  return response.json();
}

export async function getCreatorAnalytics() {
  const response = await authFetch("/api/creator/analytics");
  if (!response.ok) throw new Error("Failed to fetch creator analytics");
  return response.json();
}

export async function getExperimentParticipants(experimentId: string) {
  const response = await authFetch(`/api/experiments/${experimentId}/participants`);
  if (!response.ok) throw new Error("Failed to fetch experiment participants");
  return response.json();
}

export async function getCourseEnrollees(courseId: string) {
  const response = await authFetch(`/api/courses/${courseId}/enrollees`);
  if (!response.ok) throw new Error("Failed to fetch course enrollees");
  return response.json();
}

export async function getPublicProfile(userId: string) {
  const response = await fetch(`/api/users/${userId}/profile`);
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function getAllEvents() {
  const response = await fetch("/api/events");
  if (!response.ok) throw new Error("Failed to fetch events");
  return response.json();
}

export async function getEvent(id: string) {
  const response = await fetch(`/api/events/${id}`);
  if (!response.ok) throw new Error("Failed to fetch event");
  return response.json();
}

export async function createEvent(data: {
  title: string;
  host: string;
  date: string;
  time: string;
  type: string;
  recurrence?: string;
  attendees?: number;
  image?: string;
  description?: string;
  category: string;
}) {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create event");
  return response.json();
}

export async function getRecentPosts(limit?: number) {
  const url = limit ? `/api/posts?limit=${limit}` : "/api/posts";
  const response = await authFetch(url);
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
}

export async function getAggregateFeed(options?: { limit?: number; source?: "nostr" | "community" | "learning" }) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", options.limit.toString());
  if (options?.source) params.set("source", options.source);
  const url = `/api/feed${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await authFetch(url);
  if (!response.ok) throw new Error("Failed to fetch feed");
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

// AI Magic Mentor
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiChatResponse {
  response: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  limits?: {
    used: number;
    limit: number;
  };
}

export async function getAiStatus(): Promise<{ available: boolean; model: string }> {
  const response = await fetch("/api/ai/status");
  if (!response.ok) throw new Error("Failed to check AI status");
  return response.json();
}

export async function sendAiMessage(messages: ChatMessage[]): Promise<AiChatResponse> {
  const response = await authFetch("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get AI response");
  }
  return response.json();
}

export async function updateAiProfile(profile: {
  coreGoals?: string;
  currentChallenges?: string;
  interestsTags?: string[];
  communicationStyle?: string;
}) {
  const response = await authFetch("/api/ai/profile", {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("Failed to update AI profile");
  return response.json();
}

// BYOK API Key Management
export async function getByokKeyStatus(): Promise<{ hasKey: boolean; keyPreview: string | null }> {
  const response = await authFetch("/api/ai/byok-key");
  if (!response.ok) throw new Error("Failed to check API key status");
  return response.json();
}

export async function saveByokKey(apiKey: string): Promise<{ success: boolean; hasKey: boolean }> {
  const response = await authFetch("/api/ai/byok-key", {
    method: "POST",
    body: JSON.stringify({ apiKey }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Failed to save API key" }));
    throw new Error(data.error || "Failed to save API key");
  }
  return response.json();
}

export async function removeByokKey(): Promise<{ success: boolean; hasKey: boolean }> {
  const response = await authFetch("/api/ai/byok-key", { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to remove API key");
  return response.json();
}

// Membership API
export async function getMembershipInfo(): Promise<{
  tier: string;
  tokenBalance: number;
  dailyMessagesUsed: number;
  hasApiKey: boolean;
}> {
  const response = await authFetch("/api/membership");
  if (!response.ok) throw new Error("Failed to fetch membership info");
  return response.json();
}

export async function updateMembershipTier(tier: string) {
  const response = await authFetch("/api/membership/tier", {
    method: "PATCH",
    body: JSON.stringify({ tier }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Failed to update membership" }));
    throw new Error(data.error || "Failed to update membership");
  }
  return response.json();
}

// Course API
export async function getAllCourses() {
  const response = await fetch("/api/courses");
  if (!response.ok) throw new Error("Failed to fetch courses");
  return response.json();
}

export async function getMyCourses() {
  const response = await authFetch("/api/courses/my");
  if (!response.ok) throw new Error("Failed to fetch your courses");
  return response.json();
}

export async function getEnrolledCourses() {
  const response = await authFetch("/api/courses/enrolled");
  if (!response.ok) throw new Error("Failed to fetch enrolled courses");
  return response.json();
}

export async function getCourse(id: string) {
  const response = await fetch(`/api/courses/${id}`);
  if (!response.ok) throw new Error("Failed to fetch course");
  return response.json();
}

export async function createCourse(course: any) {
  const response = await authFetch("/api/courses", {
    method: "POST",
    body: JSON.stringify(course),
  });
  if (!response.ok) throw new Error("Failed to create course");
  return response.json();
}

export async function updateCourse(id: string, course: any) {
  const response = await authFetch(`/api/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(course),
  });
  if (!response.ok) throw new Error("Failed to update course");
  return response.json();
}

export async function deleteCourse(id: string) {
  const response = await authFetch(`/api/courses/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete course");
  return response.ok;
}

// Lesson API
export async function createLesson(courseId: string, lesson: any) {
  const response = await authFetch(`/api/courses/${courseId}/lessons`, {
    method: "POST",
    body: JSON.stringify(lesson),
  });
  if (!response.ok) throw new Error("Failed to create lesson");
  return response.json();
}

export async function updateLesson(id: string, lesson: any) {
  const response = await authFetch(`/api/lessons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(lesson),
  });
  if (!response.ok) throw new Error("Failed to update lesson");
  return response.json();
}

export async function deleteLesson(id: string) {
  const response = await authFetch(`/api/lessons/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete lesson");
  return response.ok;
}

// Enrollment API
export async function enrollInCourse(courseId: string) {
  const response = await authFetch(`/api/courses/${courseId}/enroll`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to enroll in course");
  return response.json();
}

export async function unenrollFromCourse(courseId: string) {
  const response = await authFetch(`/api/courses/${courseId}/enroll`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to unenroll from course");
  return response.ok;
}

export async function getCourseEnrollment(courseId: string) {
  const response = await authFetch(`/api/courses/${courseId}/enrollment`);
  if (!response.ok) throw new Error("Failed to fetch enrollment");
  return response.json();
}

export async function updateCourseEnrollment(courseId: string, updates: any) {
  const response = await authFetch(`/api/courses/${courseId}/enrollment`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update enrollment");
  return response.json();
}

// Community API
export async function getAllCommunities() {
  const response = await fetch("/api/communities");
  if (!response.ok) throw new Error("Failed to fetch communities");
  return response.json();
}

export async function getMyCommunities() {
  const response = await authFetch("/api/communities/my");
  if (!response.ok) throw new Error("Failed to fetch your communities");
  return response.json();
}

export async function getCreatedCommunities() {
  const response = await authFetch("/api/communities/created");
  if (!response.ok) throw new Error("Failed to fetch created communities");
  return response.json();
}

export async function getCommunity(id: string) {
  const response = await fetch(`/api/communities/${id}`);
  if (!response.ok) throw new Error("Failed to fetch community");
  return response.json();
}

export async function getCommunityBySlug(slug: string) {
  const response = await fetch(`/api/communities/slug/${slug}`);
  if (!response.ok) throw new Error("Failed to fetch community");
  return response.json();
}

export async function createCommunity(community: any) {
  const response = await authFetch("/api/communities", {
    method: "POST",
    body: JSON.stringify(community),
  });
  if (!response.ok) throw new Error("Failed to create community");
  return response.json();
}

export async function updateCommunity(id: string, community: any) {
  const response = await authFetch(`/api/communities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(community),
  });
  if (!response.ok) throw new Error("Failed to update community");
  return response.json();
}

export async function joinCommunity(id: string, approvalAnswers?: string[]) {
  const response = await authFetch(`/api/communities/${id}/join`, {
    method: "POST",
    body: JSON.stringify({ approvalAnswers }),
  });
  if (!response.ok) throw new Error("Failed to join community");
  return response.json();
}

export async function leaveCommunity(id: string) {
  const response = await authFetch(`/api/communities/${id}/membership`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to leave community");
  return response.ok;
}

export async function getCommunityMembership(id: string) {
  const response = await authFetch(`/api/communities/${id}/membership`);
  if (!response.ok) throw new Error("Failed to fetch membership");
  return response.json();
}

export async function getCommunityPosts(id: string, limit?: number) {
  const url = limit ? `/api/communities/${id}/posts?limit=${limit}` : `/api/communities/${id}/posts`;
  const response = await authFetch(url);
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
}

export async function createCommunityPost(communityId: string, content: string, image?: string) {
  const response = await authFetch(`/api/communities/${communityId}/posts`, {
    method: "POST",
    body: JSON.stringify({ content, image }),
  });
  if (!response.ok) throw new Error("Failed to create post");
  return response.json();
}

// Course Comments API
export async function getCourseComments(courseId: string) {
  const response = await fetch(`/api/courses/${courseId}/comments`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  return response.json();
}

export async function createCourseComment(courseId: string, content: string, parentId?: string) {
  const response = await authFetch(`/api/courses/${courseId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, parentId }),
  });
  if (!response.ok) throw new Error("Failed to add comment");
  return response.json();
}

export async function getLessonComments(lessonId: string) {
  const response = await fetch(`/api/lessons/${lessonId}/comments`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  return response.json();
}

export async function createLessonComment(lessonId: string, content: string, parentId?: string) {
  const response = await authFetch(`/api/lessons/${lessonId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, parentId }),
  });
  if (!response.ok) throw new Error("Failed to add comment");
  return response.json();
}

// Community Admin API
export async function getCommunityMembers(communityId: string) {
  const response = await authFetch(`/api/communities/${communityId}/members`);
  if (!response.ok) throw new Error("Failed to fetch members");
  return response.json();
}

export async function getPendingJoinRequests(communityId: string) {
  const response = await authFetch(`/api/communities/${communityId}/requests`);
  if (!response.ok) throw new Error("Failed to fetch requests");
  return response.json();
}

export async function approveJoinRequest(membershipId: string) {
  const response = await authFetch(`/api/memberships/${membershipId}/approve`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to approve");
  return response.json();
}

export async function rejectJoinRequest(membershipId: string) {
  const response = await authFetch(`/api/memberships/${membershipId}/reject`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to reject");
  return response.json();
}

export async function updateMemberRole(membershipId: string, role: string) {
  const response = await authFetch(`/api/memberships/${membershipId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  if (!response.ok) throw new Error("Failed to update role");
  return response.json();
}

export async function removeCommunityMember(membershipId: string) {
  const response = await authFetch(`/api/memberships/${membershipId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to remove member");
  return response.ok;
}
