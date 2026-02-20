# Session Notes — My Masterpiece App

> **Single source of truth for session history. See replit.md for the full spec and design rules.**

---

## Project Status Summary

**Platform:** Replit (full-stack React + Express + PostgreSQL + Nostr)
**AI Model:** Claude Opus 4.6 (both planning and building)
**GitHub:** https://github.com/DJValerieBLOVE/my-love-replit.git
**Shakespeare Reference:** https://github.com/DJValerieBLOVE/11xLOVE-LaB.git

---

## What's Built (This Replit Project)

### Core Infrastructure
- React 18 + TypeScript + Tailwind CSS v4 + shadcn/ui
- Express backend with PostgreSQL (Drizzle ORM)
- Wouter routing, TanStack React Query, Framer Motion
- Monorepo: client/ + server/ + shared/

### Authentication
- NIP-07 Nostr Login (browser extensions: Alby, nos2x)
- NIP-46 Bunker Login (remote signer via nsec.app, persistent sessions)
- Nostr pubkey linked to database users
- Mandatory email collection after login (ProfileCompletionDialog)

### Pages & Features
- **Home** (/): Prosperity Pyramid with flip card animations (5 areas + center God heart)
- **Big Dreams** (/big-dreams): Primary daily hub/dashboard with Daily LOVE Practice CTA, GitHub-style streak grid, experiment progress, events, and 11 Big Dreams editor
- **Daily LOVE Practice** (/daily-practice): Full-page wizard with morning/evening reflections. Hidden from nav - accessible from Big Dreams only
- **Experiments** (/experiments): 6 tabs (In Progress, My Experiments, New, All, Suggested, Complete) - experiment listing and discovery
- **Events** (/events): 4 tabs (Upcoming, Nearby, Past, Yours) - calendar view with event cards
- **Tribe/Community** (/community): Listing, create, detail, admin pages with roles
- **Vault** (/vault): 6 tabs (Daily LOVE, Journal, Bookmarks, Assessments, Music & Meditations, Library)
- **Love Board** (/leaderboard): Rankings with real data (planned: marketplace)
- **Feed** (/feed): Nostr social feed with Following, Tribes, Buddies, Trending tabs
- **Profile** (/profile/:id): Clean Primal-style - no gamification (no XP, levels, badges)
- **Creator Dashboard** (/creator): Analytics for experiment/course creators
- **Settings** (/settings): User preferences
- **Wallet** (/wallet): Lightning wallet with NWC integration
- **Relays** (/relays): Relay management

### Content Creation Tools
- **Experiment Builder** (/experiment-builder): Step builder with day assignments
- **Course Builder** (/course-builder): Full course creation with lessons (legacy)
- **Post Composer**: Create posts with image/GIF/video upload, media preview
- **Course Comments**: Discussion section on courses

### Social Features
- Share to Nostr (Big Dreams, Journal, Experiments)
- Social Post Actions (Reply, Repost, Zap, Like, Bookmark, Share)
- Sharing Privacy Rules (group content stays private unless own post)
- External Sharing (X/Twitter, Facebook, copy link)
- Notification dots on nav items

### AI (Magic Mentor)
- Claude Haiku 4.5 integration working
- System prompt with user context (profile, journal, dreams)
- XML security for prompt injection protection
- Three-tier access: Free (5 msgs/day), Paid (token balance), BYOK
- Two-phase atomic token tracking with row-level locks
- Floating sparkles button (bottom-right, mobile-friendly)

### Design System (Standardized Feb 2026)
- All tabs use consistent rounded-full pill bubble style across all pages
- Active tab: bg-foreground text-background border-foreground
- Inactive tab: bg-white text-muted-foreground border-gray-200 hover:border-gray-400
- Search inputs: bg-white consistently across all pages
- Sidebar nav: white background, purple text on hover/active, no background highlight
- Cards: border-none shadow-sm bg-card rounded-xs, 16:9 images, thin purple top accent
- NO gamification anywhere in Profile page

---

## What's Built (Shakespeare Project — Reference Only)

These features exist in the Shakespeare/11xLOVE-LaB GitHub repo and are candidates for integration:

### Working Features (Port to This Project)
- **useEncryptedStorage hook** — NIP-44 encryption for private data with plaintext fallback
- **useLabPublish / useLabOnlyPublish hooks** — Smart relay routing (private vs public)
- **Primal WebSocket client** — Fast feed loading with zlib compression, 40+ custom kinds, link preview cards
- **useBigDreams hook** — Real Nostr integration, one kind 30078 event per dimension, NIP-44 encrypted
- **Two-path onboarding modal** — Quick Start (simple Big Dreams input) vs Deep Dive (full curriculum)
- **Feed system** — 3 tabs (Latest, Tribes, Buddies), mixed public/private with privacy badges
- **Moderation** — Mute, report, admin tools

### Documentation (Already Incorporated into replit.md)
- 6-tier membership system (Free through Creator BYOK)
- 18-lesson 11x LOVE Code curriculum
- Dream Sheet journal templates
- AI Memory System architecture (4-layer caching, 90% cost savings)
- BYOK architecture (encrypted API key storage)
- FCLADDD villains framework
- SNAP! engine
- MEhD framework
- Three-tier privacy system
- Dual-relay architecture specs
- Nostr event schemas (kinds, d-tags, encryption)

---

## Primal Integration Notes

**What Primal provides (use their API, don't run their server):**
- Primal web app is SolidJS (NOT React) — can't copy components directly
- Primal server is Julia — complex to self-host
- Connect to Primal's public caching service via WebSocket
- Shakespeare project already has a working Primal WebSocket client to port
- Handles: stats (likes/reposts/zaps), link previews (kind 10000128), trending posts, profile metadata
- Known issue: Primal has lag by design — supplement with direct relay queries for freshness

---

## Build Roadmap (Phased)

### Phase 1: Nostr Privacy Layer (NEXT PRIORITY)
1. Install NDK + dual-relay architecture (Railway private + public relays)
2. Port useEncryptedStorage (NIP-44 for all personal data)
3. Add BYOK support for Magic Mentor AI
4. Implement 6-tier membership gating

### Phase 2: Core Content
5. Load full 18-lesson curriculum into database
6. Build Dream Sheet journal templates per lesson
7. Add FCLADDD villain tracking + AM/PM structure to Daily LOVE Practice

### Phase 3: User Experience
8. Two-path onboarding (Quick Start / Deep Dive)
9. EQ Visualizer in header + Big Dreams page
10. Streak tracking + milestone celebrations (7/30/90 days)
11. Template system for creators (experiment/event/community)

### Phase 4: Social & Discovery
12. Primal API feed integration
13. Accountability buddies
14. NIP-57 zapping on lessons/posts/tribe messages
15. Admin dashboard with analytics

### Phase 5: Polish
16. AI experiment generation (Bloom's Taxonomy, Creator tier)
17. Mobile PWA (service worker, offline, installable)
18. SEO files (robots.txt, llms.txt, sitemap.xml)

---

## Session History

### Session: February 20, 2026 (Claude Opus 4.6)

**What Was Done:**
1. Restructured Experiments page: removed "Courses" tab entirely, added 6 experiment-only tabs (In Progress, My Experiments, New, All, Suggested, Complete)
2. Updated sidebar background color to white (#FFFFFF) to match header
3. Removed light purple hover background from sidebar nav - now only purple text on hover/active
4. Standardized ALL tab/bubble styles across Feed, Experiments, Events, and Vault pages
5. Replaced Button-based tabs on Events with rounded-full pill bubbles with active state
6. Replaced shadcn TabsList/TabsTrigger on Vault with rounded-full pill bubbles with active state
7. Standardized all search input backgrounds to bg-white
8. Comprehensive update of replit.md with full Design System documentation
9. Updated SESSION_NOTES.md and PROJECT_MANIFEST.md

**Key Decisions:**
- All page-level tabs must use the same rounded-full pill bubble pattern (not shadcn Tabs)
- Sidebar nav: purple text only on hover/active, NO background highlight
- Search inputs: always bg-white, never bg-background
- "Experiments" is the ONLY term for learning content - no "Courses" tab
- The dark button color is #4D3D5C (foreground variable - Deep Muted Purple)

### Session: February 19, 2026 (Claude Opus 4.6)

**What Was Done:**
1. Profile page simplified to clean Primal-style (removed all gamification: XP, levels, badges, rewards)
2. Big Dreams page rebuilt as primary daily dashboard hub with Daily Practice CTA, GitHub-style streak grid, experiment progress tracking, upcoming events
3. Extracted StreakGrid into shared reusable component (client/src/components/streak-grid.tsx)
4. Removed Daily Practice from navigation menu (both desktop/mobile)
5. Updated replit.md documentation

### Session: February 19, 2026 (Claude Opus 4.6) - Earlier

**What Was Done:**
1. Analyzed Shakespeare/11xLOVE-LaB GitHub repo
2. Analyzed Primal repos
3. Determined integration strategy
4. Comprehensive rewrite of replit.md
5. Created SESSION_NOTES.md
6. Pushed to GitHub for double backup

**Key Decisions:**
- This Replit project is the primary codebase
- Shakespeare's Nostr privacy layer to be ported here
- Primal's API used as data source, not their codebase
- AI model stays Claude Haiku 4.5, with BYOK option
- replit.md serves as equivalent of AGENTS.md

---

## Documentation Map

| File | Purpose | Status |
|------|---------|--------|
| `replit.md` | Complete project spec, design system, architecture (read at start of every session) | Current (Feb 20, 2026) |
| `SESSION_NOTES.md` | This file — project summary, build status, session history | Current (Feb 20, 2026) |
| `PROJECT_MANIFEST.md` | Feature matrix, phase tracking, decisions log | Current (Feb 20, 2026) |
| `shared/schema.ts` | Database schema (Drizzle ORM) | Current |
| `server/routes.ts` | API routes | Current |
| `client/src/App.tsx` | Frontend routes and providers | Current |
| `client/src/index.css` | CSS variables, theme colors, font definitions | Current |

### Shakespeare Reference Docs (GitHub — read-only reference)
| File | Purpose |
|------|---------|
| `PLAN.md` | Full build spec with chunk status |
| `AGENTS.md` | AI rules, Nostr guidelines, commit workflow |
| `SESSION_NOTES.md` | 7 sessions of history |
| `docs/AI-ARCHITECTURE.md` | Magic Mentor AI spec (memory, caching, BYOK) |
| `docs/11x-LOVE-CODE-CURRICULUM.md` | Full 18-lesson curriculum |
| `docs/DREAM-SHEETS.md` | All journal worksheet prompts |

---

**Peace, LOVE, & Warm Aloha**
