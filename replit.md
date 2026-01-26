# My Masterpiece App

## Overview

**My Masterpiece** is a spiritual, gamified personal growth app where users design their own dashboard, earn Bitcoin for progress, consume courses/podcasts/music in one place, connect with collaborators, journal privately, and get coached by an AI that remembers them forever — powered by a hybrid Nostr + Database architecture with Lightning payments.

**One-Liner:** Notion + Obsidian + Mighty Networks + Spotify + Nostr + Lightning + AI Coach + Pinterest Vision Board = My Masterpiece

**11x LOVE LaB** is a community INSIDE this app (not the app name itself).

## User Preferences

- Preferred communication style: Simple, everyday language
- Daily LOVE Practice is the MOST IMPORTANT feature (LOVE always capitalized)
- Sparkles icon ONLY for Magic Mentor AI - no other usage
- NO colored icons anywhere - all icons use muted-foreground color
- Hover interactions use light purple (#F0E6FF), never blue
- All colors solid hex, no opacity values
- Privacy-first: entries default to private, optional sharing

## Design Language

### 11 LOVE Code Colors
- GOD/LOVE: #eb00a8
- Romance: #e60023
- Family: #ff6600
- Community: #ffdf00
- Mission: #a2f005
- Money: #00d81c
- Time: #00ccff
- Environment: #0033ff
- Body: #6600ff
- Mind: #9900ff
- Soul: #cc00ff

### Visual Style
- Purple gradient aesthetic (#6600ff to #cc00ff)
- 5-pillar heart dashboard with flip cards (Mission, Health, Tribe, Wealth) + center God heart
- Left navigation sidebar (desktop only)
- Top header (keep existing)
- **All cards use rounded-xs** (extra small corners)
- Card flip animations with one-at-a-time behavior and optional pin feature
- Flipped card backs have light background (#FAF8F5), not purple

### Mobile Design
- **Header**: Compact (56px), smaller EQ logo (40px), sats goes to Love Board, logo goes to Big Dreams
- **Bottom nav**: 6 icons only (no text), no overflow menu
- **Cards**: Taller (200px min), 4:3 aspect ratio, drop-shadow text, rounded-xs corners
- **Login**: "Login" button text (not "Sign In")
- **AI button**: Bottom-right, above nav bar

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with custom theme variables
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (Neon serverless)

### Data Storage
- **Primary Database**: PostgreSQL via Neon serverless adapter
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with output to `./migrations`
- **Key Entities**: Users, JournalEntries, Dreams, AreaProgress, Experiments, UserExperiments, Events, Posts, Clubs

### AI Integration (Magic Mentor)
- **Model**: Claude Haiku 4.5 (hardcoded, ONLY Haiku)
- **SDK**: Direct Anthropic SDK (NOT OpenRouter)
- **Location**: `server/anthropic.ts`
- **Context**: System prompt includes user's profile, journal entries, and dreams
- **Security**: XML delimiters + user input wrapping for prompt injection protection
- **Three-tier access**:
  - Free: 5 messages/day (configurable via FREE_TIER_DAILY_LIMIT env var)
  - Paid: Token balance system with upfront reservation
  - BYOK: Users can provide their own Anthropic API key
- **Concurrency Safety**: Two-phase atomic approach with row-level locks
  - Phase 1: Reserve slot + tokens before AI call (SELECT FOR UPDATE)
  - Phase 2: Finalize usage + adjust balance after AI succeeds
  - Rollback: Release slot + refund tokens on AI failure
- **Tables**: `ai_usage_logs` for token tracking, user fields for tier/balance

### Future Tech Stack (Per Spec)
- **Identity**: Nostr (NDK library) - user owns keys
- **Payments**: Lightning (WebLN/NWC) - non-custodial
- **Zaps**: Nostr NIP-57
- **AI Memory**: Voy/Orama (browser) - local vector store
- **Mobile**: PWA first

## Key Features

### Already Built
- Daily LOVE Practice journaling with 3-column layout (/journal)
- Big Dreams page (11 LOVE Code areas)
- Home page with 9-card flip dashboard ("My Masterpiece")
- Resources page with tabs: Lab Notes, My Toolbox, Music & Meditations
- Learning page (courses/experiments)
- Communities page (clubs)
- Events page with calendar
- Leaderboard page
- Floating Magic Mentor AI button (bottom-right, mobile-friendly)
- PostgreSQL database with full schema
- Express API backend
- **NIP-07 Nostr Login** - Browser extension login (Alby, nos2x)
- **NIP-46 Bunker Login** - Remote signer login via nsec.app/nsecBunker for users without extensions; session persists across page reloads
- **Mobile-optimized layout** - Compact header, icons-only bottom nav
- **Secure Authentication** - Nostr pubkey linked to database users, all personal data protected
- **Mandatory Email Collection** - ProfileCompletionDialog prompts for email after Nostr login, required for 2-week trial access
- **Share to Nostr** - Share Big Dreams, Journal entries, and completed Experiments to Nostr network with optional caption
- **Notification Indicators** - Simple dark purple dots on nav items with notifications (Big Dreams, Grow, Events, Tribe)
- **Simplified Header** - Removed mail/bell icons, cleaner navigation
- **Social Post Actions** - Complete action buttons: Reply, Repost (with dropdown for Nostr/Group), Zap (with amount dialog), Like, Bookmark, Share (with dropdown for Copy Link, X, Facebook)
- **Sharing Privacy Rules** - Group/community/learning posts stay private within group; only user's own original content can be shared publicly to Nostr
- **Post Composer with Media** - Create posts with image, GIF, and video upload support; preview and remove media before posting
- **External Sharing** - Share public posts to X/Twitter, Facebook, or copy link

### Navigation Structure
- **Desktop left sidebar**: Home, Big Dreams (with dot), Grow (with dot), Events (with dot), Tribe (with dot), Toolbox, Love Board, Feed
- **Mobile bottom nav**: 6 icons only (Home, Grow, Events, Tribe, Toolbox, Feed) - no text labels, notification dots on relevant items
- **Grow page**: /grow route, contains Courses and Experiments tabs (formerly /learning)
- **Mobile header**: Stats goes to Love Board, center logo goes to Big Dreams
- Floating button: Magic Mentor AI (Sparkles icon, bottom-right corner)
- No header mail/bell icons (removed - notifications shown contextually on nav items)

### To Build (Priority Order)
1. Lightning/Zaps integration (NWC)
2. AI Magic Mentor integration (Claude)
3. AI Learning Buddy (enhanced) - trains on user's journal, goals, course learnings
4. Community membership system (multi-tenant: creators can set up paid communities)
5. Bitcoin rewards system
6. User personalization: Spotify playlists, podcast RSS feeds, favorite quotes/authors
7. Club-based sharing (isPrivate/sharedClubs enforcement)

## Multi-Tenant Architecture
- **Creators/coaches** can set up paid communities (limit 5 per paid plan, extra available for fee)
- **Value for Value**: Content is free to consume with optional zaps, communities are paid
- **11x LOVE Code course**: Everyone goes through this to define dreams, fears, goals in 11 areas
- **Magic Mentor AI trains on**: Journal entries, goals, course learnings, personal preferences

## Daily LOVE Practice (5 V's)
- **Vibe**: How you're feeling today (emotional check-in)
- **Vision**: What you're focused on / clarity of purpose
- **Value**: Gratitude and appreciation
- **Villain**: Obstacles or resistance to overcome
- **Victory**: Small wins and celebrations
- Entries stored in private journal (only user and AI can see)
- Connects to journal page via /journal?startPractice=true

## Design Patterns
- **Monorepo Structure**: Client (`client/`), Server (`server/`), Shared (`shared/`)
- **Path Aliases**: `@/` for client source, `@shared/` for shared code, `@assets/` for static assets
- **API Client**: Centralized fetch wrapper in `client/src/lib/api.ts`
- **Component Organization**: Feature-based with shared UI components in `components/ui/`

## Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)
- Future: `ADMIN_NPUB`, `SESSION_SECRET`, `OPENROUTER_API_KEY`

## Security Architecture
- **Authentication**: Nostr NIP-07 via browser extensions (Alby, nos2x)
- **User Identity**: Users linked to database via nostrPubkey field
- **API Protection**: authMiddleware validates x-nostr-pubkey header on all personal data routes
- **Ownership Checks**: Users can only access their own journal entries, dreams, and progress
- **Privacy Fields**: isPrivate and sharedClubs ready for future club-sharing features
- **Data Isolation**: No cross-user data access possible via API
- **Sharing Privacy Rules**: Shared utility at `client/src/lib/sharing-rules.ts` enforces: group content (community/learning) can only be reposted within group unless isOwnPost is true

## Technical Notes
- Server runs on port 5000
- vite.config.ts is fragile - avoid direct edits
- Auth flow: Login button -> NIP-07 extension -> pubkey sent to /api/auth/nostr -> user created/updated -> pubkey stored in context -> sent with all API requests

## Backup Info
- Replit checkpoints are automatic
- GitHub repo: https://github.com/DJValerieBLOVE/my-love-replit.git
