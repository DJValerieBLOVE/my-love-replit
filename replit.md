# My Masterpiece App

## Overview
**My Masterpiece** is a spiritual personal growth app designed to help users curate their personal growth journey. It offers a personalized dashboard, integrated consumption of courses/podcasts/music, collaboration tools, private journaling, and an AI coach with persistent memory. The app leverages a hybrid Nostr and PostgreSQL architecture, integrating Lightning payments for peer-to-peer interactions.

The vision is to combine features from Notion, Obsidian, Mighty Networks, Spotify, Nostr, Lightning, AI coaching, and Pinterest vision boards into a singular, cohesive platform focused on personal transformation. The platform also hosts the "11x LOVE LaB" community, which stands for "Lessons and Blessings."

## User Preferences
- Preferred communication style: Simple, everyday language
- Daily LOVE Practice is the MOST IMPORTANT feature (LOVE always capitalized)
- Sparkles icon ONLY for Magic Mentor AI - no other usage
- NO colored icons anywhere - all icons use muted-foreground color
- Hover interactions use light purple (#F0E6FF), never blue
- All colors solid hex, no opacity values
- Privacy-first: entries default to private, optional sharing

## System Architecture

### Design Principles
- **Font**: Marcellus font, weight 400 ONLY. Emphasis achieved via font size, letter-spacing, or color, not weight.
- **Color Scheme**: Primary brand color is Purple (#6600ff) used for all buttons, links, tabs, and accents. A purple gradient from #6600ff to #9900ff (or #cc00ff) is used for aesthetic elements. Pink (#eb00a8) is exclusively reserved for the GOD/LOVE dimension and not used as a brand accent. All colors are solid hex values, no opacity.
- **Visual Style**: Features a purple gradient aesthetic. The homepage is structured as a "Prosperity Pyramid" with 5 areas (Health, People, Purpose, Wealth) centered around GOD. Navigation includes a left sidebar (desktop) and top header. Cards use `rounded-xs` corners with flip animations, where flipped card backs have a light background (#FAF8F5). Ghost button hover uses light purple (#F5F3FF/#6600ff text), never teal. All action buttons use solid #6600ff, no gradients on interactive elements.
- **Feed Layout**: Three-column Facebook/X-style layout. Feed column (~620px) centered on viewport using CSS clamp() margin formula. Left sidebar (240px) and right sidebar (300px) are both sticky during scroll. Feed tabs (Following/Tribes/Buddies/Explore) are sticky below the header. New posts notification pill uses dark purple (#6600ff) background with white text.
- **Mobile Design**: Compact header (56px) with a smaller EQ logo (40px). Navigation uses a hamburger menu with a slide-out drawer. Cards are taller (200px min), with a 4:3 aspect ratio, drop-shadow text, and rounded-xs corners. Login buttons explicitly say "Login". The AI button is floating at the bottom-right.
- **Privacy Architecture**:
    - Three-Tier Privacy: Tribe messages (NIP-29) are never shareable and encrypted. Big Dreams, Journals, Daily Practice, and AI Conversations (Kind 30078, NIP-44 encrypted) are private by default with optional sharing. Completions and Feed Posts (Kind 1 notes, reactions) are shareable.
    - Dual-Relay Architecture: Utilizes a private Railway Relay (wss://nostr-rs-relay-production-1569.up.railway.app) for all LaB data with NIP-42 whitelist authentication, and public relays (e.g., wss://relay.primal.net, wss://relay.damus.io) for public Nostr data.
    - BYOK (Bring Your Own Key) for AI: Users can provide their own API key (Anthropic or OpenRouter), encrypted and stored in the browser, with direct calls from the browser to the provider.

### Core Frameworks & Curriculum
- **The Prosperity Pyramid**: Organizes life into 11 Dimensions across 5 macro-categories (GOD, Purpose, Health, People, Wealth).
- **FCLADDD Villains Framework**: Identifies 7 "villains" (Fear, Confusion, Lies, Apathy, Disconnection, Distraction, Drifting) and their roots, with the Magic Mentor AI tracking patterns and suggesting antidotes.
- **SNAP! Engine**: A modular framework (Start Now - A and P change per module) powering various app sections.
- **MEhD Framework**: Focuses on "Master of Education on Yourself" with 4 pillars: NEEDS, VALUES, DESIRES, BELIEFS.
- **Daily LOVE Practice**: Structured morning (VIBE, VISION, VALUE, VILLAIN, VICTORY) and evening (CELEBRATIONS, LESSONS, BLESSINGS, DREAM VIBES) reflections.
- **11x LOVE Code Curriculum**: An 18-lesson curriculum across 5 modules (BELIEVE, BREAKTHROUGH, BREAKDOWN, BRAVERY, BUILD, BADASSERY) with specific Dream Sheets (journal prompts). Features sequential unlocking of lessons.
- **Two-Path Onboarding**: Offers a Quick Start (simple Big Dreams) or Deep Dive (full curriculum) option.

### Technical Implementation
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack React Query for state management, Tailwind CSS v4 with custom theme, shadcn/ui (New York style) with Radix UI primitives for components, Framer Motion for animations, and Vite for building.
- **Backend**: Node.js with Express, TypeScript (ESM modules), RESTful JSON APIs, Drizzle ORM with PostgreSQL dialect, and Neon serverless PostgreSQL database.
- **Data Storage**: Hybrid approach using PostgreSQL for content, community structure, memberships, public data, user accounts, and AI logs. Encrypted personal data (Big Dreams, journals, daily practice, AI conversations, tribe messages) is stored on a Nostr Private Relay, encrypted with the user's Nostr key via NIP-44.
- **AI Integration (Magic Mentor)**: Utilizes Claude Haiku 4.5 via the Anthropic SDK. System prompts include user profile, journal entries, and dreams, secured with XML delimiters. Offers three-tier access (Free, Paid, BYOK) with atomic token tracking. Features a planned 4-layer AI memory system for cost efficiency.
- **Authentication**: Dual auth system - Email/password with bcrypt (12 rounds), JWT tokens, optional TOTP 2FA with QR codes, password recovery. Also NIP-07 Nostr Login (Alby, nos2x) and NIP-46 Bunker Login (nsec.app). User's Nostr pubkey is linked to database accounts. Email users auto-generate a client-side Nostr keypair (stored in localStorage) so they can still use NIP-44 encryption.
- **Key Features Implemented**: Authentication (dual email+Nostr), Prosperity Pyramid homepage, Big Dreams, Journal, Daily LOVE Practice (morning 5-V wizard + evening reflection with real PostgreSQL persistence, streak tracking, and history), Experiments, Events, Community, Vault, Love Board, Feed (live Nostr events from relays via NDK with sidebar showing trending hashtags and Daily Practice CTA), User Profiles (with live Kind 0 metadata sync), Creator Dashboard, Settings (with Account/2FA/Nostr linking), Wallet, Relays (live NDK connection status). Content creation tools (Course Builder, Experiment Builder, Post Composer publishing Kind 1 events). Social features (Nostr sharing, Post Actions with Kind 7 likes / Kind 6 reposts / reply threads, Privacy Rules, relay source indicators).
- **Daily LOVE Practice**: Full-page practice at /daily-practice with: Morning wizard (VIBE rating 1-11, VISION with Big Dream focus, VALUE 3 action steps, VILLAIN obstacle + hero move, VICTORY commitment). Evening reflection (CELEBRATIONS check-off + wins, LESSONS learned, BLESSINGS gratitude, DREAM VIBES with evening vibe rating). Completed day summary view, practice history with dates, and streak counter. Database schema in shared/schema.ts (dailyPractice table), storage layer with upsert, history, and streak calculation. API routes: GET /api/daily-practice/today, GET /api/daily-practice/history, GET /api/daily-practice/streak, POST /api/daily-practice (validated with Zod schema).
- **Nostr Feed Integration**: Feed uses dual data sources. Public feeds (Following, Explore) use Primal Cache API (wss://cache1.primal.net/v1) via WebSocket for fast, fresh data. Private feeds (Tribes, Buddies) use NDK with the private Railway relay only. Feed has 4 tabs: Following, Tribes (private, lock icon), Buddies (private, lock icon), and Explore dropdown (Trending, Most Zapped, Media, Latest). The Primal cache client is in client/src/lib/primal-cache.ts. All mock/dummy data has been removed - only real Nostr data is shown. Posts show lock/globe icons indicating private/public relay source. Post interactions publish real Nostr events (Kind 7 reactions, Kind 6 reposts, Kind 1 replies). Images/videos from Nostr posts (nostr.build, imgur, etc.) are parsed and rendered inline via client/src/lib/nostr-content.ts.
- **Profile Editing**: Edit Profile dialog on profile page with name editing, buddy matching toggle (paid members only), buddy description, and LaB interests selection. Backend PATCH /api/profile endpoint updates user fields. Buddy matching fields: lookingForBuddy, buddyDescription, labInterests stored in PostgreSQL users table.
- **Membership Tiers**: Six tiers from Free to Creator BYOK, offering varying access to features like progress tracking, comments, tribes, AI tokens, and content creation.
- **Design Patterns**: Monorepo structure (client/, server/, shared/), path aliases (`@/`, `@shared/`, `@assets/`), and a centralized API client.
- **Security**: Dual auth middleware (JWT Bearer tokens for email users, Nostr pubkey header for Nostr users), NIP-07/NIP-46 authentication, ownership checks on data routes, Nostr query filtering by authors.

## External Dependencies
- **PostgreSQL**: Primary database for public and structured application data (Neon serverless).
- **Nostr Relays**:
    - Private Railway Relay (wss://nostr-rs-relay-production-1569.up.railway.app): For encrypted personal LaB data.
    - Public Relays (e.g., wss://relay.primal.net, wss://relay.damus.io, wss://relay.ditto.pub): For public Nostr profiles, follows, posts, reactions, zaps.
- **Anthropic API**: For the Magic Mentor AI (Claude Haiku 4.5 model).
- **OpenRouter API**: Alternative AI provider for BYOK users.
- **Primal Cache API**: WebSocket cache service (wss://cache1.primal.net/v1) for fast public Nostr feeds (trending, most zapped, media, latest, user feeds). Uses `explore` and `feed` cache directives.
- **Alby / nos2x**: Browser extensions for NIP-07 Nostr login.
- **nsec.app**: Remote signer for NIP-46 Bunker Login.
- **Tailwind CSS v4**: Styling framework.
- **shadcn/ui**: UI component library based on Radix UI primitives.
- **Framer Motion**: Animation library.
- **Vite**: Frontend build tool.