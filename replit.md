# My Masterpiece App

## Overview
My Masterpiece is a spiritual personal growth application designed to guide users through their personal transformation journey. It offers a personalized dashboard, integrated consumption of growth content (termed "Experiments"), collaboration tools, private journaling, and an AI coach with persistent memory. The app utilizes a hybrid Nostr and PostgreSQL architecture, incorporating Lightning payments for peer-to-peer interactions. The platform aims to consolidate features from various platforms into a singular, cohesive experience, specifically hosting the "11x LOVE LaB" community. Key capabilities include a dual authentication system (Email/password + Nostr), a daily practice wizard, an experiments platform with content creation and progress tracking, event management, and a marketplace.

## User Preferences
- Preferred communication style: Simple, everyday language
- Daily LOVE Practice is the MOST IMPORTANT feature (LOVE always capitalized)
- Sparkles icon ONLY for Magic Mentor AI - no other usage
- NO colored icons anywhere - all icons use muted-foreground color
- All colors solid hex, no opacity values
- Privacy-first: entries default to private, optional sharing
- Love Board is a marketplace (For Sale, Help Wanted, Services, Other) for paid members at /leaderboard route
- Prayer Requests live inside the People page Prayers tab (any user can post, not just paid)
- People page is the unified social hub (replaced separate Feed + Tribe pages)
- People page right sidebar has placeholder gamification: Top Zappers, Top Streaks, Progress & Completions
- All Tribe content and Prayer Requests are PRIVATE (not shared to public Nostr)
- Streak grid tracks Daily LOVE Practice completions: #EEEEEE (none), #D9C2FF (morning only), #A366FF (evening only), #6600FF (complete day)
- NO gamification on Profile page (no XP, levels, badges, rewards)
- "Experiments" is the ONLY term for learning content (not "courses") - buttons say "Start Experiment" / "View Experiment"
- 11 Dimensions (from the 11x LOVE Code) replace "categories" everywhere — always show colored dots next to dimension names in dropdowns/filters
- "Guide" is always the logged-in user — auto-fill from Nostr profile, no manual text input
- Videos in experiments: YouTube/Vimeo embed URLs ONLY — no native video upload (too resource intensive)
- Experiment thumbnails use 16:9 aspect ratio

## System Architecture

### Core Frameworks & Curriculum
- **The Prosperity Pyramid**: Organizes life into 11 Dimensions across 5 macro-categories.
- **FCLADDD Villains Framework**: Identifies 7 "villains" for AI tracking and antidote suggestions.
- **Daily LOVE Practice**: Structured morning and evening reflections.
- **11x LOVE Code Curriculum**: An 18-lesson curriculum across 5 modules with sequential unlocking.

### Technical Stack
- **Frontend**: React 18, TypeScript, Wouter, TanStack React Query, Tailwind CSS v4, shadcn/ui, Framer Motion, Vite.
- **Backend**: Node.js, Express, TypeScript, RESTful JSON APIs, Drizzle ORM, Neon serverless PostgreSQL.
- **Data Storage**: Hybrid PostgreSQL for public/structured data and Nostr Private Relay for encrypted personal data (NIP-44 encrypted).
- **AI Integration (Magic Mentor)**: Uses Claude Haiku 4.5 via Anthropic SDK with system prompts including user profile, journal, and dreams. Supports three-tier access and planned 4-layer AI memory.
- **Authentication**: Dual system with Email/password (bcrypt, JWT, optional TOTP) and Nostr Login (NIP-07, NIP-46, nsec paste with local signer). Email users auto-generate client-side Nostr keypairs for NIP-44 encryption.

### Design System (Style Guide)
- **Typography**: Marcellus font, weight 400.
- **Color Palette**: Background `#FAFAFA`, Foreground `#2a2430`, Primary Brand `#6600ff`, GOD/LOVE Dimension `#eb00a8`, Muted/Subtle Gray `#F5F5F5`. All colors solid hex.
- **Buttons**: Default/Primary `bg-foreground text-background`. Ghost Button Hover `hover:bg-[#F0E6FF]`. No blue.
- **Cards**: `border-none shadow-sm bg-card rounded-xs` with `hover:shadow-md`. Images are 16:9 (`aspect-video`) with no overlays/tags. Top accent is a thin purple line.
- **Icons**: ALL icons use `text-muted-foreground` color, except the Sparkles icon for Magic Mentor AI. Lucide React icons with `strokeWidth={1.5}`.

### Key Features and Pages
- **Home** (`/`): Prosperity Pyramid with flip card animations.
- **Big Dreams** (`/big-dreams`): Daily hub for practice, streaks, experiment progress, upcoming events, and dream editing.
- **Daily LOVE Practice** (`/daily-practice`): Full-page wizard for morning and evening reflections.
- **Experiments** (`/experiments`): Curriculum platform with 11 Dimensions filter, progress bars, and a builder (`/experiments/create`) supporting Module > Step hierarchy, rich text, media embeds, and quiz questions. Includes "My Experiments" section with drafts/published tabs and progress tracking.
- **Events** (`/events`): Calendar and event cards with full CRUD, RSVP functionality, and attendee management.
- **People** (`/people`): Unified social hub with a privacy selector for posts and a "Prayer Requests" tab.
- **Vault** (`/vault`): Centralized area for Daily LOVE entries, Journal, Notes (full CRUD with dimension tagging and pinning), Bookmarks, Assessments, Music & Meditations, and Library. Includes a data export feature.
- **Love Board** (`/leaderboard`): Marketplace for paid members offering various listings with full CRUD.
- **Profile** (`/profile`): Clean, Primal-style profile displaying Nostr synced data with follow/unfollow functionality.
- **Journal** (`/journal`): Personal journaling with NIP-44 encryption.
- **Security**: Dual auth middleware, NIP-07/NIP-46/nsec local signer, ownership checks, Nostr query filtering, AI prompt injection protection, atomic transactions.
- **Privacy Architecture**: Four-tier privacy system on composers, dual-relay architecture (private LaB Relay, public relays).
- **Nostr NIPs Implementation**: NIP-01, NIP-05, NIP-07, NIP-10, NIP-19, NIP-25, NIP-44, NIP-46, NIP-57, NIP-65.

## External Dependencies
- **PostgreSQL**: Primary database (Neon serverless).
- **Nostr Relays**: Private Railway Relay and public relays (e.g., `relay.primal.net`, `relay.damus.io`, `nos.lol`, `relay.nostr.band`).
- **Anthropic API**: Magic Mentor AI (Claude Haiku 4.5).
- **OpenRouter API**: Alternative AI provider.
- **Primal Cache API**: WebSocket service (`wss://cache2.primal.net/v1`) for fast public Nostr feeds.
- **Alby / nos2x**: NIP-07 Nostr login.
- **nsec.app**: NIP-46 Bunker Login.
- **Tailwind CSS v4**: Styling framework.
- **shadcn/ui**: UI component library.
- **Framer Motion**: Animations.
- **Vite**: Frontend build tool.
- **Drizzle ORM**: Database queries and migrations.
- **TanStack React Query**: Server state management.
- **Wouter**: Client-side routing.
- **TipTap**: Rich text editor.
- **canvas-confetti**: Quiz celebration effects.