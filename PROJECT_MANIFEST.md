# PROJECT MANIFEST

**Last Updated:** 2026-02-20
**Current Phase:** Phase 3 - Feature Build-Out + Design System Standardization
**Active Task:** UI consistency standardization complete — Design System documented

---

## PROGRESS SUMMARY

| Metric | Count |
|--------|-------|
| Total Features Specified | 37 |
| Complete | 35 (95%) |
| Partial | 0 (0%) |
| Not Started | 2 (5%) |
| Code Health Issues | 0 |

---

## EXECUTIVE SUMMARY

1. **Core app structure is solid** - Full CRUD backend, PostgreSQL database with 15+ tables, Nostr authentication working
2. **Frontend is well-built** - 24 pages/routes, shadcn/ui components, mobile-responsive layout, proper routing
3. **AI Magic Mentor COMPLETE** - Claude Haiku 4.5 via direct Anthropic SDK, three-tier access (free/paid/BYOK)
4. **Lightning payments COMPLETE** - NWC integration for zaps and wallet, non-custodial user wallets
5. **NIP-46 Bunker Login COMPLETE** - nsec.app integration for users without browser extensions
6. **Experiment System COMPLETE** - Experiment creation, discovery, 6-tab interface (In Progress, My Experiments, New, All, Suggested, Complete)
7. **Community Infrastructure COMPLETE** - Schema and API for communities, memberships, roles, and approval workflows
8. **Design System STANDARDIZED** - All tabs, buttons, search inputs, cards follow consistent patterns documented in replit.md
9. **Big Dreams Dashboard REBUILT** - Primary daily hub with streak grid, practice CTA, experiment progress, events sidebar
10. **Profile SIMPLIFIED** - Clean Primal-style, no gamification (no XP, levels, badges, rewards)

---

## DESIGN SYSTEM REFERENCE

### Consistent Tab/Bubble Pattern (ALL Pages)
```
Active:   bg-foreground text-background border-foreground rounded-full
Inactive: bg-white text-muted-foreground border-gray-200 hover:border-gray-400 rounded-full
```
Pages: Feed, Experiments, Events, Vault

### Consistent Button Pattern
```
Primary:  bg-foreground text-background (dark #4D3D5C fill)
Hover:    hover:bg-white hover:border-[#E5E5E5] hover:text-foreground
Ghost:    hover:bg-[#F0E6FF]
```

### Consistent Search Pattern
```
bg-white, Search icon at left-3, pl-10 input
```

### Consistent Card Pattern
```
border-none shadow-sm bg-card rounded-xs hover:shadow-md
16:9 images (aspect-video), thin purple top accent, title hover:text-primary
```

### Sidebar Nav Pattern
```
Default:  text-muted-foreground
Active:   text-[#6600ff]
Hover:    hover:text-[#6600ff] (text only, NO background)
```

See replit.md Design System section for complete documentation.

---

## SPECIFICATION SOURCES

| Source | Type | Status |
|--------|------|--------|
| `replit.md` | Primary spec + Design System | Current (Feb 20, 2026) |
| `shared/schema.ts` | Database schema | Current |
| `server/routes.ts` | API documentation | Current |
| `package.json` | Dependencies | Current |

---

## FEATURE MATRIX

### COMPLETE (35 Features)

| Feature | Location | Confidence | Notes |
|---------|----------|------------|-------|
| Daily LOVE Practice Journaling | `/daily-practice` | 100% | Full wizard, AM/PM, streak tracking |
| Big Dreams Dashboard | `/big-dreams` | 100% | Primary daily hub, streak grid, 11 dreams editor |
| Home Dashboard | `/` | 100% | Prosperity Pyramid flip cards |
| Experiments Page | `/experiments` | 100% | 6 tabs, user-created experiments support |
| Events Page | `/events` | 100% | 4 tabs, calendar sidebar, event cards |
| Feed Page | `/feed` | 100% | 4 tabs, real Nostr data via Primal |
| Vault Page | `/vault` | 100% | 6 tabs, personal content vault |
| Communities Page | `/community` | 100% | Listing, create, detail, admin |
| Club Detail | `/community/:id` | 100% | Club posts, members |
| Event Detail | `/events/:id` | 100% | Event info, registration |
| Love Board | `/leaderboard` | 100% | Rankings with real data |
| Profile | `/profile/:id` | 100% | Primal-style, no gamification |
| Creator Dashboard | `/creator` | 100% | Analytics for creators |
| Settings | `/settings` | 100% | User preferences |
| Wallet | `/wallet` | 100% | Lightning wallet with NWC |
| Relays | `/relays` | 100% | Relay management |
| Experiment Builder | `/experiment-builder` | 100% | Step builder with day assignments |
| Course Builder | `/course-builder` | 100% | Legacy course creation |
| Post Composer | Components | 100% | Image/GIF/video upload |
| Share to Nostr | Components | 100% | Compose & post with privacy |
| Social Post Actions | Components | 100% | Reply, Repost, Zap, Like, Bookmark, Share |
| External Sharing | Components | 100% | X/Twitter, Facebook, copy link |
| Profile Completion | Components | 100% | Email collection dialog |
| PostgreSQL Database | `shared/schema.ts` | 100% | 15+ tables via Drizzle ORM |
| Express API Backend | `server/routes.ts` | 100% | 40+ endpoints with auth middleware |
| Magic Mentor AI | `server/anthropic.ts` | 100% | Claude Haiku 4.5, three-tier access |
| AI Usage Tracking | Schema + API | 100% | Token tracking per user |
| Lightning/NWC Integration | `client/src/lib/nwc.ts` | 100% | Non-custodial wallet connection |
| Zap Payments | Components | 100% | LNURL-pay, BOLT11, graceful fallback |
| NIP-46 Bunker Login | Contexts | 100% | nsec.app, session persistence |
| Course System | Pages + API | 100% | Full CRUD, enrollment, progress |
| Community Infrastructure | Schema + API | 100% | Memberships, roles, approval workflows |
| Experiment Schema | `shared/schema.ts` | 100% | Steps, access types, creator linking |
| StreakGrid Component | `client/src/components/streak-grid.tsx` | 100% | Reusable, used by Big Dreams + Vault |
| Design System Standardization | All pages | 100% | Tabs, buttons, search, cards, nav consistent |

### NOT STARTED (2 Features)

| Feature | Priority | Dependencies |
|---------|----------|--------------|
| Bitcoin Rewards System | MEDIUM | NWC integration |
| User Personalization | LOW | Spotify API, podcast RSS |

---

## CODE HEALTH METRICS

### Issues Found

| Issue | Location | Severity |
|-------|----------|----------|
| TODO: Admin check for experiments | `server/routes.ts` | LOW |

### Security Notes

- All personal data routes protected by authMiddleware
- Course enrollment validates access type before allowing enrollment
- Community posts require approved membership for non-public communities
- AI prompt injection protection via XML delimiters
- Two-phase atomic transactions for AI usage

### Positive Notes

- No hardcoded secrets found
- Proper error handling in API routes
- Auth middleware protects personal data
- TypeScript types properly shared between client/server
- Zod validation on all API inputs
- Consistent Design System documented and enforced
- All tabs/buttons/search/cards follow standardized patterns

---

## DECISIONS LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-20 | All page tabs use rounded-full pill buttons (not shadcn Tabs) | Visual consistency across all pages |
| 2026-02-20 | Sidebar nav: purple text only, no background highlight | Cleaner, more modern look matching user preference |
| 2026-02-20 | Search inputs always bg-white | Consistent with card backgrounds, not page background |
| 2026-02-20 | "Experiments" only term, no "Courses" tab | User preference, single terminology |
| 2026-02-20 | Foreground/button color changed to #2a2430 | Darker Purple-Black, replaces #4D3D5C |
| 2026-02-20 | Create buttons in tab/header rows on listing pages | Experiments, Events, Tribe, Love Board all have create buttons |
| 2026-02-20 | No tags/overlays on card images | Tags, steps, categories in card info area below image |
| 2026-02-20 | Love Board is display name (route /leaderboard) | User preference for marketplace branding |
| 2026-02-19 | No gamification on Profile page | User wants clean Primal-style profile |
| 2026-02-19 | Big Dreams is primary daily hub | Central entry point for daily practice, streaks, dreams |
| 2026-02-19 | Daily Practice hidden from nav | Only accessible from Big Dreams CTA button |
| 2026-01-27 | Course access validation on enrollment | Validate paid/community access before enrollment |
| 2026-01-26 | Use direct Anthropic SDK instead of OpenRouter | Better control, simpler setup, BYOK support |
| 2026-01-26 | Hardcode Claude Haiku 4.5 model | Per spec, fastest model, no user override |
| 2026-01-26 | Two-phase atomic transactions for AI usage | Prevents race conditions and wasted API costs |
| 2026-01-26 | Lightning integration via NWC over WebLN | NWC provides better cross-wallet compatibility |
| 2026-01-26 | Non-custodial wallets (user provides NWC) | Users control their own funds |
| 2026-01-26 | NIP-46 via nostr-tools BunkerSigner | Built-in support, no extra dependency |

---

## UP NEXT QUEUE

1. Bitcoin Rewards System (sats for practice completion, streaks)
2. User Personalization (Spotify, podcasts)
3. Admin Dashboard enhancements
4. Full 18-lesson curriculum content loading
5. Two-path onboarding (Quick Start / Deep Dive)

---

**Peace, LOVE, & Warm Aloha**
