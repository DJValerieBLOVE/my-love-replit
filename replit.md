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
- 9-card flip dashboard ("My Masterpiece") - like EdStr/Shakespeare screenshots
- Left navigation sidebar (keep existing)
- Top header (keep existing)
- White cards with subtle shadows, rounded corners
- Card flip animations for affirmation deck

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

### Future Tech Stack (Per Spec)
- **Identity**: Nostr (NDK library) - user owns keys
- **Payments**: Lightning (WebLN/NWC) - non-custodial
- **Zaps**: Nostr NIP-57
- **AI Memory**: Voy/Orama (browser) - local vector store
- **AI Model**: OpenRouter API (Claude Sonnet 3.5 default)
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

### Navigation Structure
- Left sidebar: Home, Big Dreams, Learning, Events, Communities, Resources, Leaderboard
- Floating button: Magic Mentor AI (Sparkles icon, bottom-right corner)
- No right sidebar (simplified home screen)

### To Build (Priority Order)
1. Streak tracking & wins display
2. 11x LOVE rainbow equalizer widget
3. Nostr authentication
4. AI Learning Buddy (enhanced) - trains on user's journal, goals, course learnings
5. Community membership system (multi-tenant: creators can set up paid communities)
6. Lightning/Zaps integration
7. Bitcoin rewards system
8. User personalization: Spotify playlists, podcast RSS feeds, favorite quotes/authors

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

## Technical Notes
- Test user ID from seed: e9594e8a-3846-4517-b815-b8b0756b084e (CURRENT_USER_ID)
- Server runs on port 5000
- vite.config.ts is fragile - avoid direct edits

## Backup Info
- Replit checkpoints are automatic
- GitHub repo: https://github.com/DJValerieBLOVE/my-love-replit.git
