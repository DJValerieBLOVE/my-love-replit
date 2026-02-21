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

## Remaining Prompts (use in order, one per chat)

### Prompt 3 - Magic Mentor AI Formatting Assistant

> Read EXPERIMENT_BUILDER_PLAN.md and replit.md fully before starting. Add Magic Mentor AI to the experiment builder:
>
> - Add a Sparkles icon button (the ONLY icon that gets color — all others use `text-muted-foreground`) to the experiment builder that opens a side panel.
> - **Content Assistant**: Magic Mentor can help users format and structure their experiment content within the rich text editor. It can suggest formatting improvements, organize steps, and auto-format raw text into properly structured content.
> - **Experiment Generator**: Magic Mentor can help users CREATE an entire experiment from their goals. User describes what they want to teach/explore, and AI generates a full module>step structure with titles, content outlines, suggested quiz questions, and recommended 11 Dimension.
> - **Content Upload Support**: Guides should be able to upload/paste their raw content (text, outlines, notes) and have Magic Mentor help organize it into the module>step format with proper formatting.
> - Use the existing Anthropic integration (`client/src/contexts/nostr-context.tsx` and server AI routes). Claude Haiku 4.5.
> - Follow replit.md style guide and NOSTR_GUIDELINES.md.
>
> Key files: `client/src/pages/experiment-builder.tsx`, `client/src/contexts/nostr-context.tsx`, server AI routes, `client/src/components/rich-text-editor.tsx`

### Prompt 4 - Quizzes, Progress Tracking, Zaps & Social Sharing

> Read EXPERIMENT_BUILDER_PLAN.md and replit.md fully before starting. Read NOSTR_GUIDELINES.md for any Nostr work. This prompt covers interactivity and social features:
>
> **A. Quizzes**:
> - Add quiz builder UI in the experiment builder: after each step, guide can add quiz questions (multiple choice). Schema: `{question: string, options: string[], correctIndex: number}[]` per step.
> - In the experiment detail/player: after completing a step's content, show the quiz. On correct answers, play a celebration animation (confetti/sparkle) and auto-load the next step. Track quiz results per user.
>
> **B. Progress Tracking**:
> - Track user progress per step, per module, and per experiment (percentage completion).
> - Show progress bars on experiment cards and detail pages.
> - Link experiment progress to the Big Dreams tracker on `/big-dreams` page.
> - Progress cards showing active experiments and completion status.
> - Visualize with streak-style grids or progress rings.
>
> **C. Lightning Zaps (Value-for-Value)**:
> - "Zap the Creator" modal appears after each step completion, module completion, and full experiment completion. Uses NIP-57 zap implementation with NWC (Nostr Wallet Connect).
> - Check existing wallet integration at `client/src/pages/wallet.tsx`.
>
> **D. Social Sharing & Auto-Share**:
> - On module and experiment completion, offer "Share Your Win" that creates a kind 1 Nostr note posted to PUBLIC relays. The note includes: experiment name, teaser description, user's personal reflection (they write it), beautiful card preview image, link back to the app (e.g., `11xlove.shakespeare.wtf/experiments/[slug]`).
> - Auto-share option: users can opt-in to automatically post completion notes.
> - Comments on individual steps/experiments are PRIVATE (Railway relay only) but can receive zaps from other community members.
>
> Key files: `client/src/pages/experiment-detail.tsx`, `client/src/pages/experiment-builder.tsx`, `client/src/pages/wallet.tsx`, `client/src/pages/big-dreams.tsx`, `client/src/contexts/ndk-context.tsx`, `client/src/lib/relays.ts`, `shared/schema.ts`, `NOSTR_GUIDELINES.md`

### Prompt 5 - Feed Image Expand (Bonus)

> Add Primal-style image expand/lightbox to feed posts. When a user clicks on an image in a feed post, it should expand to a fullscreen lightbox view (like Primal does). This applies to all feed posts across the app (People page, profile feeds, etc.). Reference Primal's implementation at https://github.com/PrimalHQ/primal-web-app for the UX pattern.
>
> Key files: `client/src/components/feed-post.tsx`

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
- `client/src/pages/experiment-builder.tsx` - Experiment builder (DONE - Prompt 2)
- `client/src/pages/experiment-detail.tsx` - Experiment viewer (DONE - Prompt 2)
- `client/src/pages/experiments.tsx` - Experiments listing (DONE - Prompt 2)
- `client/src/lib/mock-data.ts` - ELEVEN_DIMENSIONS (canonical) / LOVE_CODE_AREAS (alias)
- `client/src/lib/html-to-markdown.ts` - HTML-to-Markdown converter
- `client/src/contexts/ndk-context.tsx` - NDK/Nostr context
- `client/src/contexts/nostr-context.tsx` - Nostr context with AI integration
- `client/src/lib/relays.ts` - Relay privacy architecture
- `shared/schema.ts` - Database schema (experiments table)
- `server/routes.ts` - API routes
- `server/storage.ts` - Storage interface
- `NOSTR_GUIDELINES.md` - Nostr development rules
- `replit.md` - Project plan and style guide
