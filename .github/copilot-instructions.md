   # Copilot instructions — sona-app

   This file gives quick, actionable context for AI coding agents working on the Sona Expo/React Native app.

   - Project type: Expo (React Native) app using TypeScript and expo-router (file-based routes in `app/`).
   - Backend: Supabase (auth + Postgres). Supabase client is in `src/lib/supabase.ts` and uses AsyncStorage for session persistence.

   Key things to know (quick):

   1. Architecture & boundaries
      - Frontend: Expo app (UI, navigation, screens) in `app/` and `src/`.
      - Auth & user data: Supabase for auth and Postgres tables. Code that touches auth lives in `src/providers/AuthProvider.tsx` and `src/lib/api/auth.ts`.
      - UI primitives: put shared UI in `src/components/*` (e.g. `AuthContainer.tsx`, `ui/GlassCard.tsx`).
      - API wrappers: small domain modules under `src/lib/api/*` (e.g. `auth.ts`). Prefer adding thin wrappers here rather than scattered supabase calls.

   2. Environment & runtime
      - Expo entry is `expo-router/entry` (see `package.json` / `app.json`).
      - Required env vars: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (referenced in `src/lib/supabase.ts`). Tests and dev runs expect these in a local `.env.local` or environment provider.
      - `supabase` client config: uses `AsyncStorage`, `autoRefreshToken: true`, `persistSession: true`, and `detectSessionInUrl: false` (we avoid web URL callbacks in Expo Go).

   3. Patterns & conventions (follow these precisely)
      - TypeScript: strict mode enabled. Use existing types from `@supabase/supabase-js` for auth/session types.
      - Path aliases: `@/*` and `src/*` available (see `tsconfig.json`). Use `src/...` imports for clarity (the codebase uses `src/...`).
      - Auth flow: AuthProvider reads persisted session on mount (`supabase.auth.getSession()`), subscribes to `onAuthStateChange`, and auto-creates a `users` row if missing (see `AuthProvider.tsx` — keep migration SQL in `db/migrations`).
      - API return shapes: functions in `src/lib/api` generally return the supabase-style object (e.g. `{ session, error }`). Keep that shape unless a higher-level transform is explicitly required.
      - UI composition: small, focused components under `src/components`. `AuthContainer` is the canonical layout for auth screens (keyboard handling + safe area).

   4. Integration points to watch
      - `src/lib/supabase.ts` — changing auth config affects the whole app (storage, session detection, env var requirements).
      - `AuthProvider.tsx` — central place for session lifecycle and profile auto-creation; update both provider and `db/migrations` when changing user schema.
      - `supabase/functions` and `db/migrations` — database and serverless functions live here; coordinate schema changes with these files.

   5. Developer workflows & commands
      - Install and start the app (PowerShell):
      ```powershell
      npm install
      npm run start      # opens Expo
      npm run android    # start and open Android
      ```
      - Before starting, set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (e.g. create `.env.local` with those keys).

   6. Examples to reference when modifying auth or profiles
      - Sign-in wrapper: `src/lib/api/auth.ts` (exported functions: `signInWithEmail`, `signUpWithEmail`, `signOut`).
      - Provider lifecycle: `src/providers/AuthProvider.tsx` (getSession, onAuthStateChange, ensureProfile insert into `users`).

   7. Edge-cases & tips
      - Do not rely on web URL callbacks in Expo (we set `detectSessionInUrl: false`). If changing this, test on web and Expo Go.
      - When adding user columns, update `ensureProfile()` in `AuthProvider` and add a SQL migration in `db/migrations`.
      - Keep API modules small and idempotent; prefer returning supabase-native shapes so UI code can inspect `error` objects consistently.

   8. Where to look for more context
      - Routes & pages: `app/` (uses typed routes experimental feature — `app.json` sets `typedRoutes`).
      - UI primitives: `src/components/*` and `src/theme/*`.
      - Backend SQL: `db/migrations/*.sql` (there are migration files for profile and avatars).

   ---

### 9. Creative philosophy & design language (addendum)

- **Design vision:** Apple-inspired *liquid glass* aesthetic — minimal, translucent, calm. Interface should feel like a native iOS environment: restrained color palette, crisp typography, and balanced spacing.  
- **Principle:** "What would Steve Jobs do?" — prioritize simplicity, legibility, and focus. No clutter, no heavy gradients, no gratuitous decoration.  
- **Core look:** subtle blur layers, light diffusion, and motion depth (using opacity, not shadows).  
- **Layout grid:** 16-pt spacing rhythm, `maxWidth 640`, respect SafeArea insets on all devices.  
- **Theme:** SONA is **dark-only** by design. Defined in `src/theme/tokens.ts` and `ThemeModeProvider.tsx` — always use `colors.bg`, `colors.text`, `colors.card`, and the accent tokens (`colors.accentGradient` or `colors.accentPrimary`) instead of hard-coded values. The app does not follow device appearance settings and is always rendered in dark mode to preserve the stage-like, cinematic experience.
- **Glass components:** `GlassCard`, `GlassPill`, and `GlassInput` are the canonical primitives for the "liquid" design language. Extend them instead of re-implementing blur views.

### 10. Active branches & continuity

- **feat/ui-glass-sweep** — current focus branch. Implements the Instagram-style profile hero, violet→amber gradient accent system, neon avatar ring, and dark-only theme enforcement.  
- **Merge target:** `main` after visual consistency pass, then proceed to MVP "Moments" feed.  
- **Keep philosophy consistent:** all future components should feel Apple-grade clean — every screen should align visually to the same grid and blur depth.

### 11. Documentation & context files

- Markdown docs for Copilot visibility live under `/docs/`:
  - `VISION.md` — purpose and product promise.  
  - `ARCHITECTURE.md` — system overview (Expo + Supabase).  
  - `MVP_PLAN.md` — near-term goals and timeline.  
  - `ROLE_MODEL.md` — user roles (Artist, Venue, Member) and feature access.  
- Word/PDF versions exist for reference but are not parsed by Copilot. Always keep Markdown equivalents up to date.

### 12. Developer ethos

- Code should **feel** as refined as the design — readable, typed, minimal.  
- Avoid clever abstractions that obscure intent.  
- Every component and file should answer one question: *Does this make SONA simpler and more beautiful?*

---

### 13. Reference documents for Copilot context

For deeper architectural and product context, Copilot should always refer to the following Markdown documents located in `/docs/reference/`:

- `VISION.md` — outlines SONA’s purpose, creative philosophy, and MVP boundaries.
- `ARCHITECTURE.md` — describes technical system design (Expo + Supabase + modular folders).
- `MVP_PLAN.md` — defines MVP milestones, rollout goals, and development roadmap.
- `ROLE_MODEL.md` — defines user roles (Artist, Venue, Member) and their UI/feature distinctions.
- `GROWTH_INFRASTRUCTURE.md` — documents long-term hardware and scaling strategy.

These files serve as the canonical source of truth for project direction, user experience, and architectural intent.  
When building new features or refactoring code, **assume these reference documents are always loaded context** and align implementation details with them.

---


### 14. Branch & Workflow Guardrails (MANDATORY for Copilot)

Before generating ANY code, Copilot must:

1. Check the current Git branch using `git rev-parse --abbrev-ref HEAD`.
2. Confirm whether this is the correct branch for the requested feature.

Rules:
- If we are still on a previous feature branch (for example `feat/phase4-hls-playback`), Copilot must STOP and explicitly tell the user:
   “You are on <branch>. This feature belongs on <correct-branch>. Should I switch branches or create a new one?”
- Copilot must NEVER create files or write code on the wrong branch.

For every new task, Copilot must:
- Identify whether this task should be done on the current branch or on a new feature branch.
- If a new branch is needed, instruct:
   - `git checkout main`
   - `git pull origin main`
   - `git checkout -b feat/<task-name>`

Dev Workflow (must be followed):
- `main` = production
- `dev` = integration
- `feature/<name>` = short-lived work branches

Structural confirmations:
- Copilot is NOT allowed to generate migrations, screens, or folders without confirming:
   • the correct branch  
   • the repo structure under `/app`, `/src/features`, `/src/lib/api`, `/src/theme` as defined in `PROJECT_STRUCTURE_GUIDE.md`, Dev Workflow, and Design Bible.
- If Copilot detects any missing folders or files, it must notify the user instead of inventing structure.

Always reference these architectural anchors before outputting any code:
- `/src/theme/tokens.ts`
- `/src/lib/api/*`
- `/src/features/<feature>/screens/*`


   If anything here is unclear or you want more examples (e.g. preferred test harnesses, how we run DB migrations), tell me which sections to expand and I will iterate.
