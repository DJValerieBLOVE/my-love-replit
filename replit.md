# My Masterpiece App

## Overview
**My Masterpiece** is a spiritual personal growth app where users design their own dashboard, consume courses/podcasts/music in one place, connect with collaborators, journal privately, and get coached by an AI that remembers them forever — powered by a hybrid Nostr + Database architecture with Lightning payments for peer-to-peer zapping.

**One-Liner:** Notion + Obsidian + Mighty Networks + Spotify + Nostr + Lightning + AI Coach + Pinterest Vision Board = My Masterpiece

**11x LOVE LaB** is a community INSIDE this app (not the app name itself). LaB = "Lessons and Blessings" (capital L, lowercase a, capital B).

## Terminology (USE THESE — NOT Alternatives)

| Correct Term | Do NOT Use |
|---|---|
| **Experiments** | Courses, lessons, modules |
| **Tribes** | Communities, groups |
| **Big Dream** | Goal |
| **Sats** | Points, coins |
| **Zap** | Tip, donate |
| **Bitcoin** | Crypto |
| **Membership** | Subscription |
| **Value for Value (V4V)** | Free |
| **LaB** (capital L, lowercase a, capital B) | Lab, LAB |
| **LOVE** (always capitalized) | Love, love |
| **Daily LOVE Practice** | Daily practice, check-in |
| **Magic Mentor** | AI assistant, chatbot |
| **Prosperity Pyramid** | Dashboard, homepage |
| **Dream Sheets** | Worksheets, forms |
| **Vault** | Library, saved items |
| **Love Board** | Leaderboard |
| **EQ Visualizer** | Progress bars |
| **SNAP!** | Start, begin |

## User Preferences
- Preferred communication style: Simple, everyday language
- Daily LOVE Practice is the MOST IMPORTANT feature (LOVE always capitalized)
- Sparkles icon ONLY for Magic Mentor AI - no other usage
- NO colored icons anywhere - all icons use muted-foreground color
- Hover interactions use light purple (#F0E6FF), never blue
- All colors solid hex, no opacity values
- Privacy-first: entries default to private, optional sharing

## Design Rules (MANDATORY)

### Font Rules
- Marcellus font, weight 400 ONLY
- NEVER use font-bold, font-semibold, or font-medium
- If emphasis needed, use font size, letter-spacing, or color — never weight

### Color Rules
- Purple #6600ff is the brand color for ALL buttons, links, tabs, accents
- Purple gradient: from #6600ff to #9900ff (or to #cc00ff)
- Pink #eb00a8 is ONLY for GOD/LOVE dimension — NEVER as brand accent
- All colors solid hex, no opacity values

### 11 LOVE Code Dimension Colors
- 1 GOD/LOVE: #eb00a8 (Hot Pink — dimension color ONLY, not brand)
- 2 Soul: #cc00ff (Magenta)
- 3 Mind: #9900ff (Purple)
- 4 Body: #6600ff (Purple — also PRIMARY BRAND COLOR)
- 5 Romance: #e60023 (Red)
- 6 Family: #ff6600 (Orange)
- 7 Community: #ffdf00 (Yellow)
- 8 Mission: #a2f005 (Lime Green)
- 9 Money: #00d81c (Matrix Green)
- 10 Time: #00ccff (Cyan)
- 11 Environment: #0033ff (Blue)

### Visual Style
- Purple gradient aesthetic (#6600ff to #cc00ff)
- Prosperity Pyramid homepage with 5 areas (Health, People, Purpose, Wealth) + center God heart
- Left navigation sidebar (desktop only), top header
- All cards use rounded-xs (extra small corners)
- Card flip animations with one-at-a-time behavior
- Flipped card backs have light background (#FAF8F5), not purple

### Mobile Design
- Header: Compact (56px), smaller EQ logo (40px)
- Navigation: Hamburger menu (top-left) with slide-out drawer
- Cards: Taller (200px min), 4:3 aspect ratio, drop-shadow text, rounded-xs
- Login: "Login" button text (not "Sign In")
- AI button: Bottom-right corner, above content

## Privacy Architecture

### Three-Tier Privacy System
- NEVER SHAREABLE: Tribe messages (NIP-29 group events), encrypted, no share button
- PRIVATE BY DEFAULT: Big Dreams, Journals, Daily Practice, AI Conversations (Kind 30078, NIP-44 encrypted), optional sharing with warning dialog
- SHAREABLE: Completions, Feed Posts (Kind 1 notes, reactions), user chooses

### Dual-Relay Architecture
- Private Railway Relay (wss://nostr-rs-relay-production-1569.up.railway.app): All LaB data, NIP-42 whitelist auth. Admin pubkey: 3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767
- Public Relays (read-only): wss://relay.primal.net, wss://relay.damus.io, wss://relay.ditto.pub for profiles, follows, public posts, reactions, zaps

### BYOK (Bring Your Own Key) for AI
- Users provide their own API key (Anthropic or OpenRouter)
- Key encrypted with user's Nostr pubkey, stored in browser only
- AI calls go directly from browser to provider, billed to user

## Membership Tiers (6 Tiers)

| Tier | Price | Features |
|---|---|---|
| Free | $0 | Browse catalog, read experiments (after login), zap and share |
| Core | $11/mo | Progress tracking, comments, tribes, vault, Love Board, Magic Mentor AI (shared key, 2M tokens) |
| Core Annual | $99/yr | Everything Core + create tribes |
| Creator | $25/mo | Create experiments, analytics dashboard (10M tokens) |
| Creator Annual | $199/yr | Everything Creator + create tribes |
| Creator BYOK | $11/mo or $99/yr | Uses user's OWN API key — unlimited AI |

## Core Frameworks

### The Prosperity Pyramid
Organizes life into 11 Dimensions across 5 macro-categories with GOD at center:
- GOD (Center/Heart): Spirituality, LOVE
- PURPOSE: Mission — IKIGAI
- HEALTH: Body, Mind, Soul
- PEOPLE: Romance, Family, Community
- WEALTH: Money, Time, Environment

### FCLADDD Villains Framework
7 villains: Fear, Confusion, Lies, Apathy, Disconnection, Distraction, Drifting.
Villain Roots: Trauma, Biochemistry, Under-resourced, Wrong People/Places/Things, Lack of Clarity, Lack of Practice, Lack of Tools.
Magic Mentor AI tracks villain patterns and suggests antidotes.

### SNAP! Engine
Powers every module. Start Now — A and P change per module:
- Intro: Allow Pause
- Module 1 BREAKTHROUGH: Align Purpose
- Module 2 BREAKDOWN: Assess Problem
- Module 3 BRAVERY: Activate Power
- Module 4 BUILD: Awaken Possibilities
- Module 5 BADASSERY: Achieve Progress

### MEhD Framework
Master of Education on Yourself. 4 Pillars: NEEDS, VALUES, DESIRES, BELIEFS.

### Daily LOVE Practice (5 V's)
Morning: VIBE, VISION, VALUE, VILLAIN, VICTORY
Evening LaB Reflection: CELEBRATIONS, LESSONS, BLESSINGS, DREAM VIBES
Stored: kind 30078, d-tag = daily-practice-YYYY-MM-DD, NIP-44 encrypted

## 11x LOVE Code Curriculum (18 Lessons)

Module 0 BELIEVE: 0.1 Human Operating System, 0.2 Why Badasses SNAP!, 0.3 You Are Not Alone
Module 1 BREAKTHROUGH: 1.1 Identity (Rockstar DJ Superhero), 1.2 Know Thyself (MEhD), 1.3 Life Mission (Ikigai)
Module 2 BREAKDOWN: 2.1 Reconnect to LOVE, 2.2 11x LOVE Life Audit, 2.3 1st Obituary
Module 3 BRAVERY: 3.1 Soul Contract, 3.2 Cosmic Council and Vibe Tribe, 3.3 Fabulous Freedom Funeral
Module 4 BUILD: 4.1 Vision Board on Steroids, 4.2 Treasure Map, 4.3 2nd Obituary (Dream Destiny)
Module 5 BADASSERY: 5.1 Daily 5 V's Practice, 5.2 Belong and Buddy, 5.3 4 C's of Progress + Write Your Code
BONUS: Treasure Chest — Micro-practices, playlists, journals

Each lesson: 5-min video + concept + action + quiz + Dream Sheet journal prompt. Sequential unlock.

Key Dream Sheets: 0.1 Rate 11 dimensions, 1.1 Rockstar Identity, 1.2 MEhD worksheet, 1.3 Ikigai, 2.2 Life Audit, 2.3 1st Obituary, 4.1 Vision Board (Must-Haves/Nice-to-Haves/Dealbreakers for all 11 dims), 4.3 2nd Obituary, 5.3 Capstone 11x LOVE Code.

Two-Path Onboarding: Quick Start (simple Big Dreams per dimension) vs Deep Dive (full curriculum). Deep Dive overwrites Quick Start.

## System Architecture

### Frontend Architecture
- Framework: React 18 with TypeScript
- Routing: Wouter
- State Management: TanStack React Query
- Styling: Tailwind CSS v4 with custom theme variables
- UI Components: shadcn/ui (New York style) with Radix UI primitives
- Animations: Framer Motion
- Build Tool: Vite

### Backend Architecture
- Runtime: Node.js with Express
- Language: TypeScript (ESM modules)
- API Pattern: RESTful JSON APIs under /api/*
- Database ORM: Drizzle ORM with PostgreSQL dialect
- Database: PostgreSQL (Neon serverless)

### Data Storage (Hybrid Architecture)
- PostgreSQL: Course/experiment content, community structure, membership tiers, public data, user accounts, AI usage logs
- Nostr Private Relay: Encrypted personal data (Big Dreams, journals, daily practice, AI conversations, tribe messages)
- User's Nostr Key: Encrypts/decrypts personal data using NIP-44
- Schema Location: shared/schema.ts
- Nostr Event Schemas: Big Dreams (kind 30078, d-tag big-dream-{1-11}), Daily Practice (kind 30078, d-tag daily-practice-YYYY-MM-DD), Lab Notes (kind 30023), Streak Data (kind 30078, d-tag streak-data), AI Conversations (kind 30078, d-tag magic-mentor-history), Experiment Progress (kind 30078), Mute Lists (kind 10000), Reports (kind 1984). All personal data NIP-44 encrypted.

### AI Integration (Magic Mentor)
- Model: Claude Haiku 4.5 (hardcoded)
- SDK: Direct Anthropic SDK
- Location: server/anthropic.ts
- Context: System prompt includes user profile, journal entries, dreams
- Security: XML delimiters + user input wrapping for prompt injection protection
- Access: Free (5 msgs/day), Paid (token balance with atomic 2-phase locking), BYOK (user's own key)
- AI Memory System (planned): Layer 1 System instructions (cached), Layer 2 User profile/dreams (cached until updated), Layer 3 Recent activity/journals (cached until new entries), Layer 4 Fresh message (never cached). 90% cost savings via prompt caching.

## Key Features Already Built

### Authentication
- NIP-07 Nostr Login (Alby, nos2x browser extensions)
- NIP-46 Bunker Login (nsec.app remote signer, persistent sessions)
- Nostr pubkey linked to database users
- Mandatory email collection (ProfileCompletionDialog)

### Pages and Features
- Home: Prosperity Pyramid with flip card animations
- Big Dreams: 11 LOVE Code dimension cards
- Journal: Daily LOVE Practice with 3-column layout
- Experiments: Course and experiment tabs with enrollment
- Events: Calendar view with event cards
- Community: Listing, create, detail, admin pages with roles
- Vault: Resources with Lab Notes, My Toolbox, Music tabs
- Love Board: Rankings with real data
- Feed: Aggregate posts with source filtering
- Profile: Own content view, public profiles
- Creator Dashboard: Analytics for creators
- Settings, Wallet, Relays pages

### Content Creation
- Course Builder with lessons
- Experiment Builder with step builder
- Post Composer with media upload (image/GIF/video)
- Course Comments

### Social
- Share to Nostr (Big Dreams, Journal, Experiments)
- Post Actions (Reply, Repost, Zap, Like, Bookmark, Share)
- Privacy Rules (group content stays private)
- External Sharing (X/Twitter, Facebook, copy link)
- Notification dots on nav items

### AI (Magic Mentor)
- Claude Haiku working with system prompt context
- Three-tier access (Free/Paid/BYOK)
- Atomic token tracking with row-level locks
- Floating sparkles button

## Features to Port from Shakespeare Project

- useEncryptedStorage hook (NIP-44 encryption with plaintext fallback)
- useLabPublish / useLabOnlyPublish hooks (smart relay routing)
- Primal WebSocket client (fast feed with zlib compression, 40+ kinds, link previews)
- useBigDreams with Nostr relay storage (encrypted, one event per dimension)
- Two-path onboarding modal (Quick Start / Deep Dive)
- Moderation system (mute, report, admin tools)
- SEO files (robots.txt, llms.txt, sitemap.xml)

## Build Roadmap

Phase 1 Nostr Privacy Layer: NDK + dual-relay, NIP-44 encrypted storage, BYOK for AI, 6-tier membership gating
Phase 2 Core Content: 18-lesson curriculum loaded, Dream Sheet templates, FCLADDD villain tracking + AM/PM structure
Phase 3 User Experience: Two-path onboarding, EQ Visualizer, streak tracking (7/30/90 milestones), creator templates
Phase 4 Social: Primal API feed, accountability buddies, NIP-57 zapping, admin dashboard
Phase 5 Polish: AI experiment generation (Bloom's Taxonomy), PWA, SEO files

## Navigation Structure
- Desktop left sidebar: Home, Big Dreams, Experiments, Events, Tribe, Vault, Love Board, Feed
- Mobile: Hamburger slide-out menu from left
- Floating button: Magic Mentor AI (Sparkles icon, bottom-right)

## Multi-Tenant Architecture
- Creators/coaches set up paid communities (limit 5 per paid plan)
- Value for Value: Content free to consume with optional zaps
- 11x LOVE Code: Everyone goes through this first
- Magic Mentor AI trains on: Journal entries, goals, experiment learnings
- Template system: Experiments, events, communities use templates creators fill in

## Design Patterns
- Monorepo: Client (client/), Server (server/), Shared (shared/)
- Path Aliases: @/ for client source, @shared/ for shared code, @assets/ for assets
- API Client: Centralized fetch wrapper in client/src/lib/api.ts

## Environment Variables
- DATABASE_URL: PostgreSQL connection string (required)
- ANTHROPIC_API_KEY: For Magic Mentor AI
- Future: ADMIN_NPUB, SESSION_SECRET, OPENROUTER_API_KEY

## Security
- Nostr NIP-07/NIP-46 authentication
- User identity via nostrPubkey field
- authMiddleware validates x-nostr-pubkey header
- Ownership checks on all personal data routes
- Nostr security: ALWAYS filter queries by authors field (permissionless network)
- Sharing privacy rules in client/src/lib/sharing-rules.ts

## Session-End Checklist (MANDATORY)
1. Test all changes — verify no errors in browser console or server logs
2. Verify design rules — check no font-bold, no pink-as-brand in code
3. Verify imports — every imported name must be used
4. Update SESSION_NOTES.md — record what was done
5. Update replit.md — if architecture or features changed
6. Push to GitHub — double backup to origin main

## Technical Notes
- Server runs on port 5000
- vite.config.ts is fragile — avoid direct edits
- Auth flow: Login -> NIP-07 -> pubkey to /api/auth/nostr -> user created -> pubkey in context -> sent with API requests

## Backup Info
- Replit checkpoints: automatic
- GitHub: https://github.com/DJValerieBLOVE/my-love-replit.git
- Shakespeare reference: https://github.com/DJValerieBLOVE/11xLOVE-LaB.git
