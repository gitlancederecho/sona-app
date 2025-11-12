**SONA by IONE -- MVP Development Plan (2025-2026)**

**Goal: Create the first working version of SONA---a live-music iOS app
where artists can perform, fans can watch, and both sides can connect
directly---built entirely from Windows using Expo + EAS + Supabase.\
Stage: MVP focused on *one real artist*, Jude Pastor, to validate the
product, tech, and income model.**

**1. Core Identity**

  -----------------------------------------------------------------------------
  **Aspect**      **Description**
  --------------- -------------------------------------------------------------
  **Product**     **iOS app for live music streaming and tipping**

  **MVP focus**   **One artist (Jude Pastor) performing, fans watching +
                  tipping**

  **Platform**    **iOS (built on Windows via Expo + EAS Cloud)**

  **Language**    **TypeScript (React Native + Expo)**

  **Backend**     **Supabase (Auth, Database, Storage, Realtime)**

  **Payments**    **Stripe Checkout (via serverless endpoint)**

  **Streaming**   **Mux / Livepeer (HLS playback first, RTMP publish later)**

  **Analytics**   **Mixpanel / PostHog**

  **Push**        **Expo Notifications**

  **Design**      **Apple-inspired minimalism: dark base #111111, gradient
                  violet→amber, font Inter / SF Pro**
  -----------------------------------------------------------------------------

**2. MVP Objective**

**Deliver a stable, TestFlight-ready iOS app where:**

1.  **Jude logs in (Supabase Auth).**

2.  **Fans can watch his live or replayed stream (HLS Playback).**

3.  **Fans can tip Jude via Stripe Checkout.**

4.  **Jude can manage his setlist and upload highlight clips.**

5.  **Push notifications alert fans when he goes live.**

6.  **Analytics show viewer count, tips, and engagement.**

**When these work in production, SONA is validated.**

**3. Development Route**

**We build in 12 phases, each ending in a verifiable deliverable.**

**Phase 1 --- Project Boot / Environment Setup**

**Goal: Working skeleton app on iPhone through Expo Go.**

- **Install Node.js LTS, Git, VS Code, Expo CLI, EAS CLI.**

- **npx create-expo-app sona \--template tabs \--typescript**

- **Confirm hot reload works on iPhone (Expo Go).**

- **Apply brand theme (colors, font, "SONA -- Where music happens.").\
  Deliverable: "SONA" screen visible on device.**

**Phase 2 --- Supabase Integration**

**Goal: Single source of truth.**

**Tables**

  ----------------------------------------------------------------
  **Name**       **Key Fields**
  -------------- -------------------------------------------------
  **users**      **id uuid (pk), name, avatar_url, bio, badge,
                 created_at**

  **streams**    **id, user_id, title, playback_url, status,
                 started_at, ended_at**

  **tips**       **id, from_user_id, to_user_id, amount,
                 stream_id, created_at**

  **clips**      **id, user_id, title, video_url, like_count,
                 created_at**

  **follows**    **follower_id, followed_id, created_at**

  **setlists**   **id, user_id, title, songs (json), created_at**
  ----------------------------------------------------------------

- **Connect Expo app with \@supabase/supabase-js.**

- **Test: fetch all users → print to screen.\
  Deliverable: Console logs real Supabase data.**

**Phase 3 --- Authentication + Profile**

**Goal: Jude can sign in/out and edit profile.**

- **Implement email magic-link login (fastest).**

- **Store user session locally (AsyncStorage).**

- **Profile screen: avatar, bio, badge display + edit.**

- **Update writes to Supabase users.\
  Deliverable: Create account → login → edit → logout works.**

**Phase 4 --- Home + Playback (HLS)**

**Goal: Fans can watch live or replay.**

- **Home screen sections:**

  - **Live Now = streams where status = "live".**

  - **Trending Clips = clips ordered by likes.**

  - **Upcoming Events = scheduled streams.**

- **Playback screen:**

  - **\<Video source={{uri: playback_url}} useNativeControls /\> using
    expo-av.**

  - **Song title + viewer count display.\
    Deliverable: Mux/Livepeer test stream plays on iPhone.**

**Phase 5 --- Tipping System (Stripe Checkout)**

**Goal: Validate income model.**

- **Supabase Edge Function creates Stripe Checkout Session (test
  mode).**

- **Expo app opens link via expo-web-browser.**

- **Stripe webhook → insert tip record in tips table.**

- **"Thanks for supporting Jude!" confetti animation
  (react-native-confetti-cannon).\
  Deliverable: ¥100 test tip appears in dashboard and stream summary.**

**Phase 6 --- Setlist Tool**

**Goal: Give Jude show-prep utility.**

- **CRUD interface for setlists.**

- **Each item: song title + notes (+ optional lyrics file).**

- **"Stage Mode" = large text + swipe navigation + expo-keep-awake.\
  Deliverable: Jude creates a setlist and uses it in Stage Mode.**

**Phase 7 --- Clip Upload + Feed**

**Goal: Keep app active off-show.**

- **Record/pick 30 sec clip → compress (react-native-compressor) →
  upload to Supabase Storage.**

- **Feed grid: autoplay preview (expo-av), like button updates count.\
  Deliverable: Uploaded clip appears instantly on Home feed.**

**Phase 8 --- Push Notifications**

**Goal: Pull fans back.**

- **Register Expo Push token → store per user.**

- **When stream.status=live, trigger push "Jude is live!"**

- **When tip received → push "You just supported Jude!"\
  Deliverable: Device receives test notifications from server.**

**Phase 9 --- Analytics**

**Goal: Quantify engagement.**

- **Log events: app_open, stream_start, tip_sent, clip_view.**

- **Dashboard in Mixpanel / PostHog.\
  Deliverable: Metrics visible for test sessions.**

**Phase 10 --- iOS Build + TestFlight**

**Goal: Real installable app, no Mac.**

- **Configure EAS (eas build:configure).**

- **Set ios.bundleIdentifier = \"com.ione.sona\".**

- **Build preview: eas build -p ios \--profile preview.**

- **Submit to TestFlight: eas submit -p ios.\
  Deliverable: Jude installs SONA from TestFlight and logs in.**

**Phase 11 --- Go Live (Phone to RTMP)**

**Goal: Artist can broadcast from camera.**

- **Add native module: react-native-nodemediaclient or Swift wrapper
  around HaishinKit.**

- **Switch to EAS custom dev client build so native code loads.**

- **Go Live screen: title + thumbnail + attach setlist + Start/Stop.\
  Deliverable: Tap Start → stream visible on another device.**

**Phase 12 --- Private Beta → Public Launch**

**Goal: Real-world test with metrics.**

- **Private TestFlight for 10--20 viewers.**

- **Measure stability + tip conversion.**

- **Fix bugs, then host SONA Live #1 (Jude Pastor Beta Night).**

**Success Metrics**

  ------------------------------------------
  **Metric**             **Target**
  ---------------------- -------------------
  **Streams**            **≥ 3 successful
                         sessions**

  **Viewers / Event**    **≥ 100**

  **Tip Rate**           **≥ 10 % of
                         viewers**

  **Return Viewers**     **≥ 50 %**

  **Artist Sign-ups      **≥ 3--5**
  (post event)**         
  ------------------------------------------

**4. Technical Stack Summary**

  ----------------------------------------------------------------------
  **Layer**       **Tool**                     **Purpose**
  --------------- ---------------------------- -------------------------
  **UI            **Expo (React Native +       **Cross-platform iOS
  Framework**     TypeScript)**                dev**

  **Backend**     **Supabase**                 **Auth / DB / Storage /
                                               Realtime**

  **Streaming**   **Mux / Livepeer**           **HLS playback + RTMP
                                               publish**

  **Payments**    **Stripe Connect +           **Tips + fan support**
                  Checkout**                   

  **Push**        **Expo Notifications**       **Fan re-engagement**

  **Analytics**   **Mixpanel / PostHog**       **User insight**

  **Styling**     **NativeWind + Expo          **Consistent visuals**
                  LinearGradient**             

  **CI/CD**       **EAS Build / EAS Submit**   **Cloud iOS build
                                               pipeline**

  **Version       **GitHub (sona-app)**        **Source repo + issues**
  Control**                                    
  ----------------------------------------------------------------------

**5. Design Guidelines**

- **Minimal dark UI (#111111 background).**

- **Gradient accents (violet → amber).**

- **Motion synced to sound / actions.**

- **Rounded cards, soft shadows.**

- **Clear hierarchy (1 artist focus = Jude).**

**6. Definition of Done for MVP**

- **iOS app live on TestFlight.**

- **Jude can stream + receive tips successfully.**

- **Fans can watch, tip, and receive notifications.**

- **At least one live event produces real engagement data.**

**When this checklist is complete, the MVP is validated and the next
phase (Fan Layer, multi-artist expansion) begins.**
