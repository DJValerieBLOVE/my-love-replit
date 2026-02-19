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
- **Visual Style**: Features a purple gradient aesthetic. The homepage is structured as a "Prosperity Pyramid" with 5 areas (Health, People, Purpose, Wealth) centered around GOD. Navigation includes a left sidebar (desktop) and top header. Cards use `rounded-xs` corners with flip animations, where flipped card backs have a light background (#FAF8F5).
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
- **Authentication**: NIP-07 Nostr Login (Alby, nos2x) and NIP-46 Bunker Login (nsec.app). User's Nostr pubkey is linked to database accounts, and email collection is mandatory.
- **Key Features Implemented**: Authentication, Prosperity Pyramid homepage, Big Dreams, Journal, Experiments, Events, Community, Vault, Love Board, Feed, User Profiles, Creator Dashboard, Settings, Wallet, Relays pages. Also includes content creation tools (Course Builder, Experiment Builder, Post Composer) and social features (Nostr sharing, Post Actions, Privacy Rules).
- **Membership Tiers**: Six tiers from Free to Creator BYOK, offering varying access to features like progress tracking, comments, tribes, AI tokens, and content creation.
- **Design Patterns**: Monorepo structure (client/, server/, shared/), path aliases (`@/`, `@shared/`, `@assets/`), and a centralized API client.
- **Security**: NIP-07/NIP-46 authentication, user identity via `nostrPubkey`, `authMiddleware` for header validation, ownership checks on data routes, and Nostr query filtering by authors.

## External Dependencies
- **PostgreSQL**: Primary database for public and structured application data (Neon serverless).
- **Nostr Relays**:
    - Private Railway Relay (wss://nostr-rs-relay-production-1569.up.railway.app): For encrypted personal LaB data.
    - Public Relays (e.g., wss://relay.primal.net, wss://relay.damus.io, wss://relay.ditto.pub): For public Nostr profiles, follows, posts, reactions, zaps.
- **Anthropic API**: For the Magic Mentor AI (Claude Haiku 4.5 model).
- **OpenRouter API**: Alternative AI provider for BYOK users.
- **Alby / nos2x**: Browser extensions for NIP-07 Nostr login.
- **nsec.app**: Remote signer for NIP-46 Bunker Login.
- **Tailwind CSS v4**: Styling framework.
- **shadcn/ui**: UI component library based on Radix UI primitives.
- **Framer Motion**: Animation library.
- **Vite**: Frontend build tool.