# Experiment Builder Upgrade Plan

## Overview
Upgrade the experiment builder to use the same TipTap rich text editor as the article composer, enabling Nostr-publishable experiment content (kind 30023) with full formatting, Magic Mentor AI formatting assistance, and Lightning zaps for value-for-value payments.

## Prompts (use in order, one per chat)

### Prompt 1 - Extract Reusable Rich Text Editor Components

> Look at the article editor in `client/src/pages/article-editor.tsx` and the HTML-to-Markdown converter in `client/src/lib/html-to-markdown.ts`. Extract the TipTap rich text editor, toolbar, and preview mode into reusable shared components (e.g. `client/src/components/rich-text-editor.tsx` and `client/src/components/editor-toolbar.tsx`) that can be used by both the article editor and the experiment builder. Keep the article editor working exactly as it does now, just refactored to use the shared components. Follow all style guide rules in replit.md.

### Prompt 2 - Upgrade Experiment Builder with Shared Rich Text Editor

> Upgrade the experiment builder at `client/src/pages/experiment-builder.tsx` to use the same TipTap rich text editor and toolbar that the article editor uses (see shared components and `client/src/pages/article-editor.tsx`). Replace the basic text inputs for experiment description and step content with the full rich text editor. Keep the existing experiment metadata fields (title, guide, image, category, tags, steps, access type, pricing). Add Edit/Preview mode toggle and Save Draft / Publish buttons similar to the article editor. Experiment content should be converted to Markdown via `client/src/lib/html-to-markdown.ts` so it can be published to Nostr as kind 30023 long-form articles. Follow all design system rules in replit.md. Check NOSTR_GUIDELINES.md before implementing any Nostr features.

### Prompt 3 - Add Magic Mentor AI Formatting Assistant to Experiment Builder

> Add a Magic Mentor AI assistant button to the experiment builder that helps users format and structure their experiment content. When the user clicks the Sparkles icon (only icon that gets color), it should open a panel where Magic Mentor can suggest formatting improvements, help organize steps, and auto-format raw text into properly structured experiment content using the TipTap rich text editor. The AI should use the existing Anthropic integration (see `client/src/contexts/nostr-context.tsx` and server AI routes). The Sparkles icon is the ONLY icon that gets color - all other icons use `text-muted-foreground`. Follow replit.md style guide and NOSTR_GUIDELINES.md.

### Prompt 4 - Enable Lightning Zaps on Experiments

> Enable Lightning zaps on experiments so creators can receive value-for-value payments. Add a "Zap the Creator" modal that appears after each lesson/step completion and after full experiment completion. Also add a "Share Your Win" option on experiment completion that publishes to public Nostr relays. Check the existing wallet integration at `client/src/pages/wallet.tsx` and NIP-57 zap implementation. Follow NOSTR_GUIDELINES.md and replit.md. Zaps should work with the NWC (Nostr Wallet Connect) integration.

## Key Files to Reference
- `client/src/pages/article-editor.tsx` - Current rich text editor implementation
- `client/src/pages/experiment-builder.tsx` - Current basic experiment builder
- `client/src/pages/experiment-detail.tsx` - Current experiment detail/viewer
- `client/src/pages/experiments.tsx` - Experiments listing page
- `client/src/lib/html-to-markdown.ts` - HTML-to-Markdown converter
- `client/src/contexts/ndk-context.tsx` - NDK/Nostr context
- `client/src/lib/relays.ts` - Relay privacy architecture
- `NOSTR_GUIDELINES.md` - Nostr development rules
- `replit.md` - Project plan and style guide
