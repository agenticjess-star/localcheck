# 🏀 LocalCheck

**The pickup basketball app that replaces group texts, empty courts, and "anyone there?" messages.**

LocalCheck is a real-time, community-driven platform for pickup basketball players. It answers the one question every hooper has: *"Who's at the court right now?"* — and then builds an entire competitive ecosystem on top of that simple insight.

> **Live:** [localcheck.lovable.app](https://localcheck.lovable.app)

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Vision](#-the-vision)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Design Decisions](#-architecture--design-decisions)
- [Design System](#-design-system)
- [Database Schema](#-database-schema)
- [Build Process & Decision Log](#-build-process--decision-log)
- [Getting Started](#-getting-started)
- [Roadmap](#-roadmap)
- [Screenshots](#-screenshots)

---

## 🏗 The Problem

Pickup basketball is broken — not the game, but the logistics. Every day, thousands of players drive to empty courts, spam group chats asking "anyone running?", or just skip going because they don't know if anyone will show up.

There's no centralized way to:
- See who's at a court **right now**
- Know when people are **planning** to show up
- Track competitive results and **rankings** at your local spot
- Organize **runs** without a 50-message group thread

Google Maps tells you *where* courts are. LocalCheck tells you *what's happening* at them.

---

## 🎯 The Vision

LocalCheck is built around one core interaction loop:

```
Check in → See who's there → Play → Log results → Climb the ranks → Come back tomorrow
```

Every feature serves this loop. The app is designed to feel like walking up to the court — you see the vibe, the people, the competition — all from your phone.

The branding practically named itself: **Local** (your court, your community) + **Check** (check in, check the scene, check your ranking). The word "check" threads through every feature naturally.

---

## ✨ Features

### 🟢 Now — Real-Time Check-ins
The heart of the app. One tap to announce you're at the court. Everyone else sees it instantly via real-time subscriptions. Check-ins auto-expire after 2 hours — no stale data, no ghost players.

- Real-time presence powered by Postgres LISTEN/NOTIFY
- Scoped to your local court
- Optional status notes ("Running 5s", "Looking for one more")

### 📅 Schedule — Visual Planner
A full day/week/month calendar view where players post when they're planning to show up. Reduces the uncertainty that keeps people home.

- Interactive time-slot creation (tap to set start/end times)
- Day, week, and month view modes
- Visual timeline with player avatars

### 🏆 Compete — ELO Leaderboard & Match Logging
Every court has its own competitive hierarchy. Log 1v1 results, and the ELO rating system handles the rest. Dispute resolution built in.

- ELO-based rating system (default 1500)
- Match logging with score tracking
- Dispute flagging for contested results
- Court-scoped leaderboards

### 🏃 Runs — Event Organization
Create structured pickup events with format selection, max player caps, and RSVP tracking. Auto-generates balanced teams based on ELO ratings.

- Event creation with format (5v5, 3v3, King of the Court)
- RSVP management with player cap enforcement
- Auto team generation using ELO-balanced shuffling

### 🗺 Court Discovery — Dark-Mode Mapbox Map
An interactive map to find and add courts. Uses Mapbox GL JS with a dark aesthetic and orange glowing markers. Users can add courts that don't exist on any map — making LocalCheck's court data fresher than Google or Apple Maps.

- Mapbox GL JS with `dark-v11` style
- Orange pulsing markers for courts
- "Add Court" flow with Nominatim geocoding (free, no API key)
- "Set as My Court" to establish your home base
- Accessible from the Now tab header and Profile page

### 👤 Profile & Local Court
Your identity in the LocalCheck ecosystem. Set your local court, track your W/L record, manage notification preferences.

### 🔔 Real-Time Notifications
Court activity, match confirmations, and dispute alerts — all delivered in real-time via Postgres change subscriptions.

---

## 🛠 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | React 18 + TypeScript | Type safety, component model, ecosystem |
| **Build** | Vite + SWC | Sub-second HMR, fast builds |
| **Styling** | Tailwind CSS + CSS custom properties | Utility-first with semantic design tokens |
| **UI Components** | shadcn/ui + Radix primitives | Accessible, composable, customizable |
| **Animation** | Framer Motion | Declarative animations, layout transitions |
| **Maps** | Mapbox GL JS | Dark-mode tiles, smooth interactions, marker customization |
| **Geocoding** | Nominatim (OpenStreetMap) | Free, no API key required, good coverage |
| **Backend** | Lovable Cloud (Supabase) | Auth, Postgres, real-time subscriptions, RLS |
| **State** | React hooks + context | Lightweight, no unnecessary abstraction |
| **Routing** | React Router v6 | Standard SPA routing |

---

## 🏛 Architecture & Design Decisions

### Database Adapter Pattern (`src/lib/db.ts`)
All database interactions go through a modular adapter layer. The app code never imports Supabase directly — it imports from `db.ts`. This means:
- Swapping backends (Firebase, REST API, localStorage) requires changing **one file**
- Business logic stays clean and testable
- Type safety is enforced at the adapter boundary

### Auth Context (`src/lib/auth-context.tsx`)
A lightweight React context manages session state, profile loading, and sign-out. It includes:
- A 6-second bootstrap timeout to prevent infinite loading states
- Automatic profile creation on first sign-in (`profiles.ensure()`)
- Fallback name extraction from email if no display name is provided

### Court-Scoped Everything
The pivotal architectural decision: **everything is scoped to a court**. Check-ins, plans, leaderboards, runs — all tied to a `court_id`. This creates natural micro-communities. Your local court's leaderboard is *yours*.

### Real-Time via Postgres Changes
Instead of polling, the app subscribes to Postgres change events for check-ins, matches, notifications, and courts. This means:
- Instant updates when someone checks in
- Live leaderboard changes after match results
- Zero-latency notification delivery

### Error Resilience
- Global `ErrorBoundary` catches React render failures
- `main.tsx` catches fatal bootstrap errors with a styled fallback UI
- Global `unhandledrejection` and `error` handlers surface issues via toast notifications
- Auth timeout prevents the app from hanging on slow network

---

## 🎨 Design System

### Philosophy: "Court After Dark"
The design draws from the **night court aesthetic** — dark asphalt, orange sodium-vapor lighting, the glow of a lit court at night. Every color, shadow, and gradient reinforces this atmosphere.

### Color Palette
```
Background:   hsl(222, 25%, 6%)   — Near-black with blue undertone (night sky)
Foreground:   hsl(35, 25%, 93%)   — Warm off-white (court lighting)
Primary:      hsl(32, 95%, 55%)   — Vivid orange (the ball, the glow)
Accent:       hsl(340, 65%, 55%)  — Hot pink-red (energy, competition)
Muted:        hsl(222, 18%, 12%)  — Dark card surfaces
```

### Typography
- **Display:** Space Grotesk — geometric, sporty, modern
- **Body:** Inter — clean readability at small sizes

### Custom Tokens
Beyond shadcn defaults, the system includes:
- `--court-orange` and `--court-amber` for basketball-specific accents
- `--sunset-start` / `--sunset-end` for gradient effects
- Utility classes: `.text-gradient-sunset`, `.bg-gradient-court`, `.shadow-court-glow`
- Custom animations: `glow-pulse`, `float`, `slide-up`, `check-in`

### Map Styling
The Mapbox map uses the `dark-v11` base style with custom orange markers featuring CSS `box-shadow` glow effects and pulse animations, keeping the map visually integrated with the app's dark aesthetic.

---

## 🗄 Database Schema

```
courts          → id, name, address, lat, lng, zip_code, added_by
profiles        → id, user_id, name, handle, avatar_url, rating, local_court_id
check_ins       → id, user_id, court_id, note, expires_at (auto: now + 2h)
plans           → id, user_id, court_id, start_at, end_at, note
matches_1v1     → id, court_id, winner_id, loser_id, winner_score, loser_score, status
run_events      → id, court_id, start_at, format, max_players, note, created_by
run_rsvps       → id, run_id, user_id
notifications   → id, user_id, type, message, match_id, read
```

All tables have Row-Level Security (RLS) policies. Real-time is enabled on `check_ins`, `matches_1v1`, `notifications`, and `courts`.

---

## 📝 Build Process & Decision Log

This section documents the collaborative build process — the conversations, trade-offs, and rationale behind every major decision.

### Phase 1: Foundation & Core Loop
**Goal:** Get the fundamental check-in loop working with real-time data.

- **Decision:** Dark-first design system inspired by night court aesthetics. No generic purple gradients or AI-default styling. The app needed to *feel* like basketball culture.
- **Decision:** Space Grotesk for display type — geometric and sporty without being cliché.
- **Decision:** Mobile-first, bottom-tab navigation. Pickup basketball is a phone-in-pocket activity. The app lives where the players are.

### Phase 2: Competitive Layer
**Goal:** Give players a reason to come back beyond check-ins.

- **Decision:** ELO rating system over simple W/L records. ELO rewards consistency and factors in opponent strength — it's the fairest way to rank pickup players.
- **Decision:** Dispute mechanism built in from day one. Pickup games get heated; contested scores need a resolution path.
- **Decision:** Match logging is bilateral — both players see the result, either can flag it.

### Phase 3: Scheduling & Runs
**Goal:** Reduce the uncertainty that keeps players at home.

- **Decision:** Visual calendar (day/week/month) instead of a simple list. Players think in time blocks — "I'm free 4–6 Tuesday." The UI should match that mental model.
- **Decision:** Auto team generation using ELO-balanced shuffling. Pickup games are more fun when teams are fair. The algorithm splits RSVP'd players into balanced squads.

### Phase 4: Court Discovery & Maps
**Goal:** Let players find courts and establish their home base.

- **Trade-off: Map Library.** Three options were evaluated:
  - *Leaflet (free, no API key):* Lightweight but limited tile aesthetics.
  - *Google Maps:* Great data but expensive and overkill for this use case.
  - **Mapbox GL JS (chosen):** Best dark-mode tiles, smooth WebGL rendering, reasonable free tier. The `dark-v11` style perfectly matches the app's aesthetic.

- **Trade-off: Map Placement.** Options considered:
  - Dedicated "Map" tab — too prominent for a secondary feature.
  - Replace the Now tab — kills the core check-in flow.
  - **Icon in Now tab header + Profile page (chosen):** The map is valuable but not daily-use. It's a "discovery" tool — you use it when finding or changing courts, not every session. This keeps the check-in flow front and center while making court discovery easily accessible. As the user put it: *"once you're in a community, you're in that community for a while."*

- **Trade-off: Geocoding.** Nominatim (OpenStreetMap) chosen over Google Geocoding API. Free, no API key, and accurate enough for address-to-coordinate conversion when adding courts.

- **Key Insight: "Fresher than Google."** Users can add courts that don't exist on any mapping platform. Basketball courts in parks, school gyms, church parking lots — LocalCheck's crowd-sourced data becomes more complete than any corporate map.

### Phase 5: Notification System
**Goal:** Keep players informed without being annoying.

- **Decision:** Real-time Postgres subscriptions over push notifications for MVP. Instant in-app delivery without the complexity of service workers and permission prompts.
- **Decision:** Bell icon with unread badge — familiar pattern, zero learning curve.

### Ongoing: The "Check" Naming Convergence
A serendipitous discovery during development: the word "check" naturally threads through every feature:
- **Check** in at the court
- **Check** the schedule
- **Check** your ranking
- **Check** out who's coming

The branding wasn't forced — it emerged from the product's natural language.

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd localcheck

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs on `http://localhost:8080` with hot module replacement.

### Environment Variables
The project uses Lovable Cloud for its backend. Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are automatically configured.

---

## 🗺 Roadmap

- [x] **Live check-in counts on map markers** — See court activity at a glance
- [ ] **Court-filtered leaderboards** — Rankings scoped to your local court
- [ ] **Zip code search** — Find courts near any zip code
- [ ] **Push notifications** — Service worker integration for background alerts
- [ ] **Player profiles with stats history** — Win streaks, rating graphs, head-to-head records
- [ ] **Tournament brackets** — Structured competition beyond 1v1
- [ ] **Court photos & amenities** — Crowd-sourced court quality data
- [ ] **Chat / court feed** — Real-time messaging per court community

---

---

## 📸 Screenshots

> **Add your own screenshots below!** Take them from the preview and replace the placeholder descriptions with image embeds.

| Screen | Description |
|--------|-------------|
| <!-- ![Now Tab](public/screenshots/now-tab.png) --> | **Now Tab** — Real-time court presence with check-in cards and player count |
| <!-- ![Court Map](public/screenshots/court-map.png) --> | **Court Map** — Mapbox dark-mode map with live player count badges on markers |
| <!-- ![Compete Tab](public/screenshots/compete.png) --> | **Compete Tab** — ELO leaderboard and 1v1 match logging |
| <!-- ![Schedule Tab](public/screenshots/schedule.png) --> | **Schedule Tab** — Calendar view with planned sessions |
| <!-- ![Profile Page](public/screenshots/profile.png) --> | **Profile** — Player stats, rating, handle, and local court |
| <!-- ![Auth Page](public/screenshots/auth.png) --> | **Auth** — Clean sign-up / login with email verification |
| <!-- ![Landing Page](public/screenshots/landing.png) --> | **Landing** — Hero section introducing LocalCheck |

*To add a screenshot: save images to `public/screenshots/`, then uncomment the `![...]()` markdown above.*

---

## 📄 License

Built with [Lovable](https://lovable.dev).

---

*"The best pickup game is the one that actually happens."*
