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
- **Big Dreams** (/big-dreams): 11 LOVE Code dimension cards
- **Journal** (/journal): Daily LOVE Practice with 3-column layout, AM/PM structure
- **Experiments** (/experiments): Course and experiment tabs with enrollment
- **Events** (/events): Calendar view with event cards
- **Tribe/Community** (/community): Listing, create, detail, admin pages with roles
- **Vault** (/vault): Resources with Lab Notes, My Toolbox, Music & Meditations tabs
- **Love Board** (/leaderboard): Rankings with real data
- **Feed** (/feed): Aggregate posts with source filtering (All, Communities, Learning)
- **Profile** (/profile/:id): Own content view, public profiles
- **Creator Dashboard** (/creator): Analytics for course/experiment creators
- **Settings** (/settings): User preferences
- **Wallet** (/wallet): Lightning wallet placeholder
- **Relays** (/relays): Relay management placeholder

### Content Creation Tools
- **Course Builder** (/course-builder): Full course creation with lessons
- **Experiment Builder** (/experiment-builder): Step builder with day assignments
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

### UI/UX
- Desktop: Left sidebar navigation
- Mobile: Hamburger slide-out menu (web browser pattern)
- EQ Visualizer component (11-bar equalizer)
- Card flip animations with one-at-a-time behavior
- Purple gradient aesthetic (#6600ff to #cc00ff)

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

### Not Built Yet in Either Project
- Magic Mentor AI with memory system (Phase 2 in Shakespeare)
- Streak tracking + daily check-ins
- Accountability buddies
- Full curriculum content loaded
- Admin dashboard
- NIP-29 tribe creation
- Zaps on lessons/tribe messages
- Completion receipts + anti-gaming
- AI experiment generation (Bloom's Taxonomy)
- PWA optimization

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

### Session: February 19, 2026 (Claude Opus 4.6)

**What Was Done:**
1. Analyzed Shakespeare/11xLOVE-LaB GitHub repo (PLAN.md, AGENTS.md, SESSION_NOTES.md, AI-ARCHITECTURE.md, 11x-LOVE-CODE-CURRICULUM.md, DREAM-SHEETS.md, NEXT_SESSION_PROMPT.md)
2. Analyzed Primal repos (primal-web-app = SolidJS, primal-server = Julia + PostgreSQL)
3. Determined integration strategy: Keep Replit as base, port Nostr privacy pieces from Shakespeare, use Primal API (don't run their server)
4. Comprehensive rewrite of replit.md incorporating ALL specifications from both projects
5. Created SESSION_NOTES.md (this file) — project summary with build status and roadmap
6. Pushed to GitHub for double backup

**Key Decisions:**
- This Replit project is the primary codebase (has backend + database + AI that Shakespeare lacks)
- Shakespeare's Nostr privacy layer (encryption, relay routing, Primal client) to be ported here
- Primal's API used as a data source, not their codebase (SolidJS, incompatible with React)
- AI model stays Claude Haiku 4.5 (already working), with BYOK option for users
- replit.md serves as the equivalent of AGENTS.md (read at start of every session)

---

## Documentation Map

| File | Purpose | Status |
|------|---------|--------|
| `replit.md` | Complete project spec, design rules, architecture, roadmap (equivalent of AGENTS.md) | Current |
| `SESSION_NOTES.md` | This file — project summary, build status, session history | Current |
| `shared/schema.ts` | Database schema (Drizzle ORM) | Current |
| `server/routes.ts` | API routes | Current |
| `client/src/App.tsx` | Frontend routes and providers | Current |

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
