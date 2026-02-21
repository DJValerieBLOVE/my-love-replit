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
- **Color Palette**: Background `#FAFAFA`, Foreground `#2a2430`, Primary Brand `#6600ff`, GOD/LOVE Dimension `#eb00a8`, Muted/Subtle Gray `#F5F5F5`. All colors are solid hex values; no purple tints for neutral UI elements.
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
- **Experiments** (`/experiments`): 6 tabs for learning content with creation and detail pages. Current experiment-builder.tsx uses basic form inputs (title, guide, description, image, category, steps). NEXT: Upgrade to use the same TipTap rich text editor from article-editor.tsx so experiment content is Nostr-publishable (kind 30023) with full formatting. Magic Mentor AI will assist users with formatting experiment content. Lightning zaps enabled on experiments.
- **Events** (`/events`): 4 tabs with calendar and event cards, with creation page.
- **People** (`/people`): Unified social hub with dropdown pill bubbles for navigation, right sidebar with gamification placeholders, and 4-tier privacy selector on all post composers.
- **Vault** (`/vault`): 6 tabs for personal content.
- **Tribe/Community** (`/community`): Listing, creation, and management of tribes.
- **Love Board** (`/leaderboard`): Rankings (planned marketplace).
- **Profile** (`/profile/:id`): Clean Primal-style profile with no gamification, showing Nostr synced data. Banner uses 3:1 aspect ratio. Follow/unfollow system with Kind 3 contact list management via NDK. Clickable following/followers counts open full user list dialogs with search and follow buttons. Supports viewing other users' profiles via `/profile/:pubkey` with Primal cache data loading. Feed post avatars/names link to user profiles.
- **Creator Dashboard** (`/creator`): Analytics for content creators.
- **Wallet** (`/wallet`): Lightning wallet with NWC integration.
- **Security**: Dual auth middleware (JWT, Nostr pubkey), NIP-07/NIP-46, ownership checks, Nostr query filtering, AI prompt injection protection, atomic transactions for AI usage.

### Shared Rich Text Editor Architecture
- The Article Editor (article-editor.tsx) TipTap rich text editor is the foundation for ALL content creation.
- **Experiments** will reuse the same TipTap editor, toolbar, preview mode, and HTML-to-Markdown conversion so experiment content can be published to Nostr as kind 30023 long-form articles.
- **Magic Mentor AI** will help users format and structure their experiment content within the editor.
- Shared utilities: `html-to-markdown.ts` converter, `ImageUpload` component, slug generation.
- Goal: Extract common editor components into reusable pieces that both articles and experiments use.

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
- **Currently Implemented**: NIP-01, NIP-05, NIP-07, NIP-10, NIP-19, NIP-25, NIP-44, NIP-46, NIP-57, NIP-65.
- **Key Event Kinds Used**: 0, 1, 3, 6, 7, 9, 11, 12, 1059, 1060, 10002, 30023, 30078.
- **Priority NIPs to Implement Next**: NIP-17, NIP-29, NIP-42, NIP-51, NIP-09, NIP-32, NIP-56, NIP-72, NIP-94, NIP-98.
- **Relay Architecture**: Private LaB Relay for all private/encrypted data. Public Relays for public content. Events with private tags NEVER go to public relays.

### Article Editor (Primal-Style)
- **Route**: `/articles/edit` for new articles, `/articles/edit/:naddr` for editing existing.
- **My Articles**: `/articles` page lists published articles and drafts with edit/delete actions.
- **Rich Text Editor**: TipTap (ProseMirror-based) with toolbar: block type selector, bold, italic, underline, strikethrough, bullet/ordered lists, table, image, blockquote, link, code block, horizontal rule.
- **NIP-23 Compliant**: Articles published as kind 30023 events with Markdown content. Tags include: d (identifier), title, summary, image, published_at, t (hashtags), client.
- **Drafts**: Kind 30024 events saved privately (no published_at tag). Drafts only go to LAB relay.
- **Preview Mode**: Toggle between edit and preview in right sidebar.
- **Options**: Show/hide article metadata, enable/disable hero image.
- **HTML-to-Markdown**: Custom converter ensures NIP-23 content interoperability.

### Feed Features (Primal-Style)
- **Text Truncation**: Primal-style "see more" truncation on long posts (1400 char / 200 word limits). Purple "see more" link expands content inline.
- **Long-form Articles (NIP-23)**: Kind 30023 long-form content displayed as collapsed article cards in the feed. Parses title, summary, image, hashtags, and published_at from NIP-23 tags. Also handles Primal's kind 10030023 shell events for article previews. Articles are deduplicated and sorted, interleaved every 5 posts in the explore feed.
- **Profile Enhancements**: Primal-style tabbed follow dialog (Following/Followers tabs with counts). Context menu on "..." button (Add user feed, Copy user link, Copy public key). 3:1 banner aspect ratio with no rounded corners. Avatar overlaps banner bottom edge. QR code button copies public key. Follower counts from kind 10000108/10000133 events.

## External Dependencies
- **PostgreSQL**: Primary database (Neon serverless).
- **Nostr Relays**: Private Railway Relay, public relays (e.g., `relay.primal.net`).
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