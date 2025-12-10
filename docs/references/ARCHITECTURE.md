**SONA by IONE ---**

*"Simple is harder than complex. You have to work hard to get your
thinking clean."*\
--- Steve Jobs

------------------------------------------------------------------------

**1. Purpose**

SONA isn't just another app.\
It's a stage --- a digital space where music feels human again.

This document defines how SONA is **built**, **styled**, and
**maintained**.\
Every developer, designer, or AI assistant must follow this structure
with precision.\
No clutter, no unnecessary cleverness --- only clarity, rhythm, and
emotion.

------------------------------------------------------------------------

**2. Core Philosophy**

**Design is function.**\
Every pixel, animation, and line of code exists to serve the music
experience.

SONA's design language mirrors Apple's --- simple, emotional, timeless.

- **Minimal:** remove anything that doesn't add value.

- **Emotional:** motion and color should feel musical.

- **Human:** technology should disappear behind the experience.

------------------------------------------------------------------------

**3. Folder Architecture**

sona/

│

├── app/ \# Expo router screens (core navigation)

│ ├── \_layout.tsx \# Global navigation layout

│ ├── +not-found.tsx \# 404 route

│ ├── +modal.tsx \# Global modal screen

│ └── (tabs)/ \# Main tab screens

│ ├── index.tsx \# Home / Stage

│ ├── live.tsx \# Go Live setup

│ ├── clips.tsx \# Clip feed

│ └── profile.tsx \# Artist profile

│

├── src/

│ ├── components/ \# Reusable UI parts (Button, Card, etc.)

│ ├── features/ \# Functional modules (Auth, Tipping, Playback)

│ ├── hooks/ \# Custom logic hooks

│ ├── lib/ \# API connectors (Supabase, Stripe, Mux)

│ ├── theme/ \# Design tokens: color, type, radius, spacing

│ ├── utils/ \# Helper functions (formatters, validators)

│ └── assets/ \# Static assets (icons, images, fonts)

│

├── .env.local \# Environment keys (ignored by git)

├── PROJECT_STRUCTURE_GUIDE.md \# This document

└── README.md

------------------------------------------------------------------------

**4. Design System Rules**

SONA uses a **single source of visual truth** --- /src/theme/.\
No screen or component may define its own color, font size, or radius.

**Theme**

SONA is **dark-only** by design.

- Base: deep charcoal `#111111`
- Surfaces: subtle glass panels using low-opacity white on top of black
- Text: high-contrast off-white for primary, soft gray for secondary
- Accent: single violet → amber gradient used for primary actions and live states

The app does **not** follow the device light/dark setting. SONA is always rendered in its own dark theme to preserve the stage-like, cinematic experience.

  ---------------------------------------------------------------------------------
  **Token**        **File**        **Rule**
  ---------------- --------------- ------------------------------------------------
  **Colors**       colors.ts       Never hardcode colors. Use tokens like
                                   colors.bg, colors.text.

  **Typography**   typography.ts   Font sizes and weights mirror Apple's hierarchy.

  **Spacing**      spacing.ts      Consistent increments (4, 8, 12, 16, 24,
                                   32\...).

  **Radius**       radius.ts       Subtle, consistent curves for all elements.

  **Shadow**       shadow.ts       Only soft, diffused shadows --- cinematic, never
                                   harsh.
  ---------------------------------------------------------------------------------

All tokens are re-exported via theme/index.ts.\
If it's not in /theme/, it doesn't exist.

------------------------------------------------------------------------

**5. Component Standards**

Each component is treated as a *product unit*: reusable, clear, and
emotionally consistent.

Example structure:

/src/components/Button/

Button.tsx

Button.styles.ts

Rules:

- No inline styles in production components.

- Use StyleSheet or NativeWind with tokens from /theme/.

- Accept props for size, variant, and disabled.

- Default spacing, colors, and motion must come from the theme.

- Animations use smooth 200--300 ms easeInOut curves.

- Every component must "feel alive," never mechanical.

------------------------------------------------------------------------

**6. Code Standards**

  -----------------------------------------------------------------------
  **Rule**         **Description**
  ---------------- ------------------------------------------------------
  **Language**     TypeScript only --- no any.

  **Imports**      Absolute imports from src/ (e.g., import { colors }
                   from \'src/theme\').

  **Naming**       PascalCase for components, camelCase for functions and
                   variables.

  **Comments**     Explain *why*, not *what*.

  **Formatting**   Prettier + ESLint (strict).

  **Files**        Each file should do one clear thing.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

**7. Commit Discipline**

Each commit should read like a design log.\
Write it so another person can feel *why* the change matters.

  ----------------------------------------------------------------
  **Prefix**   **Purpose**     **Example**
  ------------ --------------- -----------------------------------
  feat:        new feature     feat: add Stripe tipping flow

  fix:         bug fix         fix: prevent playback freeze on
                               stream switch

  style:       visual tweak    style: align button radius with
                               theme

  chore:       setup or        chore: configure EAS iOS build
               cleanup         

  refactor:    logic           refactor: simplify Supabase auth
               improvement     hook
  ----------------------------------------------------------------

------------------------------------------------------------------------

**8. Definition of Done**

A task is *done* when it meets every one of these:

1.  No hardcoded visuals --- theme-only.

2.  60 fps performance on current iPhone hardware.

3.  Transitions feel rhythmic, not abrupt.

4.  Zero ESLint/TypeScript warnings.

5.  Documented clearly in the code or feature notes.

------------------------------------------------------------------------

**9. Build & Deployment**

  -----------------------------------------------
  **Stage**       **Tool**
  --------------- -------------------------------
  Development     Expo Go (iPhone)

  Cloud Builds    EAS (iOS only)

  Backend         Supabase (Auth, DB, Storage,
                  Realtime)

  Payments        Stripe Checkout

  Streaming       Mux / Livepeer

  Notifications   Expo Notifications

  Analytics       Mixpanel / PostHog
  -----------------------------------------------

------------------------------------------------------------------------

**10. Ethos**

SONA exists to prove that digital music can feel human again.\
Build like a craftsman, not a coder.

Every pixel, sound, and gesture should express care.\
If it doesn't evoke emotion, simplify until it does.

------------------------------------------------------------------------

**Golden Rule**

"Clarity is kindness."\
Every line of code should make sense to a tired musician reading it at 3
AM.

**11. Data & Backend Ownership**

**Backend platform:** Supabase (Postgres, Auth, Storage, Realtime, Edge
Functions).\
**Rule:** No ad-hoc APIs. All data access goes through a typed service
layer.

**11.1 Database schema (source of truth)**

/db/

schema.sql \# full schema (users, streams, tips, clips, follows,
setlists)

seed.sql \# safe seed data for dev

migrations/ \# timestamped migration files

- Never change tables directly in the web UI without creating a
  migration.

- Apply migrations in dev first, then prod.

**11.2 Edge Functions (server code)**

/supabase/functions/

createTip/ \# creates Stripe Checkout Session

stripeWebhook/ \# verifies event, inserts into tips

notifyLive/ \# sends push when a stream goes live

clipTranscode/ \# optional: post-upload processing hook

- Language: TypeScript (Deno runtime).

- Each function validates input, returns typed JSON, and logs errors.

**11.3 Client service layer (app talks only to these)**

/src/lib/

supabase.ts \# client init

api/

auth.ts \# login, logout, getSession

users.ts \# get/update profiles

streams.ts \# list live, set status, playback URLs

tips.ts \# createTip(), list tips

clips.ts \# upload, list, like

setlists.ts \# CRUD

- Screens call api/\* functions only.

- api/\* uses React Query for caching and optimistic UI.

- No screen hits Supabase directly.

------------------------------------------------------------------------

**12. Secrets & Environments**

**Files**

.env.local \# dev only (not committed)

.env.production \# CI/CD only (EAS secrets)

**Required keys**

- EXPO_PUBLIC_SUPABASE_URL

- EXPO_PUBLIC_SUPABASE_ANON_KEY

- STRIPE_SECRET_KEY (Edge function only)

- STRIPE_WEBHOOK_SECRET (Edge function only)

- MUX_TOKEN_ID / MUX_TOKEN_SECRET or Livepeer keys (Edge or server)

- EXPO_PROJECT_ID (for push)

- SENTRY_DSN (optional)

**Rules**

- Anything used in the **app** must be prefixed with EXPO_PUBLIC\_.

- True secrets live only in **Edge Functions** or EAS/Project settings,
  never in the client.

------------------------------------------------------------------------

**13. Build Profiles (EAS)**

eas.json

Profiles:

- dev --- custom dev client when native modules are added (later for Go
  Live).

- preview --- internal TestFlight builds (Jude, team).

- production --- public TestFlight/App Store.

**Bundle IDs**

- iOS: com.ione.sona

------------------------------------------------------------------------

**14. Streaming Integration**

- **Playback (MVP):** HLS via expo-av using Mux/Livepeer playback URL
  stored in streams.playback_url.

- **Publish (later):** Native module for RTMP. Exposed to JS as
  goLive.start({ rtmpUrl, streamKey }).

  - If using NodeMedia: install module and require dev profile (custom
    client).

  - If using HaishinKit: small Swift wrapper, also dev profile.

**State**

- streams.status: scheduled \| live \| ended

- Edge function notifyLive broadcasts push when status flips to live.

------------------------------------------------------------------------

**15. Payments (Stripe)**

**Flow**

1.  App calls Edge Function createTip with { amount, streamId }.

2.  Function creates **Checkout Session** (Stripe Connect destination
    charges), returns url.

3.  App opens url in in-app browser; upon success, user returns to app.

4.  stripeWebhook verifies event and inserts a row into tips.

5.  App receives an update via polling or on next open; optional push
    "Thanks!"

**Never** touch Stripe secret keys in the app.

------------------------------------------------------------------------

**16. Push Notifications**

- Use **Expo Notifications**.

- Store push_token per user in users.

- Edge functions send pushes:

  - notifyLive → "Jude is live."

  - stripeWebhook → "Your tip was received."

------------------------------------------------------------------------

**17. Error Handling & Logging**

- Client: graceful toasts, silent retry with React Query.

- Edge functions: structured logs with request id; never leak stack
  traces to clients.

- Critical paths (auth, tip, go live) report to Sentry (optional).

------------------------------------------------------------------------

**18. Branching & Releases**

- main = production.

- dev = integration branch.

- feature/\<name\> = short-lived branches.

- PR rule: small, focused, passes lint and typecheck.

- Tag releases like v0.1.0-mvp-preview1.

------------------------------------------------------------------------

**19. MVP Acceptance Tests (must pass)**

- Login/logout round-trip under 3 seconds.

- Playback: start within 2 seconds on HLS test URL; scrub works; no
  audio stutter.

- Tip: ¥100 test completes; webhook writes to tips; UI shows
  confirmation.

- Setlist: create/edit/delete; Stage Mode keeps screen awake.

- Clips: 30s clip upload, shows in feed within 10 seconds.

- Push: device receives "Jude is live" within 3 seconds of status flip.

- Build: EAS preview profile installs and opens on iPhone without
  errors.

With these sections, it's airtight. You've specified where backend code
lives, how it's called, where secrets go, how builds work, and exactly
what "done" means. Future-me, alternate-me, and any unlucky contractor
now have zero excuses.
