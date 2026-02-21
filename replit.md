# My Masterpiece App

## Overview
My Masterpiece is a spiritual personal growth application designed to help users curate their personal growth journey. It offers a personalized dashboard, integrated consumption of courses/podcasts/music, collaboration tools, private journaling, and an AI coach with persistent memory. The app leverages a hybrid Nostr and PostgreSQL architecture, integrating Lightning payments for peer-to-peer interactions. The platform aims to combine features from various popular platforms into a singular, cohesive experience focused on personal transformation, hosting the "11x LOVE LaB" community.

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

## System Architecture

### Core Frameworks & Curriculum
- **The Prosperity Pyramid**: Organizes life into 11 Dimensions across 5 macro-categories.
- **FCLADDD Villains Framework**: Identifies 7 "villains" for AI tracking and antidote suggestions.
- **Daily LOVE Practice**: Structured morning (VIBE, VISION, VALUE, VILLAIN, VICTORY) and evening (CELEBRATIONS, LESSONS, BLESSINGS, DREAM VIBES) reflections.
- **11x LOVE Code Curriculum**: An 18-lesson curriculum across 5 modules with sequential unlocking.

### Technical Stack
- **Frontend**: React 18, TypeScript, Wouter, TanStack React Query, Tailwind CSS v4, shadcn/ui, Framer Motion, Vite.
- **Backend**: Node.js, Express, TypeScript, RESTful JSON APIs, Drizzle ORM, Neon serverless PostgreSQL.
- **Data Storage**: Hybrid PostgreSQL for public/structured data and Nostr Private Relay for encrypted personal data (NIP-44 encrypted).
- **AI Integration (Magic Mentor)**: Uses Claude Haiku 4.5 via Anthropic SDK, with system prompts including user profile, journal, and dreams. Supports three-tier access (Free, Paid, BYOK) and planned 4-layer AI memory.
- **Authentication**: Dual system with Email/password (bcrypt, JWT, optional TOTP) and Nostr Login (NIP-07, NIP-46). Email users auto-generate client-side Nostr keypairs for NIP-44 encryption.

### Design System (Style Guide)
- **Typography**: Marcellus font, weight 400 ONLY everywhere.
- **Color Palette**: Background `#FAFAFA`, Foreground `#2a2430`, Primary Brand `#6600ff`, GOD/LOVE Dimension `#eb00a8`, Muted/Subtle Gray `#F5F5F5` (used for hover states, loading skeletons, link preview backgrounds, focus states — all via `--muted` CSS variable). All colors are solid hex values. NO purple tints for neutral UI elements.
- **Buttons**: Default/Primary `bg-foreground text-background`. Ghost Button Hover `hover:bg-[#F0E6FF]`. Never use blue.
- **Tabs / Pill Bubbles**: `rounded-full` shape with active (`bg-foreground text-background`) and inactive states. People page uses dropdown pill bubbles.
- **Search Inputs**: Always `bg-white` with `Search` icon at `left-3` and `pl-10`.
- **Cards**: `border-none shadow-sm bg-card rounded-xs` with `hover:shadow-md`. Images are 16:9 (`aspect-video`) with NO overlays/tags. Top accent is a thin purple line.
- **Tags / Badges**: Light gray outline style: `bg-white border border-gray-200 text-muted-foreground text-xs px-2.5 py-0.5 rounded-md`. Placed in card content area.
- **Create Buttons**: Each listing page has a "Create" button in the tab/header row area.
- **Navigation**: Left Sidebar white background, active/hover items `text-[#6600ff]`. Header white background, sticky. Mobile has hamburger menu.
- **Icons**: ALL icons use `text-muted-foreground` color, except the Sparkles icon for Magic Mentor AI. Lucide React icons with `strokeWidth={1.5}`.

### Key Pages & Features
- **Home** (`/`): Prosperity Pyramid with flip card animations.
- **Big Dreams** (`/big-dreams`): Daily hub with Daily LOVE Practice CTA, streak grid, experiment progress, upcoming events, and 11 Big Dreams editor.
- **Daily LOVE Practice** (`/daily-practice`): Full-page wizard accessible from Big Dreams.
- **Experiments** (`/experiments`): 6 tabs for learning content with creation and detail pages.
- **Events** (`/events`): 4 tabs with calendar and event cards, with creation page.
- **People** (`/people`): Unified social hub with dropdown pill bubbles for navigation, right sidebar with gamification placeholders, and 4-tier privacy selector on all post composers.
- **Vault** (`/vault`): 6 tabs for personal content.
- **Tribe/Community** (`/community`): Listing, creation, and management of tribes.
- **Love Board** (`/leaderboard`): Rankings (planned marketplace).
- **Profile** (`/profile/:id`): Clean Primal-style profile with no gamification, showing Nostr synced data. Banner uses 3:1 aspect ratio (Primal standard, no rounded corners). Follow/unfollow system with Kind 3 contact list management via NDK. Clickable following/followers counts open full user list dialogs with search and follow buttons. Supports viewing other users' profiles via `/profile/:pubkey` with Primal cache data loading. Feed post avatars/names link to user profiles.
- **Creator Dashboard** (`/creator`): Analytics for content creators.
- **Wallet** (`/wallet`): Lightning wallet with NWC integration.
- **Security**: Dual auth middleware (JWT, Nostr pubkey), NIP-07/NIP-46, ownership checks, Nostr query filtering, AI prompt injection protection, atomic transactions for AI usage.

### Value-for-Value Architecture
- Experiments are public, value-for-value content: creators receive Lightning zaps from users.
- "Zap the Creator" modal after each lesson and experiment completion.
- Experiment completion also offers "Share Your Win" to publish to public Nostr relays.

### Image Upload System
- Server-side file upload via multer at `/api/upload`.
- Stored in `/uploads/`, served as static files.
- 5MB limit, JPEG, PNG, GIF, WebP.
- Reusable `ImageUpload` component with drag-and-drop.

### Privacy Architecture
- Four-tier privacy system on all post composers: Public (Nostr), Tribe Only, Buddy Only, Secret (vault only).
- Dual-relay architecture: private Railway Relay for LaB data, public relays for general Nostr data.
- Private-by-default journals/AI conversations, shareable completions/feed posts.

### Nostr NIPs Implementation
- **Currently Implemented**: NIP-01 (Basic Protocol), NIP-05 (DNS Verification), NIP-07 (Browser Signer), NIP-10 (Reply Threading), NIP-19 (Bech32 Encoding), NIP-25 (Reactions), NIP-44 (Encrypted Payloads), NIP-46 (Nostr Connect), NIP-57 (Lightning Zaps), NIP-65 (Relay List Metadata).
- **Key Event Kinds Used**: 0 (metadata), 1 (notes), 3 (contacts), 6 (reposts), 7 (reactions), 9 (group chat), 11 (group thread notes), 12 (group thread replies), 1059 (gift-wrapped), 1060 (sealed), 10002 (relay list), 30023 (long-form content), 30078 (app-specific data).
- **Priority NIPs to Implement Next**: NIP-17 (Private DMs), NIP-29 (Relay-Based Groups), NIP-42 (Relay Authentication), NIP-51 (Lists), NIP-09 (Event Deletion), NIP-32 (Labeling), NIP-56 (Reporting), NIP-72 (Public Communities), NIP-94 (File Metadata), NIP-98 (HTTP Auth).
- **Relay Architecture**: Private LaB Relay for all private/encrypted data. Public Relays for public content. Events with private tags NEVER go to public relays.

### Feed Features (Primal-Style)
- **Text Truncation**: Primal-style "see more" truncation on long posts. Uses 1400 char / 200 word limits (matching Primal's `shortNoteChars = 200 * 7` and `shortNoteWords = 200`). Truncation avoids cutting inside URLs or nostr: entities. Purple "see more" link expands content inline. Applied to both PostCard (feed.tsx) and FeedPost (feed-post.tsx).
- **Long-form Articles (NIP-23)**: Kind 30023 long-form content displayed as collapsed article cards in the feed. Parses title, summary, image, hashtags, and published_at from NIP-23 tags. Also handles Primal's kind 10030023 shell events for article previews. Articles are deduplicated and sorted by publishedAt, interleaved every 5 posts in the explore feed. ArticleCard opens on Primal.net via naddr encoding. Styled per design system: Marcellus font, muted FileText icon, purple top accent, gray hashtag badges.
- **Profile Enhancements**: Primal-style tabbed follow dialog (Following/Followers tabs with counts). Context menu on "..." button (Add user feed, Copy user link, Copy public key). 3:1 banner aspect ratio with no rounded corners. Avatar overlaps banner bottom edge. QR code button copies public key. Follower counts from kind 10000108/10000133 events.

## Recent Changes (February 2026)
- Added Primal-style text truncation with "see more" to feed posts (1400 char / 200 word limit)
- Added NIP-23 kind 30023 long-form article support with collapsed ArticleCard components in feed
- Added kind 10030023 Primal shell event parsing for article previews
- Article deduplication and sorting by publishedAt in primal-cache.ts
- Truncation safety: avoids cutting inside URLs and nostr: entities
- Added PrimalArticle type to primal-cache.ts exports
- Profile page: tabbed follow dialog, context menu, 3:1 banner, avatar overlap, QR copy, follower counts
- Unified light gray color: changed --muted from #F5F3FF (purple tint) to #F5F5F5 (neutral gray) globally
- Skeleton loading states now use bg-muted instead of bg-primary/10 (no more purple pulse)
- Input/textarea focus rings changed from purple to neutral gray
- All dropdown/context/select menu hover states unified to bg-muted (removed hardcoded #EBEBEB)
- Link preview cards redesigned to horizontal layout (thumbnail left, info right) with bg-muted background
- NIP-57 zap compliance: zapViaLightning now creates kind 9734 zap request events with proper tags (relays, amount, p, e, lnurl) and includes them in LNURL callback so zap receipts show on Primal
- FeedPost component: added click-to-navigate on content area (goes to /note/:eventId), avatar/name link to profile
- Action button colors: icon-only color changes when active (heart pink #eb00a8, zap/repost/bookmark purple #6600ff), count text always stays muted

## External Dependencies
- **PostgreSQL**: Primary database (Neon serverless).
- **Nostr Relays**: Private Railway Relay, public relays (e.g., `relay.primal.net`).
- **Anthropic API**: Magic Mentor AI (Claude Haiku 4.5).
- **OpenRouter API**: Alternative AI provider.
- **Primal Cache API**: WebSocket service (`wss://cache2.primal.net/v1`) for fast public Nostr feeds. Persistent connection with auto-reconnect, in-memory cache with 60s TTL, and Enhanced Privacy proxy option.
- **Alby / nos2x**: NIP-07 Nostr login.
- **nsec.app**: NIP-46 Bunker Login.
- **Tailwind CSS v4**: Styling framework.
- **shadcn/ui**: UI component library.
- **Framer Motion**: Animations.
- **Vite**: Frontend build tool.
- **Drizzle ORM**: Database queries and migrations.
- **TanStack React Query**: Server state management.
- **Wouter**: Client-side routing.