# Experiment Builder Upgrade Plan

## Overview
Upgrade the experiment builder into a full curriculum-building platform with module>step hierarchy, 11 Dimensions (replacing categories), rich text editing, quizzes, progress tracking, Magic Mentor AI assistance, Lightning zaps, and tiered Nostr privacy (public catalog for discovery, private content behind login).

## Completed

### Prompt 1 - Extract Reusable Rich Text Editor Components (DONE)
Extracted TipTap rich text editor, toolbar, and preview into shared components:
- `client/src/components/rich-text-editor.tsx` - useRichTextEditor hook, RichTextEditorContent, EditorPreview, EditorModeToggle, richTextEditorStyles
- `client/src/components/editor-toolbar.tsx` - ToolbarButton, ToolbarSelect, EditorToolbar
- Article editor refactored to use shared components (working, tested)

### Prompt 2 - Schema Update & Builder Redesign (DONE)
Full experiment builder redesign completed:
- **Database Schema**: Restructured `steps` → `modules` JSON field (Module > Step hierarchy). Added `dimension` (required, replaces `category` + `loveCodeArea`), `benefitsFor`, `outcomes` fields. Removed `guide`, `category`, `loveCodeArea`, `steps` columns. Migration executed safely.
- **11 Dimensions**: Removed `EXPERIMENT_CATEGORIES`. `ELEVEN_DIMENSIONS` is the canonical source (with `LOVE_CODE_AREAS` as backward-compat alias). All dropdowns/filters across experiments, community, and people pages updated with colored dots and "All Dimensions" option.
- **Builder Form** (`/experiments/create`): Field order — Title, 11 Dimensions (required, colored dots), Tags (placeholder), Description, Who Could Benefit, Outcomes & Goals, Thumbnail (compact upload button with 16:9 label). Guide auto-filled from Nostr profile (read-only with avatar). Module > Step hierarchy with collapsible modules, reorderable steps, TipTap rich text editor per step, YouTube/Vimeo URL field with validation. Access type, pricing, and publish toggle preserved.
- **Listing Page** (`/experiments`): 11 Dimensions filter dropdown with colored dots, tag filter, search. Cards show dimension accent color bar and dimension badge. Step count from modules structure.
- **Detail Page** (`/experiments/:id`): Sidebar with Module > Step curriculum navigation, YouTube/Vimeo embeds, dimension badge with colored dot, benefits/outcomes sections. Tiered privacy: full content only for authenticated users, catalog preview with "Login to start" CTA for unauthenticated visitors.
- **Tags**: Current tags are placeholders — will be replaced with custom tags later.

### Prompt 2.5 - Nsec Login & Local Signer (DONE)
- Created `client/src/lib/local-signer.ts` — Primal-style local signer with `createLocalSigner()`, `storeNsec`, `readStoredNsec`, `clearStoredNsec`.
- Added `connectWithNsec(nsec)` to NostrContext with session restore via `checkNsecSession()`.
- Updated login dialog with 3 Nostr options: Extension, nsec paste, Bunker.
- Sign event priority: local signer > bunker > extension. Nsec never sent to server.

### Prompt 2.6 - Profile Hover Dropdown & Feed Image Lightbox (DONE)
- Profile dropdown in header now activates on hover (not click), with 200ms close delay.
- Primal-style image lightbox added to feed posts — click any image to expand fullscreen with keyboard navigation (Escape, left/right arrows), dot indicators for multi-image posts.
- Key files: `client/src/components/layout.tsx`, `client/src/components/feed-post.tsx`, `client/src/components/image-lightbox.tsx`

## Remaining Prompts (use in order, one per chat)

### Prompt 3 - Quizzes, Progress Tracking & Social Sharing (DONE)
- Quiz builder added to experiment builder (per-step, multiple choice, 2-6 options, correct answer marking)
- Quiz player in experiment detail (confetti on correct, score tracking, result persistence, "Quiz Completed" badge)
- Enrollment flow with "Start Experiment" / "Enroll Now" buttons (idempotent)
- Step completion with "Mark Complete" button, server-side progress calculation from experiment modules
- Progress bars on experiment cards, experiment detail sidebar, and Big Dreams page
- "In Progress" and "Complete" tabs on experiments page filter by actual enrollment data
- Module completion modal with "Share Your Progress" and experiment completion modal with "Share Your Win"
- Quiz performance summary shown in completion modal
- Database: Added completedSteps (text[]), quizResults (jsonb), completedAt (timestamp) to userExperiments
- New API routes: GET /api/user-experiments/experiment/:experimentId, POST /api/user-experiments/:id/complete-step, POST /api/user-experiments/:id/quiz-result
- Key files updated: `shared/schema.ts`, `server/routes.ts`, `server/storage.ts`, `client/src/pages/experiment-detail.tsx`, `client/src/pages/experiment-builder.tsx`, `client/src/pages/experiments.tsx`, `client/src/pages/big-dreams.tsx`, `client/src/lib/api.ts`

### Prompt 4 - Lightning Zaps (Value-for-Value)

> Read EXPERIMENT_BUILDER_PLAN.md and replit.md fully before starting. Read NOSTR_GUIDELINES.md for Nostr work. This prompt adds the Lightning payment layer:
>
> - "Zap the Creator" modal appears after each step completion, module completion, and full experiment completion. Uses NIP-57 zap implementation with NWC (Nostr Wallet Connect).
> - Check existing wallet integration at `client/src/pages/wallet.tsx` and `client/src/lib/nwc.ts`.
> - Zap amounts should be customizable with preset options.
> - Show total zaps received on experiment cards and creator profiles.
> - Only Nostr-logged-in users can zap (email users see "Connect with Nostr to zap").
>
> Key files: `client/src/pages/experiment-detail.tsx`, `client/src/pages/wallet.tsx`, `client/src/lib/nwc.ts`, `client/src/contexts/ndk-context.tsx`, `NOSTR_GUIDELINES.md`

### Prompt 5 - Magic Mentor AI Setup (Grok via OpenRouter)

> Read EXPERIMENT_BUILDER_PLAN.md and replit.md fully before starting. This prompt sets up the Magic Mentor AI foundation using Grok via OpenRouter (NOT Anthropic — Grok is cheaper):
>
> **A. OpenRouter + Grok Integration**:
> - Set up OpenRouter API integration on the server with Grok as the model (replace or supplement existing Anthropic routes).
> - Create a dedicated Magic Mentor API endpoint that handles AI conversations with proper system prompts.
> - Ensure user data (journal entries, progress, dreams) is passed securely as context — never stored on external AI servers.
>
> **B. Magic Mentor Agent Instructions**:
> - Design the base system prompt / agent instructions for Magic Mentor. It should embody the 11x LOVE Code philosophy, understand the Prosperity Pyramid, FCLADDD Villains Framework, and Daily LOVE Practice.
> - The agent should be encouraging, growth-oriented, and reference the user's actual data (journal entries, experiment progress, dreams) when providing guidance.
> - Three-tier access: Free (limited messages), Paid (full access), BYOK (bring your own key for unlimited).
>
> **C. Magic Mentor in Experiment Builder**:
> - Add a Sparkles icon button (the ONLY icon that gets color — all others use `text-muted-foreground`) to the experiment builder that opens a side panel.
> - Content Assistant: helps format/structure experiment content in the rich text editor.
> - Experiment Generator: creates full module>step structures from user goals.
> - Content Upload Support: guides paste raw content and AI organizes into module>step format.
>
> Key files: `client/src/pages/experiment-builder.tsx`, `client/src/components/ai-buddy.tsx`, `server/routes.ts`, `client/src/components/rich-text-editor.tsx`

### Prompt 6 - Custom Tags System

> Read EXPERIMENT_BUILDER_PLAN.md and replit.md fully before starting. Replace the placeholder tag system in experiments with a proper custom tags system:
>
> - Users can create custom tags when building experiments (free-text input with suggestions from existing tags).
> - Tags are stored in the database and searchable/filterable on the experiments listing page.
> - Tag autocomplete from existing tags in the system.
> - Tag cloud or popular tags section on the experiments page.
>
> Key files: `client/src/pages/experiment-builder.tsx`, `client/src/pages/experiments.tsx`, `shared/schema.ts`, `server/routes.ts`

## Design Rules Reminder
- Marcellus font, weight 400 ONLY
- Primary: #6600ff, Background: #FAFAFA, Foreground: #2a2430
- ALL icons: `text-muted-foreground` EXCEPT Sparkles (Magic Mentor AI)
- Colored dots next to 11 Dimension names in ALL dropdowns/filters
- Cards: `border-none shadow-sm bg-card rounded-xs` with `hover:shadow-md`
- Tags: `bg-white border border-gray-200 text-muted-foreground text-xs px-2.5 py-0.5 rounded-md`
- Buttons: Primary `bg-foreground text-background`, Ghost hover `hover:bg-[#F0E6FF]`
- Videos: YouTube/Vimeo embed URLs ONLY — no native video upload (too resource intensive)
- Images: Static image upload is fine (existing multer system), thumbnails 16:9 aspect ratio

## Tiered Privacy Summary
```
PUBLIC (PostgreSQL + public Nostr relays):
├── Experiment catalog (titles, descriptions, previews, thumbnails)
├── Module/step titles (table of contents only)
├── Completion celebration posts (kind 1, user-controlled)
├── "I'm starting [Experiment]!" posts (optional)
└── Public testimonials/reviews

PRIVATE (Railway relay + behind auth):
├── Full step/lesson content (the actual curriculum)
├── User journals and reflections
├── Progress data (streaks, scores, quiz results)
├── Tribe discussions about experiments
├── Comments on specific steps
└── Quiz answers and results
```

## Key Files Reference
- `client/src/components/rich-text-editor.tsx` - Shared TipTap editor (DONE)
- `client/src/components/editor-toolbar.tsx` - Shared toolbar (DONE)
- `client/src/pages/article-editor.tsx` - Article editor using shared components (DONE)
- `client/src/pages/experiment-builder.tsx` - Experiment builder with auto-save, edit mode (DONE - Prompt 2)
- `client/src/pages/experiment-detail.tsx` - Experiment viewer (DONE - Prompt 2)
- `client/src/pages/experiments.tsx` - Experiments listing with My Experiments (DONE - Prompt 2)
- `client/src/lib/mock-data.ts` - ELEVEN_DIMENSIONS (canonical) / LOVE_CODE_AREAS (alias)
- `client/src/lib/html-to-markdown.ts` - HTML-to-Markdown converter
- `client/src/lib/local-signer.ts` - Primal-style nsec local signer (DONE - Prompt 2.5)
- `client/src/contexts/ndk-context.tsx` - NDK/Nostr context
- `client/src/contexts/nostr-context.tsx` - Nostr context with AI integration + nsec login (DONE - Prompt 2.5)
- `client/src/components/nostr-login-dialog.tsx` - Login dialog with Extension/nsec/Bunker/Email (DONE - Prompt 2.5)
- `client/src/components/layout.tsx` - Layout with hover profile dropdown (DONE - Prompt 2.6)
- `client/src/components/feed-post.tsx` - Feed post with image lightbox (DONE - Prompt 2.6)
- `client/src/components/image-lightbox.tsx` - Primal-style image lightbox component (DONE - Prompt 2.6)
- `client/src/components/ai-buddy.tsx` - Magic Mentor AI chat component (to be updated - Prompt 5)
- `client/src/lib/relays.ts` - Relay privacy architecture
- `client/src/lib/nwc.ts` - Nostr Wallet Connect for Lightning zaps
- `shared/schema.ts` - Database schema (experiments table)
- `server/routes.ts` - API routes (experiments CRUD with ownership)
- `server/storage.ts` - Storage interface
- `NOSTR_GUIDELINES.md` - Nostr development rules
- `replit.md` - Project plan and style guide
