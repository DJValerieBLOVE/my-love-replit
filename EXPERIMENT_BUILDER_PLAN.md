# Experiment Builder Upgrade Plan

## Overview
Upgrade the experiment builder into a full curriculum-building platform with module>step hierarchy, 11 Dimensions (replacing categories), rich text editing, quizzes, progress tracking, Magic Mentor AI assistance, Lightning zaps, and tiered Nostr privacy (public catalog for discovery, private content behind login).

## Completed

### Prompt 1 - Extract Reusable Rich Text Editor Components (DONE)
Extracted TipTap rich text editor, toolbar, and preview into shared components:
- `client/src/components/rich-text-editor.tsx` - useRichTextEditor hook, RichTextEditorContent, EditorPreview, EditorModeToggle, richTextEditorStyles
- `client/src/components/editor-toolbar.tsx` - ToolbarButton, ToolbarSelect, EditorToolbar
- Article editor refactored to use shared components (working, tested)

## Remaining Prompts (use in order, one per chat)

### Prompt 2 - Schema Update & Builder Redesign

> Read EXPERIMENT_BUILDER_PLAN.md and replit.md fully before starting. Read NOSTR_GUIDELINES.md for any Nostr work. This prompt covers the full experiment builder redesign:
>
> **A. Database Schema Update** (`shared/schema.ts`):
> - Restructure the `steps` JSON field into a `modules` JSON field that supports a Module > Step hierarchy. Each module has: id, order, title, description. Each step within a module has: id, order, title, content (rich text HTML), videoUrl (YouTube/embed URL, not native upload), quizQuestions (array of {question, options[], correctIndex}).
> - Add `benefitsFor` field (text - "Who could benefit from this experiment")
> - Add `outcomes` field (text - "Why someone would want to do this and what outcomes they could hope to achieve")
> - Rename `loveCodeArea` to `dimension` and make it REQUIRED (not optional). This replaces the separate `category` field which should be REMOVED.
> - Remove the `guide` text field — the guide is always the logged-in user, determined by `creatorId`. Display the user's Nostr profile name/avatar.
> - Run the database migration safely.
>
> **B. 11 Dimensions (replaces Categories)**:
> - In `client/src/lib/mock-data.ts`: Remove `EXPERIMENT_CATEGORIES`. The `LOVE_CODE_AREAS` array (renamed to `ELEVEN_DIMENSIONS`) is the ONLY source for experiment classification. Each dimension has its brand color and colored dot.
> - Update `client/src/pages/experiments.tsx`: Replace category tabs/filters with an 11 Dimensions dropdown that shows colored dots next to each dimension name. "All Dimensions" as default.
> - Update `client/src/pages/experiment-builder.tsx`: Replace the old Category and LOVE Code Area dropdowns with a single required "11 Dimensions" dropdown showing colored dots. Remove the "Guide / Creator" text input — auto-fill from user's Nostr profile.
> - Update `client/src/pages/experiment-detail.tsx`: Show dimension name with colored dot instead of category.
>
> **C. Builder Form Redesign** (`client/src/pages/experiment-builder.tsx`):
> - Auto-fill guide from user's Nostr profile (name + avatar from `useNostr()` context). Show "Guide: [profile name]" as read-only with avatar. Remove "Guide / Creator" text input.
> - Thumbnail image upload area should note "16:9 aspect ratio recommended" and use `aspectRatio="video"`.
> - Add "Who Could Benefit" textarea field.
> - Add "Outcomes & Goals" textarea field (what outcomes they could hope to achieve).
> - **Module > Step Hierarchy**: Replace flat steps list with module containers. Each module is a collapsible section containing its steps. Users can add/remove/reorder modules, and add/remove/reorder steps within each module. UI: Module header with title input, expand/collapse, add step button inside. Steps inside have title, rich text content (using shared TipTap editor from `client/src/components/rich-text-editor.tsx`), YouTube embed URL field, quiz questions section (for Phase 4).
> - For videos: YouTube/Vimeo embed URLs only (NOT native file upload). Display as embedded video player in step content.
> - Keep existing: tags selection, access type (public/community/paid), pricing, publish toggle.
>
> **D. Listing & Detail Pages**:
> - `experiments.tsx`: 11 Dimensions filter dropdown with colored dots. Cards show dimension color accent line.
> - `experiment-detail.tsx`: Show modules > steps navigation. Display dimension with colored dot. Show benefits/outcomes sections. Render YouTube embeds in step content. Show guide as user profile (name + avatar from creatorId lookup).
>
> **E. Tiered Privacy Architecture**:
> - PUBLIC (PostgreSQL, browsable without login): Experiment catalog — title, description/summary, thumbnail image, dimension, guide profile, benefits, outcomes, tags, module/step titles (table of contents). This is the "storefront."
> - PRIVATE (behind auth, private relay): Full step content (rich text lessons), user journals/reflections, progress data, comments on steps, quiz results, tribe discussions. This is the curriculum.
> - When saving experiments: Metadata goes to PostgreSQL. Full lesson content stored in the `modules` JSON field but only served to authenticated users. The detail page shows a preview/teaser to unauthenticated users with a "Login to start" CTA.
>
> Key files: `shared/schema.ts`, `client/src/pages/experiment-builder.tsx`, `client/src/pages/experiments.tsx`, `client/src/pages/experiment-detail.tsx`, `client/src/lib/mock-data.ts`, `client/src/components/rich-text-editor.tsx`, `client/src/components/editor-toolbar.tsx`, `server/routes.ts`, `server/storage.ts`

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
- `client/src/pages/experiment-builder.tsx` - Experiment builder (TO UPGRADE)
- `client/src/pages/experiment-detail.tsx` - Experiment viewer (TO UPGRADE)
- `client/src/pages/experiments.tsx` - Experiments listing (TO UPGRADE)
- `client/src/lib/mock-data.ts` - LOVE_CODE_AREAS / 11 Dimensions data
- `client/src/lib/html-to-markdown.ts` - HTML-to-Markdown converter
- `client/src/contexts/ndk-context.tsx` - NDK/Nostr context
- `client/src/contexts/nostr-context.tsx` - Nostr context with AI integration
- `client/src/lib/relays.ts` - Relay privacy architecture
- `shared/schema.ts` - Database schema (experiments table)
- `server/routes.ts` - API routes
- `server/storage.ts` - Storage interface
- `NOSTR_GUIDELINES.md` - Nostr development rules
- `replit.md` - Project plan and style guide
