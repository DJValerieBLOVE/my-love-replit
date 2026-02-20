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
- Love Board is planned as a marketplace (help wanted, items for sale) for paid members - currently shows as leaderboard
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
- **Typography**: Marcellus font, weight 400 ONLY everywhere. Global CSS enforces `font-weight: 400 !important`.
- **Color Palette**:
  - Background: `#FAFAFA`
  - Foreground: `#2a2430` (Dark Purple-Black)
  - Primary Brand: `#6600ff` (Purple - for links, accents, active nav)
  - GOD/LOVE Dimension: `#eb00a8` (Pink - exclusively for GOD/LOVE)
  - All colors must be solid hex values.
- **Buttons**:
  - Default/Primary: `bg-foreground text-background` (dark charcoal fill, white text). Hover: `hover:bg-white hover:border-[#E5E5E5] hover:text-foreground`.
  - Ghost Button Hover: Light purple `hover:bg-[#F0E6FF]`.
  - Never use blue for any button or hover state.
- **Tabs / Pill Bubbles**: Consistent `rounded-full` shape with active state `bg-foreground text-background border-foreground` and inactive state `bg-white text-muted-foreground border-gray-200`. Used on Feed, Experiments, Events, Vault.
- **Search Inputs**: Always `bg-white` with `Search` icon at `left-3` and `pl-10` for input.
- **Cards**: `border-none shadow-sm bg-card rounded-xs` with `hover:shadow-md`. Images are 16:9 (`aspect-video`). Top accent is a thin purple line (`bg-primary`). Card titles turn purple on group hover. Dashed borders for placeholder cards.
- **Tags / Badges**: Light gray outline style: `bg-white border border-gray-200 text-muted-foreground text-xs px-2.5 py-0.5 rounded-md`.
- **Navigation**:
  - Left Sidebar: White background, active/hover items use `text-[#6600ff]` (purple text only, no background highlight).
  - Header: White background, sticky, `h-14 md:h-20`.
  - Mobile: Hamburger menu, compact header.
- **Icons**: ALL icons use `text-muted-foreground` color, except the Sparkles icon for Magic Mentor AI. Lucide React icons with `strokeWidth={1.5}`.

### Key Pages & Features
- **Home** (`/`): Prosperity Pyramid with flip card animations.
- **Big Dreams** (`/big-dreams`): Primary daily hub/dashboard with Daily LOVE Practice CTA, streak grid, experiment progress, upcoming events, and 11 Big Dreams editor.
- **Daily LOVE Practice** (`/daily-practice`): Full-page wizard, accessible only from Big Dreams dashboard.
- **Experiments** (`/experiments`): 6 tabs for learning content.
- **Events** (`/events`): 4 tabs with calendar and event cards.
- **Feed** (`/feed`): 4 tabs for Nostr social feed.
- **Vault** (`/vault`): 6 tabs for personal content.
- **Tribe/Community** (`/community`): Community listing, creation, and management.
- **Love Board** (`/leaderboard`): Rankings (planned marketplace).
- **Profile** (`/profile/:id`): Clean Primal-style profile with no gamification.
- **Creator Dashboard** (`/creator`): Analytics for content creators.
- **Wallet** (`/wallet`): Lightning wallet with NWC integration.
- **Security**: Dual auth middleware (JWT, Nostr pubkey), NIP-07/NIP-46, ownership checks, Nostr query filtering, AI prompt injection protection, atomic transactions for AI usage.

### Privacy Architecture
- Three-tier privacy: encrypted tribe messages, private-by-default journals/AI conversations, shareable completions/feed posts.
- Dual-relay architecture: private Railway Relay for LaB data, public relays for general Nostr data.
- Users can provide their own AI API key (BYOK).

## External Dependencies
- **PostgreSQL**: Primary database (Neon serverless).
- **Nostr Relays**: Private Railway Relay, public relays (e.g., `relay.primal.net`).
- **Anthropic API**: Magic Mentor AI (Claude Haiku 4.5).
- **OpenRouter API**: Alternative AI provider.
- **Primal Cache API**: WebSocket service for fast public Nostr feeds.
- **Alby / nos2x**: NIP-07 Nostr login.
- **nsec.app**: NIP-46 Bunker Login.
- **Tailwind CSS v4**: Styling framework.
- **shadcn/ui**: UI component library.
- **Framer Motion**: Animations.
- **Vite**: Frontend build tool.
- **Drizzle ORM**: Database queries and migrations.
- **TanStack React Query**: Server state management.
- **Wouter**: Client-side routing.