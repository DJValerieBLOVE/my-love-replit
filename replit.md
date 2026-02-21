# My Masterpiece App

## Overview
My Masterpiece is a spiritual personal growth application aiming to help users curate their personal growth journey. It provides a personalized dashboard, integrated consumption of growth content (courses, podcasts, music), collaboration tools, private journaling, and an AI coach with persistent memory. The app leverages a hybrid Nostr and PostgreSQL architecture, integrating Lightning payments for peer-to-peer interactions. The platform seeks to unify features from various popular platforms into a singular, cohesive experience focused on personal transformation, specifically hosting the "11x LOVE LaB" community.

## Recent Changes (February 21, 2026)
- **Prompt 3 Complete**: Quizzes, Progress Tracking & Social Sharing
  - Added quiz builder to experiment steps (multiple choice with correct answer marking)
  - Added quiz player in experiment detail (confetti on correct, score tracking, result persistence)
  - Added enrollment flow with "Start Experiment" / "Enroll Now" buttons
  - Added step completion with "Mark Complete" button and server-side progress calculation
  - Added progress bars on experiment cards, experiment detail sidebar, and Big Dreams page
  - "In Progress" and "Complete" tabs on experiments page now filter by actual enrollment data
  - Module completion modal with "Share Your Progress" and experiment completion modal with "Share Your Win"
  - Quiz performance summary shown in completion modal
  - Server-side totalSteps validation (prevents client tampering)
  - Database: Added completedSteps (text[]), quizResults (jsonb), completedAt (timestamp) columns to userExperiments table
  - New API routes: GET /api/user-experiments/experiment/:experimentId, POST /api/user-experiments/:id/complete-step, POST /api/user-experiments/:id/quiz-result

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
- **Tabs / Pill Bubbles**: `rounded-full` shape with active and inactive states.
- **Search Inputs**: `bg-white` with `Search` icon at `left-3` and `pl-10`.
- **Cards**: `border-none shadow-sm bg-card rounded-xs` with `hover:shadow-md`. Images are 16:9 (`aspect-video`) with no overlays/tags. Top accent is a thin purple line.
- **Tags / Badges**: Light gray outline style: `bg-white border border-gray-200 text-muted-foreground text-xs px-2.5 py-0.5 rounded-md`.
- **Create Buttons**: Each listing page has a "Create" button in the tab/header row area.
- **Navigation**: Left Sidebar white background, active/hover items `text-[#6600ff]`. Header white background, sticky. Mobile has hamburger menu.
- **Icons**: ALL icons use `text-muted-foreground` color, except the Sparkles icon for Magic Mentor AI. Lucide React icons with `strokeWidth={1.5}`.

### Key Features and Pages
- **Home**: Prosperity Pyramid with flip card animations.
- **Big Dreams**: Daily hub with Daily LOVE Practice CTA, streak grid, experiment progress (shows enrolled experiments with real progress data), upcoming events, and 11 Big Dreams editor.
- **Daily LOVE Practice**: Full-page wizard accessible from Big Dreams.
- **Experiments** (`/experiments`): Full curriculum platform with 11 Dimensions filter (colored dots), experiment cards with dimension accent colors and progress bars for enrolled users. Builder (`/experiments/create`) supports Module > Step hierarchy, TipTap rich text, YouTube/Vimeo embeds, quiz questions per step, "Who Could Benefit" and "Outcomes" fields. Auto-save drafts (5s debounce). Edit mode at `/experiments/edit/:id`. My Experiments section with Drafts/Published tabs. In-Progress and Complete tabs filter by actual enrollment data. API: PUT/DELETE with ownership validation. Tiered privacy: catalog public, content behind auth. Lightning zaps on completion.
- **Experiment Detail** (`/experiments/:id`): Full step viewer with enrollment flow, quiz player (confetti, score tracking), step completion ("Mark Complete" button), progress sidebar, module/experiment completion modals with "Share Your Win" social sharing.
- **Events**: Calendar and event cards.
- **People**: Unified social hub with dropdown pill bubbles, right sidebar with gamification placeholders, and 4-tier privacy selector on all post composers.
- **Vault**: Tabs for personal content.
- **Tribe/Community**: Listing, creation, and management of tribes.
- **Love Board**: Planned marketplace at /leaderboard route.
- **Profile**: Clean Primal-style profile with no gamification, showing Nostr synced data. Follow/unfollow system with Kind 3 contact list management.
- **Creator Dashboard**: Analytics for content creators.
- **Wallet**: Lightning wallet with NWC integration.
- **Security**: Dual auth middleware, NIP-07/NIP-46/nsec local signer, ownership checks, Nostr query filtering, AI prompt injection protection, atomic transactions for AI usage.
- **Shared Rich Text Editor**: Reusable TipTap-based editor with toolbar.
- **Value-for-Value Architecture**: Creators receive Lightning zaps for experiments.
- **Image Upload System**: Server-side multer upload, stored locally, 5MB limit.
- **Privacy Architecture**: Four-tier privacy system on composers, dual-relay architecture (private LaB Relay, public relays).
- **Experiment Tiered Privacy**: Public catalog and completion posts (Nostr), private full content (behind auth).
- **Nostr NIPs Implementation**: NIP-01, NIP-05, NIP-07, NIP-10, NIP-19, NIP-25, NIP-44, NIP-46, NIP-57, NIP-65 currently implemented.
- **Article Editor**: Primal-style NIP-23 compliant article editor with drafts.
- **Feed Features**: Primal-style text truncation, NIP-23 long-form article display, profile enhancements (tabbed follow dialog, context menu, banner, QR code). Primal-style image lightbox on feed posts (click to expand fullscreen with keyboard nav).

### Experiment Progress Tracking System
- **Database Schema**: `userExperiments` table tracks enrollment with `completedSteps` (text[]), `quizResults` (jsonb of StepQuizResult[]), `completedAt` (timestamp), `progress` (0-100 integer), `completedDiscoveries` (count).
- **StepQuizResult Interface**: `{ stepId: string, score: number, total: number, completedAt: string }`.
- **QuizQuestion Interface**: `{ question: string, options: string[], correctIndex: number }` — stored in experiment step modules JSON.
- **API Routes**: `GET /api/user-experiments/experiment/:experimentId` (get enrollment), `POST /api/user-experiments` (enroll, idempotent), `POST /api/user-experiments/:id/complete-step` (mark step done, server computes progress from experiment modules), `POST /api/user-experiments/:id/quiz-result` (save quiz score, replaces previous attempt for same step).
- **Progress Calculation**: Server-side only — reads experiment modules to count total steps, divides completed steps by total. Prevents client tampering.
- **Quiz Builder**: In experiment builder, each step has "Add Quiz Question" button. Supports 2-6 options per question, radio button to mark correct answer. Questions stored in step's `quizQuestions` array within modules JSON.
- **Quiz Player**: StepQuiz component shows questions one at a time, instant feedback (green/red), confetti on correct, score summary at end. Persists results to DB. Shows "Quiz Completed" badge if already taken.

### Nsec Login & Local Signer (Primal-Style)
- **Local Signer** (`client/src/lib/local-signer.ts`): `createLocalSigner()` returns `signEvent`, `nip04.encrypt/decrypt`, `nip44.encrypt/decrypt`, `getPublicKey()`. Keys derived from nsec via `@noble/hashes` and `nostr-tools`. Helpers: `storeNsec`, `readStoredNsec`, `clearStoredNsec` (localStorage).
- **NostrContext**: `connectWithNsec(nsec)` method. Session restore via `checkNsecSession()` on page refresh. Sign event priority: local signer > bunker > extension. Disconnect clears nsec.
- **Login Dialog**: Nostr tab has 3 options — Extension (NIP-07), Private Key (nsec paste), Bunker (NIP-46). Nsec input has visibility toggle, security warning, back navigation.
- **Login Methods**: `"extension" | "bunker" | "ncryptsec" | "email" | null`.

### Experiment Builder Implementation Details
- **Database Schema**: `experiments` table has `modules` JSON field (Module > Step hierarchy), `dimension` (required), `benefitsFor`, `outcomes`, `isPublished`, `accessType`, `price`. 11 Dimensions replace categories. Each step can have `quizQuestions` array.
- **Builder Features**: Auto-save drafts (5s debounce), edit mode (`/experiments/edit/:id`) with ownership check, My Experiments with Drafts/Published tabs, Module > Step hierarchy with collapsible/reorderable UI, TipTap rich text per step, YouTube/Vimeo URL validation per step, quiz question builder per step.
- **API**: `POST /api/experiments` (create), `PUT /api/experiments/:id` (update with ownership), `DELETE /api/experiments/:id` (delete with ownership), `GET /api/experiments/my` (user's experiments).
- **Tags**: Current tags are placeholders — will be replaced with custom tags system.

## What Still Needs Work
- **Events**: Full CRUD, RSVP system, calendar integration, event detail pages need to be functional end-to-end
- **Love Board / Marketplace**: Build out marketplace listings (For Sale, Help Wanted, Services, Other) at /leaderboard route for paid members
- **Vault Private Data**: Connect daily journals, experiment progress, notes to Vault page with NIP-44 encryption on private relay — user data portable and downloadable
- **Daily LOVE Practice ↔ Vault**: Ensure practice entries are stored encrypted on private relay and accessible from Vault
- **Notes System**: Build/verify notes CRUD and make sure they work properly
- **Private Relay Data Sync**: All personal data (journals, experiments, notes, dreams) should be NIP-44 encrypted on private relay so users can download/unlock anywhere
- **Social Sharing**: Verify Nostr kind 1 posts actually publish to relays on experiment/module completion

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
