# PROJECT MANIFEST

**Last Updated:** 2026-01-26
**Current Phase:** Phase 3 - Feature Build-Out
**Active Task:** Core Feature Completion Done - Ready for Community Features

---

## PROGRESS SUMMARY

| Metric | Count |
|--------|-------|
| Total Features Specified | 32 |
| Complete | 28 (88%) |
| Partial | 1 (3%) |
| Not Started | 3 (9%) |
| Code Health Issues | 1 |

---

## EXECUTIVE SUMMARY

1. **Core app structure is solid** - Full CRUD backend, PostgreSQL database with 12 tables, Nostr authentication working
2. **Frontend is well-built** - 22 pages/routes, shadcn/ui components, mobile-responsive layout, proper routing
3. **AI Magic Mentor COMPLETE** - Claude Haiku 4.5 via direct Anthropic SDK, three-tier access (free/paid/BYOK)
4. **Lightning payments COMPLETE** - NWC integration for zaps and wallet, non-custodial user wallets
5. **NIP-46 Bunker Login COMPLETE** - nsec.app integration for users without browser extensions
6. **Mock data removed** - Components now use real authenticated user data

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

### COMPLETE (28 Features)

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
| Magic Mentor AI | `server/anthropic.ts`, `client/src/components/ai-buddy.tsx` | 100% | Claude Haiku 4.5, three-tier access, two-phase atomic transactions |
| AI Usage Tracking | `shared/schema.ts`, `server/storage.ts` | 100% | ai_usage_logs table, token tracking per user |
| Wallet Page | `/wallet`, `client/src/pages/wallet.tsx` | 100% | UI layout, ZBD gamertag input, balance display from real user data |
| Lightning/NWC Integration | `client/src/lib/nwc.ts`, `client/src/pages/wallet.tsx` | 100% | Non-custodial user wallet connection, real balance, payments |
| Zap Payments | `client/src/components/feed-post.tsx`, `client/src/lib/nwc.ts` | 100% | LNURL-pay, BOLT11 payment hash extraction, graceful fallback |
| NIP-46 Bunker Login | `client/src/contexts/nostr-context.tsx`, `client/src/components/nostr-login-dialog.tsx` | 100% | nsec.app integration, bunker connection flow, session persistence |

### PARTIAL (1 Feature)

| Feature | What Exists | What's Missing | Completion |
|---------|-------------|----------------|------------|
| NIP-07 Nostr Login | Extension-based auth, localStorage persistence | NDK library, cryptographic signature verification, event signing validation | 70% |

### NOT STARTED (3 Features)

| Feature | Specified In | Priority | Dependencies |
|---------|--------------|----------|--------------|
| Club-Based Sharing Enforcement | replit.md line 126 | HIGH | isPrivate/sharedClubs fields exist but not enforced |
| Community Membership System | replit.md line 123 | MEDIUM | Payment integration, user roles |
| User Personalization | replit.md line 125 | MEDIUM | Spotify API, podcast RSS parser |

---

## CODE HEALTH METRICS

### Issues Found

| Issue | Location | Severity |
|-------|----------|----------|
| No cryptographic signature verification | `client/src/contexts/nostr-context.tsx` | HIGH |
| TODO: Admin check for experiments | `server/routes.ts:288` | LOW |

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
- Database fully provisioned with 12 tables (verified)
- AI Magic Mentor uses two-phase atomic transactions for concurrency safety
- AI prompt injection protection via XML delimiters
- Three-tier AI access control (free/paid/BYOK) with row-level locks

---

## PHASE STATUS

| Phase | Name | Total Tasks | Completed | Status |
|-------|------|-------------|-----------|--------|
| 0 | Critical Blockers | 0 | 0 | Complete |
| 1 | Infrastructure & Integrations | 5 | 5 | Complete |
| 2 | Core Feature Completion | 5 | 5 | Complete |
| 3 | Feature Build-Out | 5 | 0 | Not Started |
| 4 | Admin & Operations | 2 | 0 | Not Started |
| 5 | Hardening & Code Health | 3 | 0 | Not Started |
| 6 | Testing & Documentation | 2 | 0 | Not Started |

---

## PHASED TASK LIST

### PHASE 0: CRITICAL BLOCKERS
*None identified - app is functional for core features*

### PHASE 1: INFRASTRUCTURE & INTEGRATIONS

**[P1-01] AI Magic Mentor Integration** ✅ COMPLETE
- Description: Set up direct Anthropic SDK for Magic Mentor AI with Claude Haiku 4.5
- Audit Reference: replit.md AI Integration section
- Files: `server/anthropic.ts`, `server/routes.ts`, `shared/schema.ts`, `client/src/components/ai-buddy.tsx`
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [x] Anthropic SDK configured with ANTHROPIC_API_KEY from env
  - [x] Claude Haiku 4.5 model hardcoded (NOT configurable)
  - [x] Two-phase atomic transactions for concurrency safety
  - [x] Three-tier access: Free (5 msg/day), Paid (token balance), BYOK
  - [x] ai_usage_logs table for token tracking
  - [x] XML delimiters for prompt injection protection
- Effort: L (4-8hr)
- Completed: Jan 2026

**[P1-02] Lightning/NWC Integration Setup** ✅ COMPLETE
- Description: Set up Nostr Wallet Connect for Lightning payments
- Audit Reference: replit.md line 78 (Payments: Lightning WebLN/NWC)
- Files: `client/src/lib/nwc.ts`, `client/src/pages/wallet.tsx`
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [x] NWC connection can be established (user pastes their own connection string)
  - [x] Balance can be read from connected wallet
  - [x] Payment requests can be generated
  - [x] LNURL-pay invoice fetching from Lightning addresses
  - [x] Payment hash extraction from BOLT11 invoices
- Effort: L (4-8hr)
- Completed: Jan 2026

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

**[P2-01] Magic Mentor AI Chat Backend** ✅ COMPLETE
- Description: Build API endpoint that sends user messages to Anthropic Claude and returns AI responses
- Audit Reference: Partial feature - Magic Mentor AI
- Files: `server/routes.ts` (POST /api/ai/chat), `server/anthropic.ts`, `client/src/lib/api.ts`
- Dependencies: P1-01
- Blocked By: None
- Acceptance Criteria:
  - [x] POST /api/ai/chat endpoint accepts message and returns AI response
  - [x] Two-phase atomic: reserve slot/tokens → AI call → finalize/rollback
  - [x] User's journal entries/dreams/profile included in context
  - [x] Row-level locks prevent concurrent usage violations
- Effort: L (4-8hr)
- Completed: Jan 2026

**[P2-02] Magic Mentor Frontend Integration** ✅ COMPLETE
- Description: Connect AI Buddy component to real AI backend
- Audit Reference: Partial feature - Magic Mentor AI
- Files: `client/src/components/ai-buddy.tsx`
- Dependencies: P2-01, P1-03
- Blocked By: None
- Acceptance Criteria:
  - [x] Send button triggers API call
  - [x] AI responses display in chat
  - [x] Loading state while waiting for response
  - [x] Error handling for failed requests
  - [x] Usage limit display for free tier
- Effort: M (1-4hr)
- Completed: Jan 2026

**[P2-03] Zap Payment Integration** ✅ COMPLETE
- Description: Connect zap buttons to real NWC payments
- Audit Reference: Partial feature - Zap/Lightning UI
- Files: `client/src/components/feed-post.tsx`, `client/src/lib/nwc.ts`
- Dependencies: P1-02
- Blocked By: None
- Acceptance Criteria:
  - [x] Zap button triggers NWC payment (when wallet connected & recipient has lud16)
  - [x] Payment confirmation updates UI with Lightning toast
  - [x] Failed payments show error
  - [x] Graceful fallback to database-only recording if no wallet/lud16
- Effort: M (1-4hr)
- Completed: Jan 2026

**[P2-04] Wallet Lightning Integration** ✅ COMPLETE
- Description: Connect wallet page to real Lightning transactions via NWC
- Audit Reference: Partial feature - Wallet Page
- Files: `client/src/pages/wallet.tsx`, `client/src/lib/nwc.ts`
- Dependencies: P1-02
- Blocked By: None
- Acceptance Criteria:
  - [x] Balance reflects NWC wallet balance (real-time from connected wallet)
  - [x] Connect wallet UI with NWC string input
  - [x] Transaction history display
- Effort: L (4-8hr)
- Completed: Jan 2026

**[P2-05] NIP-46 Bunker Login** ✅ COMPLETE
- Description: Enable NIP-46 bunker login for maximum security
- Audit Reference: Partial feature - NIP-46 Bunker Login
- Files: `client/src/components/nostr-login-dialog.tsx`, `client/src/contexts/nostr-context.tsx`
- Dependencies: None
- Blocked By: None
- Acceptance Criteria:
  - [x] Bunker button enabled
  - [x] Can connect via nsec.app or nsecBunker
  - [x] Auth flow completes and persists
  - [x] Create New Account option links to nsec.app
- Effort: L (4-8hr)
- Completed: Jan 2026

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

### January 2026

**[P1-01] AI Magic Mentor Integration** - Complete Anthropic SDK setup with Claude Haiku 4.5
- Two-phase atomic transactions with row-level locks
- Three-tier access control (free/paid/BYOK)
- ai_usage_logs table for token tracking
- XML delimiters for prompt injection protection

**[P2-01] Magic Mentor AI Chat Backend** - POST /api/ai/chat endpoint
- User context injection (profile, journal, dreams)
- Token reservation before AI call
- Graceful rollback on failure

**[P2-02] Magic Mentor Frontend Integration** - AI Buddy component connected
- Real-time chat interface
- Loading states and error handling
- Usage limit display

**[P1-03] Add Missing API Endpoints** - User data endpoints ready

**[P1-04] Replace Mock User Data** - Components use real authenticated data

**[P1-05] Database Seed Verification** - All tables verified working

**[P1-02] Lightning/NWC Integration** - Non-custodial wallet connection
- User pastes their own NWC connection string
- Real wallet balance display
- LNURL-pay invoice fetching

**[P2-03] Zap Payment Integration** - Real Lightning payments
- Zap buttons trigger NWC payments when wallet connected
- BOLT11 payment hash extraction for tracking
- Graceful fallback to database recording

**[P2-04] Wallet Lightning Integration** - Full wallet page
- Connect/disconnect wallet UI
- Real-time balance from connected wallet

**[P2-05] NIP-46 Bunker Login** - nsec.app integration
- Bunker button enabled with URL input
- BunkerSigner via nostr-tools NIP-46 module
- Session persistence for reconnection
- Create New Account option for new users

---

## CURRENT FOCUS

- **Active:** NIP-46 Bunker Login Complete - Ready for Club Sharing or Community Features
- **Started:** 2026-01-26
- **Notes:** NIP-46 bunker login working via nsec.app. Users can connect without browser extension. Session persists across page reloads.

---

## BLOCKED ITEMS

| Task | Blocker | What's Needed |
|------|---------|---------------|
| None | - | All blockers resolved |

---

## UP NEXT QUEUE

1. [P3-03] Club-Based Sharing Enforcement
2. [P3-01] Community Membership System
3. [P3-02] Bitcoin Rewards System
4. [P3-04] AI Memory System

---

## DECISIONS LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-26 | Use direct Anthropic SDK instead of OpenRouter | Better control, simpler setup, BYOK support |
| 2026-01-26 | Hardcode Claude Haiku 4.5 model | Per spec, fastest model, no user override |
| 2026-01-26 | Two-phase atomic transactions for AI usage | Prevents race conditions and wasted API costs |
| 2026-01-26 | Token reservation before AI call | Paid tier reserves tokens upfront, refunds on failure |
| 2026-01-26 | XML delimiters in AI prompts | Defense against prompt injection attacks |
| 2026-01-26 | Lightning integration via NWC over WebLN | NWC provides better cross-wallet compatibility |
| 2026-01-26 | Non-custodial wallets (user provides NWC) | No app-wide wallet needed, users control their own funds |
| 2026-01-26 | LNURL-pay for invoice generation | Standard protocol, works with any Lightning address |
| 2026-01-26 | Graceful fallback for zaps | If no wallet/lud16, record in database only |
| 2026-01-26 | NIP-46 via nostr-tools BunkerSigner | Built-in support in nostr-tools v2, no extra dependency |
| 2026-01-26 | Store bunker session in localStorage | Ephemeral key is safe to store, user's nsec stays in bunker |

---

## KNOWN ISSUES

| Issue | Impact | Priority |
|-------|--------|----------|
| None currently | - | - |

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
| ANTHROPIC_API_KEY | Anthropic AI | server/anthropic.ts | ✅ Set |
| NWC_CONNECTION_STRING | Lightning Wallet | client/src/lib/nwc.ts (to create) | Not Set |
| VITE_ADMIN_NPUB | Admin Access | client/src/contexts/nostr-context.tsx | Not Set |
| FREE_TIER_DAILY_LIMIT | AI Usage | server/routes.ts | Optional (default: 5) |

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
| P3-03 AI Memory | Browser storage limits | Implement pruning strategy early |
| P3-01 Community Memberships | Payment/subscription complexity | Start with simple one-time payments |
