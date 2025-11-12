**SONA by IONE --- Vision & MVP Build Summary (For Continuity)**

**Core Identity**

- **Company:** IONE (design + technology studio)

- **Product:** SONA --- *a live music app built for artists and fans who
  live music.*

- **Tagline:** "Where music happens."

- **Design Philosophy:** Minimal, emotional, human. Apple-inspired.
  Every feature must serve clarity or emotion --- no bloat, no clutter.

------------------------------------------------------------------------

**Concept Overview**

**SONA by IONE** is a **live music ecosystem** where artists perform,
fans watch, and both can connect directly.\
Unlike TikTok or Instagram, it's not about short content loops --- it's
about *real performances and real community.*

**Three Equal Roles**

1.  **Artists:** Go live, upload short clips, manage setlists, and earn
    from fans.

2.  **Fans:** Watch live shows, tip artists, follow favorites, and
    replay moments.

3.  **Venues / Organizers (future phase):** Host events, tag artists,
    sell tickets.

Everyone is equal; recognition comes through **earned badges**
(Performer, Verified Artist, etc.)

------------------------------------------------------------------------

**Prototype Focus --- Jude Pastor (Phase 1)**

SONA's first MVP is designed **specifically for Jude Pastor**, a real
independent artist with a following.\
He will use the prototype to:

- Go live and receive tips in real time.

- Upload short clips and moments.

- Manage his setlist for gigs (lyrics, notes).

- Engage directly with fans through notifications and highlights.

Jude's live sessions will act as the *first public test* of SONA's core
experience.

------------------------------------------------------------------------

**Core Features for MVP**

  ----------------------------------------------------------------
  **Category**        **Feature**               **Purpose**
  ------------------- ------------------------- ------------------
  **User Identity**   Sign in with Apple /      Account creation
                      Email                     

  **Profile**         Avatar, bio, badges,      Artist identity
                      stats                     

  **Live Streaming**  Mux or Livepeer           Artists perform
                      integration               live

  **Tipping System**  Stripe Checkout           Validate income
                                                model

  **Setlist Tool**    Songs, notes, lyrics      Artist workflow

  **Clips Feed**      Short video uploads       Keeps app alive
                                                daily

  **Home Screen**     "Live Now," "Trending     Entry point for
                      Moments"                  users

  **Notifications**   "Artist is Live," "You    Retention
                      got a tip!"               

  **Analytics**       Watch time, tips, repeats Learn user
                                                behavior
  ----------------------------------------------------------------

------------------------------------------------------------------------

**App Flow Summary**

1.  **Home Screen (The Stage):**

    - Live Now row

    - Trending Moments grid

    - Upcoming Events carousel

2.  **Watch Screen:**

    - Live video player

    - Live chat

    - Tip button (Stripe)

    - Viewer count + song title

3.  **Go Live:**

    - Title, thumbnail, attach setlist

    - Start/Stop streaming

    - Post-stream summary (earnings, viewers)

4.  **Profile:**

    - Badge, bio, clips, events

    - Follower count (hidden emphasis on connection, not vanity)

------------------------------------------------------------------------

**Platform & Stack**

  ---------------------------------------------
  **Layer**       **Tool / Framework**
  --------------- -----------------------------
  Mobile App      SwiftUI (iOS first)

  Backend         Supabase (Auth, DB, Storage)

  Streaming       Mux or Livepeer

  Payments        Stripe (Connect)

  Analytics       PostHog or Mixpanel

  Notifications   Firebase Cloud Messaging
                  (FCM)

  Design          Figma for wireframes + brand
                  system
  ---------------------------------------------

------------------------------------------------------------------------

**Design Language**

- **Colors:** Deep charcoal base (#111111), gradients in violet → amber
  for emotion.

- **Typography:** Inter or SF Pro --- clean, geometric.

- **Motion:** Rhythmic, smooth transitions; sound-linked micro-haptics.

- **Feel:** Netflix x Apple Music --- cinematic yet calm.

------------------------------------------------------------------------

**Build Phases**

**Phase 1 (0--3 months) -- Jude MVP**

- iOS only

- Core features: Live Stream, Tip, Setlist, Clips, Profile

- Private TestFlight for Jude + small fan group

- First public live stream as beta event

**Phase 2 (3--6 months) -- Fan Layer**

- Follow + notification system

- Fan feed + tipping history

- Analytics dashboard for artists

**Phase 3 (6--12 months) -- Multi-Artist & Ticketed Events**

- Open registration for other artists

- Ticketed livestreams + merch integration

- Verified badges + AI translations

------------------------------------------------------------------------

**Monetization**

  -----------------------------------------------------
  **Stream**          **Model**            **Platform
                                           Cut**
  ------------------- -------------------- ------------
  **Tips**            Real-time during     10%
                      streams              

  **Tickets**         Paid live event      10%
                      entry                

  **Subscriptions**   Monthly fan pass     20%

  **Pro Tools**       Artist               ¥1,500 /
                      analytics/setlists   month

  **Merch**           Partner integration  10%
  -----------------------------------------------------

------------------------------------------------------------------------

**Success Metrics (Prototype)**

1.  Jude streams successfully ≥3 times.

2.  100+ live viewers per event.

3.  ≥10% of viewers tip.

4.  50% of fans return to next stream.

5.  3--5 new artists request access to SONA.

------------------------------------------------------------------------

**Development Order (Simplified)**

1.  Supabase setup + data models

2.  Auth + Profile screen

3.  Live streaming

4.  Tipping integration

5.  Smart Setlist

6.  Clip upload + feed

7.  Notifications

8.  Analytics

9.  QA + TestFlight

------------------------------------------------------------------------

**Tone for all future versions of ChatGPT**

- **Do not** reinvent or rename SONA.

- **Do not** overcomplicate with AI features early.

- **Keep design minimal and emotional.**

- **Focus first on one artist (Jude) as test case.**

- **Everything must tie back to usability for artists and emotional
  experience for fans.**

- **Goal:** SONA should *feel like music*, not like an app.
