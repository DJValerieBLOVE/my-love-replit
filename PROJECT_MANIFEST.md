# PROJECT MANIFEST

**Last Updated:** 2026-01-26
**Current Phase:** Phase 0 - Audit Complete
**Active Task:** GAP Analysis Complete - Ready for GO execution

---

## PROGRESS SUMMARY

| Metric | Count |
|--------|-------|
| Total Features Specified | 32 |
| Complete | 22 (69%) |
| Partial | 5 (16%) |
| Not Started | 8 (25%) |
| Code Health Issues | 4 |

---

## EXECUTIVE SUMMARY

1. **Core app structure is solid** - Full CRUD backend, PostgreSQL database with 11 tables, Nostr NIP-07 authentication working
2. **Frontend is well-built** - 22 pages/routes, shadcn/ui components, mobile-responsive layout, proper routing
3. **Key gap: AI integration** - Magic Mentor has UI but no actual OpenRouter/Claude connection
4. **Key gap: Lightning payments** - Zap UI exists but no NWC/WebLN backend integration
5. **Mock data dependency** - Several components rely on mock-data.ts instead of real user data

---

## SPECIFICATION SOURCES

| Source | Type | Status |
|--------|------|--------|
| `replit.md` | Primary spec | Current |
| `shared/schema.ts` | Database schema | Current |
| `server/routes.ts` | API documentation | Current |
| `package.json` | Dependencies | Current |

---

## FEATURE MATRIX

### COMPLETE (22 Features)

| Feature | Location | Confidence | Notes |
|---------|----------|------------|-------|
| Daily LOVE Practice Journaling | `/journal`, `client/src/pages/journal.tsx` | 100% | Full CRUD, 5 V's wizard, date-based entries |
| Big Dreams (11 LOVE Code areas) | `/big-dreams`, `client/src/pages/big-dreams.tsx` | 100% | Area-based dreams, share to Nostr |
| Home Dashboard | `/`, `client/src/pages/home.tsx` | 100% | 9-card flip dashboard |
| Heart Dashboard Component | `client/src/components/dashboard/heart-dashboard.tsx` | 100% | Visual pillar layout |
| Resources Page | `/resources`, `client/src/pages/resources.tsx` | 100% | Lab Notes, Toolbox, Music tabs |
| Grow/Learning Page | `/grow`, `client/src/pages/grow.tsx` | 100% | Courses & Experiments tabs |
| Experiment Detail | `/grow/:id`, `client/src/pages/experiment-detail.tsx` | 100% | Discovery notes, progress tracking |
| Communities Page | `/community`, `client/src/pages/community.tsx` | 100% | Club listing |
| Club Detail | `/community/:id`, `client/src/pages/club-detail.tsx` | 100% | Club posts, members |
| Events Page | `/events`, `client/src/pages/events.tsx` | 100% | Calendar view, event cards |
| Event Detail | `/events/:id`, `client/src/pages/event-detail.tsx` | 100% | Event info, registration |
| Leaderboard | `/leaderboard`, `client/src/pages/leaderboard.tsx` | 100% | Sats ranking |
| Feed Page | `/feed`, `client/src/pages/feed.tsx` | 100% | Posts with full action buttons |
| Profile Completion | `client/src/components/profile-completion-dialog.tsx` | 100% | Email collection for trial |
| Share to Nostr | `client/src/components/share-confirmation-dialog.tsx` | 100% | Compose & post to Nostr |
| PostgreSQL Database | `shared/schema.ts`, 11 tables | 100% | Users, journals, dreams, experiments, etc. - VERIFIED PROVISIONED |
| Express API Backend | `server/routes.ts`, 40+ endpoints | 100% | Full CRUD with auth middleware |
| Notification Indicators | `client/src/components/layout.tsx` | 100% | Purple dots on nav items |
| Post Composer with Media | `client/src/components/create-post.tsx` | 100% | Image, GIF, video upload support |
| External Sharing | `client/src/components/feed-post.tsx` | 100% | Share to X, Facebook, copy link |
| Mobile-Optimized Layout | `client/src/components/layout.tsx` | 100% | Compact header, icon-only bottom nav |
| Social Post Actions | `client/src/components/feed-post.tsx` | 100% | Reply, Repost, Zap, Like, Bookmark, Share buttons |

### PARTIAL (5 Features)

| Feature | What Exists | What's Missing | Completion |
|---------|-------------|----------------|------------|
| NIP-07 Nostr Login | Extension-based auth, localStorage persistence | NDK library, cryptographic signature verification, event signing validation | 70% |
| Magic Mentor AI | UI component, chat input, sheet panel | OpenRouter API integration, actual AI responses, memory/context | 30% |
| Zap/Lightning UI | Zap button, amount dialog, toast feedback | NWC/WebLN integration, actual payment processing | 25% |
| Wallet Page | UI layout, ZBD gamertag input, balance display | Real Lightning transactions, balance sync, send/receive | 25% |
| NIP-46 Bunker Login | Button exists (disabled) | nsec.app integration, bunker connection flow | 5% |

### NOT STARTED (8 Features)

| Feature | Specified In | Priority | Dependencies |
|---------|--------------|----------|--------------|
| AI Magic Mentor Backend | replit.md line 121-122 | CRITICAL | OpenRouter API key, user data access |
| Lightning/NWC Integration | replit.md line 120 | HIGH | NWC connection string, WebLN provider |
| AI Learning Buddy (Enhanced) | replit.md line 122 | HIGH | AI backend, user journal/goals access |
| Club-Based Sharing Enforcement | replit.md line 126 | HIGH | isPrivate/sharedClubs fields exist but not enforced |
| Community Membership System | replit.md line 123 | MEDIUM | Payment integration, user roles |
| Bitcoin Rewards System | replit.md line 124 | MEDIUM | Lightning integration |
| User Personalization | replit.md line 125 | MEDIUM | Spotify API, podcast RSS parser |
| AI Memory (Local Vector Store) | replit.md line 80 | LOW | Voy/Orama library, embedding model |

---

## CODE HEALTH METRICS

### Issues Found

| Issue | Location | Severity |
|-------|----------|----------|
| No cryptographic signature verification | `client/src/contexts/nostr-context.tsx` | HIGH |
| TODO: Admin check for experiments | `server/routes.ts:288` | LOW |
| Mock data usage in AI Buddy | `client/src/components/ai-buddy.tsx:13` | MEDIUM |
| Mock data for current user | `client/src/lib/mock-data.ts` used in 8+ files | MEDIUM |

### Security Notes

- Auth uses localStorage pubkey without verifying signed events
- No NDK library for proper Nostr protocol compliance
- All personal data routes protected by authMiddleware (checks x-nostr-pubkey header)

### Positive Notes

- No hardcoded secrets found
- Proper error handling in API routes
- Auth middleware protects personal data
- TypeScript types properly shared between client/server
- Zod validation on all API inputs
- Database fully provisioned with 11 tables (verified)

---

## PHASE STATUS

| Phase | Name | Total Tasks | Completed | Status |
|-------|------|-------------|-----------|--------|
| 0 | Critical Blockers | 0 | 0 | Complete |
| 1 | Infrastructure & Integrations | 5 | 3 | In Progress |
| 2 | Core Feature Completion | 5 | 0 | Not Started |
| 3 | Feature Build-Out | 5 | 0 | Not Started |
| 4 | Admin & Operations | 2 | 0 | Not Started |
| 5 | Hardening & Code Health | 3 | 0 | Not Started |
| 6 | Testing & Documentation | 2 | 0 | Not Started |

---

## PHASED TASK LIST

### PHASE 0: CRITICAL BLOCKERS
*None identified - app is functional for core features*

### PHASE 1: INFRASTRUCTURE & INTEGRATIONS

**[P1-01] OpenRouter AI Integration Setup**
- Description: Set up OpenRouter API client for Magic Mentor AI
- Audit Reference: replit.md line 81 (AI Model: OpenRouter API, Claude Sonnet 3.5)
- Files: Create `server/openrouter.ts`, update `.env`
- Dependencies: None
- Blocked By: OPENROUTER_API_KEY (placeholder needed)
- Acceptance Criteria:
  - [ ] OpenRouter client configured with API key from env
  - [ ] Test endpoint confirms API connectivity
  - [ ] Error handling for missing/invalid key
- Effort: M (1-4hr)

**[P1-02] Lightning/NWC Integration Setup**
- Description: Set up Nostr Wallet Connect for Lightning payments
- Audit Reference: replit.md line 78 (Payments: Lightning WebLN/NWC)
- Files: Create `client/src/lib/nwc.ts`, `client/src/contexts/nwc-context.tsx`
- Dependencies: None
- Blocked By: NWC_CONNECTION_STRING (placeholder needed)
- Acceptance Criteria:
  - [ ] NWC connection can be established
  - [ ] Balance can be read from connected wallet
  - [ ] Payment requests can be generated
- Effort: L (4-8hr)

**[P1-03] Add Missing API Endpoints for User Data** ✅ COMPLETE
- Description: Create API endpoints needed before replacing mock data (user dreams, wallet balance)
- Audit Reference: Code health - mock data dependency requires API readiness
- Files: `server/routes.ts`, `client/src/lib/api.ts`
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [x] GET /api/auth/me returns user's stats including sats, streak, level, walletBalance
  - [x] GET /api/dreams returns user's dreams
  - [x] API functions exist in api.ts for all user data
- Effort: M (1-4hr)
- Note: Endpoints already existed; enhanced NostrContext to load stats on login
- Completed: Jan 2026

**[P1-04] Replace Mock User Data with Real Data** ✅ COMPLETE
- Description: Update components to use authenticated user data instead of mock-data.ts
- Audit Reference: Code health - mock data dependency
- Files: `client/src/components/ai-buddy.tsx`, `client/src/pages/wallet.tsx`, and 6+ others
- Dependencies: P1-03 (API endpoints must exist first)
- Blocked By: None
- Acceptance Criteria:
  - [x] AI Buddy uses real user name from NostrContext
  - [x] Wallet uses real user balance from NostrContext/API
  - [x] All CURRENT_USER references replaced with useNostr/API data
- Effort: M (1-4hr)
- Completed: Jan 2026

**[P1-05] Database Seed Verification** ✅ COMPLETE
- Description: Verify database is properly seeded with initial data
- Audit Reference: Database verified provisioned with 11 tables
- Files: `server/seed.ts`
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [x] Seed data loads successfully for experiments, events, clubs
  - [x] API routes return seeded data (verified via curl)
- Effort: S (under 1hr)
- Completed: Jan 2026

### PHASE 2: CORE FEATURE COMPLETION

**[P2-01] Magic Mentor AI Chat Backend**
- Description: Build API endpoint that sends user messages to OpenRouter and returns AI responses
- Audit Reference: Partial feature - Magic Mentor AI
- Files: `server/routes.ts` (add AI routes), `client/src/lib/api.ts` (add AI functions)
- Dependencies: P1-01
- Blocked By: None
- Acceptance Criteria:
  - [ ] POST /api/ai/chat endpoint accepts message and returns AI response
  - [ ] AI response streams or returns within reasonable time
  - [ ] User's journal entries/dreams included in context
- Effort: L (4-8hr)

**[P2-02] Magic Mentor Frontend Integration**
- Description: Connect AI Buddy component to real AI backend
- Audit Reference: Partial feature - Magic Mentor AI
- Files: `client/src/components/ai-buddy.tsx`
- Dependencies: P2-01, P1-03
- Blocked By: None
- Acceptance Criteria:
  - [ ] Send button triggers API call
  - [ ] AI responses display in chat
  - [ ] Loading state while waiting for response
  - [ ] Error handling for failed requests
- Effort: M (1-4hr)

**[P2-03] Zap Payment Integration**
- Description: Connect zap buttons to real NWC payments
- Audit Reference: Partial feature - Zap/Lightning UI
- Files: `client/src/components/feed-post.tsx`, `client/src/lib/nwc.ts`
- Dependencies: P1-02
- Blocked By: None
- Acceptance Criteria:
  - [ ] Zap button triggers NWC payment
  - [ ] Payment confirmation updates UI
  - [ ] Failed payments show error
- Effort: M (1-4hr)

**[P2-04] Wallet Real Transactions**
- Description: Connect wallet page to real Lightning balance and transactions
- Audit Reference: Partial feature - Wallet Page
- Files: `client/src/pages/wallet.tsx`
- Dependencies: P1-02
- Blocked By: None
- Acceptance Criteria:
  - [ ] Balance reflects NWC wallet balance
  - [ ] Send/Receive buttons work with real Lightning
  - [ ] Transaction history from real data
- Effort: L (4-8hr)

**[P2-05] NIP-46 Bunker Login**
- Description: Enable NIP-46 bunker login for maximum security
- Audit Reference: Partial feature - NIP-46 Bunker Login
- Files: `client/src/components/nostr-login-dialog.tsx`, `client/src/contexts/nostr-context.tsx`
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [ ] Bunker button enabled
  - [ ] Can connect via nsec.app or nsecBunker
  - [ ] Auth flow completes and persists
- Effort: L (4-8hr)

### PHASE 3: FEATURE BUILD-OUT

**[P3-01] Community Membership System**
- Description: Implement paid community memberships with creator tools
- Audit Reference: replit.md line 123 - Multi-tenant architecture
- Files: New tables in schema, new routes, new UI components
- Dependencies: P2-03, P2-04 (payment system)
- Blocked By: Business logic decisions
- Acceptance Criteria:
  - [ ] Creators can create paid communities
  - [ ] Users can subscribe with Lightning
  - [ ] Access controls enforce membership
- Effort: XL (8hr+)

**[P3-02] Bitcoin Rewards System**
- Description: Award sats for completing journal entries, experiments, streaks
- Audit Reference: replit.md line 124
- Files: `server/routes.ts`, `shared/schema.ts` (reward tracking)
- Dependencies: P1-02
- Blocked By: Reward rules definition
- Acceptance Criteria:
  - [ ] Sats awarded for daily LOVE Practice
  - [ ] Sats awarded for experiment completion
  - [ ] Streak bonuses calculated
- Effort: L (4-8hr)

**[P3-03] Club-Based Sharing Enforcement**
- Description: Enforce isPrivate and sharedClubs fields on journal entries and notes
- Audit Reference: replit.md line 126, NOT STARTED list
- Files: `server/routes.ts`, `client/src/lib/sharing-rules.ts`
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [ ] Private entries only visible to owner
  - [ ] Shared entries visible to club members
  - [ ] API enforces privacy on all personal data queries
- Effort: M (1-4hr)

**[P3-04] AI Memory System**
- Description: Implement local vector store for AI memory persistence
- Audit Reference: replit.md line 80 (Voy/Orama)
- Files: Create `client/src/lib/ai-memory.ts`
- Dependencies: P2-01, P2-02
- Blocked By: Embedding model selection
- Acceptance Criteria:
  - [ ] Vector store initialized in browser
  - [ ] User interactions embedded and stored
  - [ ] AI context retrieves relevant memories
- Effort: XL (8hr+)

### PHASE 4: ADMIN & OPERATIONS

**[P4-01] Admin Role Check for Experiments**
- Description: Add admin check for experiment creation
- Audit Reference: TODO in server/routes.ts:288
- Files: `server/routes.ts`, `server/auth.ts`
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [ ] Only admin users can create experiments
  - [ ] Admin check uses VITE_ADMIN_NPUB
- Effort: S (under 1hr)

**[P4-02] Admin Dashboard Enhancements**
- Description: Enhance admin pages for content management
- Audit Reference: Existing admin pages at /admin/onboarding, /admin/mentor
- Files: `client/src/pages/admin/`
- Dependencies: P4-01
- Blocked By: None
- Acceptance Criteria:
  - [ ] Admin can manage experiments
  - [ ] Admin can manage events
  - [ ] Admin can view user stats
- Effort: M (1-4hr)

### PHASE 5: HARDENING & CODE HEALTH

**[P5-01] Remove Mock Data Dependencies**
- Description: Eliminate all mock-data.ts imports in production code
- Audit Reference: Code health - mock data usage
- Files: All files importing from mock-data.ts
- Dependencies: P1-03
- Blocked By: None
- Acceptance Criteria:
  - [ ] No components use CURRENT_USER
  - [ ] All data comes from API or context
- Effort: M (1-4hr)

**[P5-02] Error Boundary Implementation**
- Description: Add error boundaries to catch and display errors gracefully
- Files: Create `client/src/components/error-boundary.tsx`, wrap routes
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [ ] Errors don't crash entire app
  - [ ] User sees friendly error message
- Effort: S (under 1hr)

**[P5-03] API Error Handling Improvements**
- Description: Standardize error responses and add retry logic
- Files: `client/src/lib/api.ts`, `client/src/lib/queryClient.ts`
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [ ] Consistent error message format
  - [ ] Failed requests retry appropriately
- Effort: S (under 1hr)

### PHASE 6: TESTING & DOCUMENTATION

**[P6-01] E2E Test Suite**
- Description: Create Playwright tests for critical user flows
- Files: Create `tests/` directory
- Dependencies: All core features complete
- Blocked By: None
- Acceptance Criteria:
  - [ ] Login flow tested
  - [ ] Journal entry creation tested
  - [ ] Big Dreams flow tested
- Effort: L (4-8hr)

**[P6-02] API Documentation**
- Description: Document all API endpoints
- Files: Create `docs/api.md`
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [ ] All endpoints documented
  - [ ] Request/response schemas included
- Effort: M (1-4hr)

---

## COMPLETED TASKS

*None yet - ready to begin Phase 1*

---

## CURRENT FOCUS

- **Active:** GAP Analysis Complete
- **Started:** 2026-01-26
- **Notes:** Ready to begin GO phase execution

---

## BLOCKED ITEMS

| Task | Blocker | What's Needed |
|------|---------|---------------|
| P1-01 | API Key | OPENROUTER_API_KEY secret required |
| P1-02 | Connection String | NWC_CONNECTION_STRING or user wallet connection |

---

## UP NEXT QUEUE

1. [P1-01] OpenRouter AI Integration Setup (BLOCKED: needs OPENROUTER_API_KEY)
2. [P1-02] Lightning/NWC Integration Setup (BLOCKED: needs NWC_CONNECTION_STRING)
3. [P2-01] Magic Mentor AI Chat Backend
4. [P2-02] AI Chat Frontend UI
5. [P2-05] NIP-46 Login Support

---

## DECISIONS LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-26 | Prioritize mock data removal before AI integration | Real user data needed for AI context |
| 2026-01-26 | Lightning integration via NWC over WebLN | NWC provides better cross-wallet compatibility |

---

## KNOWN ISSUES

| Issue | Impact | Priority |
|-------|--------|----------|
| AI Buddy shows mock quotes/dreams | Low - cosmetic | Medium |
| Wallet balance is hardcoded | Medium - misleading | High |

---

## CONTEXT NOTES

- **Auth Pattern**: Nostr pubkey stored in localStorage, sent as x-nostr-pubkey header
- **API Base**: All routes under /api/, server on port 5000
- **Component Style**: shadcn/ui with Tailwind, purple gradient theme
- **Database**: PostgreSQL via Neon, Drizzle ORM, schema in shared/schema.ts
- **State**: TanStack Query for server state, React context for auth
- **Mobile First**: Bottom nav with 6 icons, compact header

---

## PENDING SECRETS

| Env Var | Service | Where Used | Status |
|---------|---------|------------|--------|
| OPENROUTER_API_KEY | OpenRouter AI | server/openrouter.ts (to create) | Not Set |
| NWC_CONNECTION_STRING | Lightning Wallet | client/src/lib/nwc.ts (to create) | Not Set |
| VITE_ADMIN_NPUB | Admin Access | client/src/contexts/nostr-context.tsx | Not Set |

---

## DEPENDENCY GRAPH

```
Phase 1 (Infrastructure)
├── P1-05 Database Seed Verify ─────┐
│                                   │
├── P1-03 API Endpoints ────────────┼──► P1-04 Replace Mock Data
│                                   │
├── P1-01 OpenRouter Setup ─────────┼──► Phase 2 (AI Features)
│                                   │    ├── P2-01 AI Backend (needs P1-01)
├── P1-02 NWC Setup ────────────────┼──► ├── P2-02 AI Frontend (needs P2-01)
│                                   │    ├── P2-03 Zap Integration (needs P1-02)
│                                   │    ├── P2-04 Wallet Transactions (needs P1-02)
│                                   │    └── P2-05 NIP-46 Login (independent)
│                                   │
└───────────────────────────────────┘    Phase 3 (Build-Out)
                                         ├── P3-01 Memberships (needs P2-03)
                                         ├── P3-02 Rewards (needs P1-02)
                                         ├── P3-03 Sharing Enforcement
                                         └── P3-04 AI Memory (needs P2-01)
```

---

## PARALLEL OPPORTUNITIES

These tasks can be worked simultaneously:
- P1-01 + P1-02 + P1-05 (all infrastructure setup, independent)
- P1-03 can start parallel with P1-01/P1-02 (API endpoints independent of external integrations)
- P2-01 + P2-05 (AI backend and NIP-46 login are independent)
- P3-03 Club Sharing can run parallel with P3-01/P3-02 (no dependencies)
- P5-01 + P5-02 + P5-03 (all hardening tasks independent)

Note: P1-04 (Replace Mock Data) depends on P1-03 (API Endpoints) - must be sequential

---

## ESTIMATED TIMELINE

| Phase | Effort Hours | Cumulative |
|-------|--------------|------------|
| Phase 1 | 8-12 hrs | 8-12 hrs |
| Phase 2 | 16-24 hrs | 24-36 hrs |
| Phase 3 | 20-28 hrs | 44-64 hrs |
| Phase 4 | 4-6 hrs | 48-70 hrs |
| Phase 5 | 4-6 hrs | 52-76 hrs |
| Phase 6 | 8-12 hrs | 60-88 hrs |

**Total Estimated:** 60-88 hours of development work

---

## RISK FLAGS

| Task | Risk | Mitigation |
|------|------|------------|
| P1-02 NWC Setup | NWC protocol complexity | Start with simple invoice generation |
| P2-05 NIP-46 | Less documented than NIP-07 | Test with multiple bunker providers |
| P3-03 AI Memory | Browser storage limits | Implement pruning strategy early |
