# My Masterpiece App

## Overview
My Masterpiece is a spiritual personal growth application designed to help users curate their personal growth journey. It offers a personalized dashboard, integrated consumption of courses/podcasts/music, collaboration tools, private journaling, and an AI coach with persistent memory. The app leverages a hybrid Nostr and PostgreSQL architecture, integrating Lightning payments for peer-to-peer interactions. The platform aims to combine features from various popular platforms into a singular, cohesive experience focused on personal transformation, hosting the "11x LOVE LaB" community.

## User Preferences
- Preferred communication style: Simple, everyday language
- Daily LOVE Practice is the MOST IMPORTANT feature (LOVE always capitalized)
- Sparkles icon ONLY for Magic Mentor AI - no other usage
- NO colored icons anywhere - all icons use muted-foreground color
- Hover interactions use light purple (#F0E6FF), never blue
- All colors solid hex, no opacity values
- Privacy-first: entries default to private, optional sharing
- Love Board is planned as a marketplace (help wanted, items for sale) for paid members - currently shows as leaderboard

## System Architecture

### Design Principles
- **Font**: Marcellus font, weight 400 ONLY. Global CSS enforces `font-weight: 400 !important` on all elements.
- **Color Scheme**: Primary brand color is Purple (#6600ff) for links, accents, and progress indicators ONLY. Action buttons use `bg-foreground` (dark charcoal), with hover state: white background and light gray border (#E5E5E5). Pink (#eb00a8) is exclusively for the GOD/LOVE dimension. All colors are solid hex values.
- **Card Images**: All card images use a 16:9 aspect ratio (`aspect-video`).
- **Tags/Badges**: All tags and badges use a light gray outline style (white background, `border-gray-200`, `text-muted-foreground`).
- **Tabs/Bubbles**: Category tabs use a rounded-full pill/bubble style.
- **Dropdowns**: Select triggers use `h-9 text-sm`. Items highlight with `bg-gray-50`.
- **Terminology**: "Experiments" is the primary term for learning content, with buttons saying "Start Experiment" / "View Experiment".
- **Visual Style**: Features a purple gradient aesthetic. Homepage is a "Prosperity Pyramid". Navigation includes a left sidebar (desktop) and top header. Cards use `rounded-xs` corners with flip animations. Ghost button hover uses light purple (#F5F3FF/foreground text).
- **Feed Layout**: Three-column layout similar to social media feeds. Left (240px) and right (300px) sidebars are sticky.
- **Mobile Design**: Compact header (56px), hamburger menu. Cards are taller (200px min), 4:3 aspect ratio. AI button is floating bottom-right.
- **Privacy Architecture**: Three-tier privacy for data (encrypted tribe messages, private by default journals/AI conversations, shareable completions/feed posts). Dual-relay architecture using a private Railway Relay for LaB data and public relays for general Nostr data. Users can provide their own AI API key (BYOK).

### Core Frameworks & Curriculum
- **The Prosperity Pyramid**: Organizes life into 11 Dimensions across 5 macro-categories.
- **FCLADDD Villains Framework**: Identifies 7 "villains" for AI tracking and antidote suggestions.
- **Daily LOVE Practice**: Structured morning (VIBE, VISION, VALUE, VILLAIN, VICTORY) and evening (CELEBRATIONS, LESSONS, BLESSINGS, DREAM VIBES) reflections.
- **11x LOVE Code Curriculum**: An 18-lesson curriculum across 5 modules with sequential unlocking.

### Technical Implementation
- **Frontend**: React 18, TypeScript, Wouter, TanStack React Query, Tailwind CSS v4, shadcn/ui, Framer Motion, Vite.
- **Backend**: Node.js, Express, TypeScript, RESTful JSON APIs, Drizzle ORM, Neon serverless PostgreSQL.
- **Data Storage**: Hybrid PostgreSQL for public/structured data and Nostr Private Relay for encrypted personal data (NIP-44 encrypted).
- **AI Integration (Magic Mentor)**: Uses Claude Haiku 4.5 via Anthropic SDK, with system prompts including user profile, journal, and dreams. Supports three-tier access (Free, Paid, BYOK) and planned 4-layer AI memory.
- **Authentication**: Dual system with Email/password (bcrypt, JWT, optional TOTP) and Nostr Login (NIP-07, NIP-46). Email users auto-generate client-side Nostr keypairs for NIP-44 encryption.
- **Key Features Implemented**: Dual authentication, Prosperity Pyramid homepage, Big Dreams Dashboard, Journal, Daily LOVE Practice (with streak tracking), Experiments, Events, Community, Vault, Love Board, Feed (live Nostr events via NDK), User Profiles, Creator Dashboard, Settings, Wallet, Relays, Content creation tools, Social features (Nostr sharing, Post Actions).
- **Big Dreams Dashboard**: The primary daily hub/dashboard page. Contains Daily LOVE Practice CTA at top, GitHub-style streak grid, experiment progress sidebar, upcoming events sidebar, and 11 Big Dreams editor with progress tracking. Daily Practice is NOT in the nav menu - accessed only from Big Dreams page.
- **Daily LOVE Practice**: Full-page experience with morning wizard, evening reflection, summary, history, and streak counter, backed by PostgreSQL. Hidden from nav, accessible from Big Dreams dashboard.
- **Profile Page**: Clean, Primal-style profile with avatar, display name, NIP-05, lightning address, about bio, buddy matching info, and published content. No gamification (no XP, levels, badges, rewards).
- **StreakGrid Component**: Reusable GitHub-style contribution grid in `client/src/components/streak-grid.tsx`, used by both Big Dreams dashboard and Vault pages.
- **Nostr Feed Integration**: Uses Primal Cache API for public feeds and NDK with private Railway relay for private feeds (Tribes, Buddies). Displays real Nostr data, handles post interactions as Nostr events, and parses inline images/videos.
- **Profile Editing**: Allows editing name, buddy matching toggle, buddy description, and LaB interests.
- **Membership Tiers**: Six tiers from Free to Creator BYOK.
- **Design Patterns**: Monorepo structure (`client/`, `server/`, `shared/`), path aliases, centralized API client.
- **Security**: Dual auth middleware (JWT, Nostr pubkey header), NIP-07/NIP-46 authentication, ownership checks, Nostr query filtering.

### Key UI Components (Modified)
- **Button**: Uses `bg-foreground` as default, `hover:bg-white` with `hover:border-[#E5E5E5]`.
- **Badge**: `font-normal`, typically outline/light gray style.
- **Select**: Trigger `h-9 text-sm`, items highlight with `bg-gray-50`.
- **EventCard**: Vertical layout with 16:9 image on top.
- **Experiments Page**: Tabs as rounded-full bubble buttons; cards use 16:9 images.

## External Dependencies
- **PostgreSQL**: Primary database (Neon serverless).
- **Nostr Relays**: Private Railway Relay for LaB data, and public relays (e.g., `relay.primal.net`, `relay.damus.io`) for public Nostr data.
- **Anthropic API**: Magic Mentor AI (Claude Haiku 4.5).
- **OpenRouter API**: Alternative AI provider.
- **Primal Cache API**: WebSocket service (`cache1.primal.net/v1`) for fast public Nostr feeds.
- **Alby / nos2x**: NIP-07 Nostr login.
- **nsec.app**: NIP-46 Bunker Login.
- **Tailwind CSS v4**: Styling.
- **shadcn/ui**: UI component library.
- **Framer Motion**: Animations.
- **Vite**: Frontend build tool.