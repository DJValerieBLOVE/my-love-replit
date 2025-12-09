# 11x LOVE Lab

## Overview

11x LOVE Lab is a privacy-first, Bitcoin-native community and course platform designed for coaches, creators, and community leaders. The platform combines features from Circle.so (community spaces), Mighty Networks (courses and member profiles), and Primal.net (Bitcoin Lightning integration). The core philosophy centers around personal growth across 11 life dimensions (GOD/LOVE, Romance, Family, Community, Mission, Money, Time, Environment, Body, Mind, Soul) with gamification, daily journaling practices, and community engagement features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with custom theme variables
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (Neon serverless)

### Data Storage
- **Primary Database**: PostgreSQL via Neon serverless adapter
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with output to `./migrations`
- **Key Entities**: Users, JournalEntries, Dreams, AreaProgress, Experiments, UserExperiments, Events, Posts, Clubs

### Design Patterns
- **Monorepo Structure**: Client (`client/`), Server (`server/`), Shared (`shared/`)
- **Path Aliases**: `@/` for client source, `@shared/` for shared code, `@assets/` for static assets
- **API Client**: Centralized fetch wrapper with error handling in `client/src/lib/api.ts`
- **Component Organization**: Feature-based with shared UI components in `components/ui/`

### Key Features
- **Daily LOVE Practice**: Journaling system with morning/evening check-ins
- **EQ Visualizer**: Visual progress tracker across 11 life dimensions
- **Experiments**: Course-like learning modules with quizzes and rewards
- **Community Clubs**: Group spaces for discussions and events
- **Gamification**: Sats rewards, streaks, levels, badges, and leaderboards
- **Lightning Wallet**: Bitcoin/sats integration for rewards and payments

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via `DATABASE_URL` environment variable
- **Neon Serverless**: `@neondatabase/serverless` for connection pooling

### UI/UX Libraries
- **Radix UI**: Complete primitive library for accessible components
- **Lucide React**: Icon library
- **Canvas Confetti**: Celebration animations
- **Recharts**: Data visualization for wallet and progress charts

### Development Tools
- **Vite**: Frontend build and dev server
- **esbuild**: Server bundling for production
- **Drizzle Kit**: Database migrations and schema management

### Fonts
- **Marcellus**: Primary serif font loaded from Google Fonts (used for elevated/magical aesthetic)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)