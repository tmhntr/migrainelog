# iOS App Store Launch Checklist — MigraineLog MVP

A linear, fastest-path checklist for a first-time iOS submitter with no Apple Developer account yet.

Target timeline: **~2 weeks from today to "Ready for Review"**, gated mostly on Apple Developer enrollment (1–3 business days) and App Review (typically 24–48h).

---

## Phase 0 — Apple Developer Account (do this first; it has the longest external wait)

- [ ] Create an Apple ID dedicated to development (or use personal one) with **2FA enabled** — required, no exceptions.
- [ ] Enroll in the **Apple Developer Program** at https://developer.apple.com/programs/ — **$99 USD / year**.
  - [ ] Choose **Individual** enrollment (faster — no D-U-N-S number required). Pick Organization only if you need a company name on the listing.
  - [ ] Have a government ID and a credit card matching the Apple ID's billing address ready.
  - [ ] Expect 24–72 hours for approval (sometimes same-day, occasionally a week if they ask for ID verification).
- [ ] While waiting, complete Phase 1 (codebase fixes) and Phase 2 (assets + legal pages) in parallel.

---

## Phase 1 — Codebase fixes (blockers found in audit)

These are required before EAS can build a submittable IPA.

- [ ] **Add `ios.bundleIdentifier` to `app.json`.** Use reverse-DNS, e.g. `com.tmhntr.migrainelog`. Once chosen this is **permanent** — picking a new one means a new app listing.
- [ ] **Add `ios.buildNumber`** (start at `"1"`). Increment for every TestFlight/App Store build.
- [ ] **Add `ios.config.usesNonExemptEncryption: false`** — app makes zero network calls, so this is true. Without this flag you'll get an export-compliance prompt on every TestFlight upload.
- [ ] **Set `ios.supportsTablet: false`** for v1. Currently `true`, which means Apple will require iPad screenshots and an iPad-tested binary. Flip to `false` to skip both. (Re-enable in a later release if you want iPad.)
- [ ] **Decide on widget for v1.** The README advertises a "Quick Logging Widget" but `src/widgets/` does not exist. Either:
  - [ ] Cut it from the README/marketing copy for v1 (recommended for speed), **or**
  - [ ] Implement it — note this requires `expo-dev-client` + a config plugin or ejecting, adds 1–2 weeks, and complicates review.
- [ ] **Add a medical disclaimer** in the Settings screen and on the App Store description. Required to avoid Guideline 1.4.1 (Physical Harm) rejection. Suggested copy:
  > MigraineLog is a personal tracking tool. It does not diagnose, treat, or prevent any medical condition. Consult a qualified healthcare provider for medical advice.
- [ ] **Confirm `App.tsx` handles SQLite migration failures gracefully** — currently shows an infinite spinner if `useDatabaseReady()` never resolves. Add a fallback error UI, even minimal. App Review will reject if the app hangs on a fresh install.
- [ ] **Test fresh install path:** delete app, reinstall, ensure first launch with no data shows working empty states on every tab (not blank white screens).
- [ ] **Run `npm run typecheck && npm run lint && npm test`** clean before building.

### Optional but worth doing for v1

- [ ] **App icon sanity check:** open `assets/icon.png` and confirm it is **1024×1024**, square, **no transparency**, **no rounded corners** (Apple rounds them). Apple auto-rejects icons with alpha channels.
- [ ] Add an `App.tsx` `<ErrorBoundary>` so a render crash shows a friendly screen, not a white screen of death.
- [ ] If `userInterfaceStyle` stays `"light"`, fine — but make sure status bar contrasts on all screens.

---

## Phase 2 — Required hosted pages (Apple won't accept the listing without these)

- [ ] **Privacy Policy URL** — required for every app, even data-not-collected ones. Easiest options:
  - [ ] GitHub Pages on this repo (`docs/privacy-policy.md` → enable Pages), **or**
  - [ ] A free Notion/Carrd page.
  - Content needs to state: data is stored only on-device, no collection, no third-party sharing, no analytics, contact email.
- [ ] **Support URL** — required. Can be the same GitHub Pages site with a "Support" section, or a `mailto:` page, or the repo's Issues page.
- [ ] **Marketing URL** — optional, skip for MVP.

---

## Phase 3 — App Store Connect setup (do once enrollment is approved)

- [ ] Sign in to https://appstoreconnect.apple.com.
- [ ] **Register the Bundle ID** at https://developer.apple.com/account/resources/identifiers/list — must match the value you put in `app.json` exactly.
- [ ] **Create a new app** in App Store Connect → My Apps → "+":
  - [ ] Platform: iOS
  - [ ] Name: `MigraineLog` (check availability; max 30 chars). Reserve a fallback like `MigraineLog: Tracker` in case it's taken.
  - [ ] Primary language: English (U.S.)
  - [ ] Bundle ID: select the one you just registered
  - [ ] SKU: any unique string, e.g. `migrainelog-ios-001`
- [ ] **Primary Category:** `Medical` or `Health & Fitness`. Medical gets stricter review but is more accurate. Health & Fitness is the safer, faster path for v1.
- [ ] **Age Rating questionnaire:** all "No" → 4+.
- [ ] **App Privacy ("nutrition label"):** select **"Data Not Collected"**. This is true — no analytics, no network, no third-party SDKs that phone home.
- [ ] **Pricing:** Free.
- [ ] **Availability:** all territories (or restrict if you have a reason).

---

## Phase 4 — App Store listing content

Prepare a single doc with all of this so you can paste it in one sitting.

- [ ] **App name** (30 chars max).
- [ ] **Subtitle** (30 chars max). E.g., `Track migraines privately`.
- [ ] **Description** (4000 chars max). Lead with: what it does, on-device privacy, no account/no ads. Include the medical disclaimer at the bottom.
- [ ] **Keywords** (100 chars total, comma-separated, no spaces around commas). Examples: `migraine,headache,tracker,health,journal,diary,trigger,symptom`.
- [ ] **Promotional text** (170 chars, editable without resubmission).
- [ ] **What's New in This Version:** for v1, `Initial release.`
- [ ] **Support URL** + **Privacy Policy URL** (from Phase 2).
- [ ] **Copyright:** `© 2026 <your name>`.
- [ ] **Contact info** for App Review (your phone + email). They sometimes call.

### Screenshots (required)

You only need **one device size** as of 2024+:

- [ ] **6.9" iPhone display (iPhone 16 Pro Max)** — 1320×2868 portrait. **Required.**
- [ ] 3–10 screenshots. Suggested: Dashboard, Trigger list, Trigger form, Episode detail, Settings (with disclaimer visible).
- [ ] Capture via iOS Simulator (`Cmd+S` saves to Desktop) running on iPhone 16 Pro Max sim.
- [ ] No status bar mocking, no device frames required, no marketing text required for MVP.
- [ ] **App preview video:** skip for v1.

---

## Phase 5 — Build and upload

Do this from a **Mac** (required — EAS Submit works from any OS, but TestFlight Transporter and Xcode-based fallbacks need macOS). Pure EAS workflow below works from Linux too.

- [ ] `npm install --legacy-peer-deps`
- [ ] `npm i -g eas-cli`
- [ ] `eas login` — use the Apple-Developer-enrolled Apple ID when prompted.
- [ ] `eas init` — confirms the existing `extra.eas.projectId` (`cfa4e0c4-...`) in `app.json`.
- [ ] Create **`eas.json`** at repo root with a minimal production profile:

  ```json
  {
    "cli": { "version": ">= 12.0.0" },
    "build": {
      "production": {
        "ios": { "autoIncrement": "buildNumber" }
      }
    },
    "submit": {
      "production": {
        "ios": {
          "appleId": "you@example.com",
          "ascAppId": "<from App Store Connect after Phase 3>",
          "appleTeamId": "<from developer.apple.com → Membership>"
        }
      }
    }
  }
  ```

- [ ] `eas build --platform ios --profile production`
  - First build will prompt to **let EAS manage your credentials** (distribution cert + provisioning profile) — say **yes**. This is the path of least resistance for a first-timer.
  - Build runs ~15–25 min on EAS servers.
- [ ] `eas submit --platform ios --profile production --latest`
  - Uploads the IPA to App Store Connect. Takes ~5–10 min to "process" before it appears in TestFlight.

---

## Phase 6 — TestFlight (strongly recommended before submitting for review)

- [ ] In App Store Connect → TestFlight → wait for the build to finish processing (10–30 min).
- [ ] Add yourself as an **Internal Tester** (no separate Apple review needed).
- [ ] Install **TestFlight** app on your iPhone, accept the invite, install MigraineLog.
- [ ] Run through every screen on a real device:
  - [ ] Fresh install → app launches without crash
  - [ ] Log a trigger, episode, and treatment
  - [ ] Edit and delete each
  - [ ] Risk gauge updates
  - [ ] Force-quit and relaunch — data persists
  - [ ] Airplane mode — fully functional (it should be; no network anywhere)
  - [ ] Tap every button on Settings; disclaimer visible
- [ ] Fix anything you find, bump `buildNumber`, rebuild, resubmit to TestFlight, retest.

---

## Phase 7 — Submit for Review

- [ ] In App Store Connect → App → "+ Version or Platform" → enter version `1.0.0` if not already there.
- [ ] Attach the latest build.
- [ ] Fill in **Export Compliance**: confirm "uses non-exempt encryption" = No.
- [ ] **App Review Information:** sign-in not required (no auth in app). Add demo notes:
  > MigraineLog stores all data locally. No login or account is required. To exercise the app, tap the "+" on any tab to log a trigger, episode, or treatment. The Dashboard updates with a calculated risk level based on recent entries.
- [ ] Click **Submit for Review**.
- [ ] Expected wait: **24–48 hours**, occasionally up to 7 days.

---

## Phase 8 — Common rejection traps to pre-empt

- [ ] **Guideline 1.4.1 (Physical Harm)** — medical apps get scrutiny. The disclaimer in Settings + description is your shield. Do **not** claim the app predicts migraines or replaces medical care.
- [ ] **Guideline 2.1 (App Completeness)** — no Lorem Ipsum, no "Coming Soon" buttons, no broken nav. Quickly scan every screen.
- [ ] **Guideline 4.0 (Design)** — must feel native. Bottom tabs + native stack already gets you most of the way there.
- [ ] **Guideline 5.1.1 (Privacy)** — privacy policy URL must load, must mention the app by name, must match the App Privacy nutrition label answers.
- [ ] **Guideline 2.3.10 (Accurate Metadata)** — screenshots must match the app you submitted. Don't show widgets in screenshots if widgets aren't in v1.

---

## Phase 9 — Post-approval

- [ ] Release: manual or automatic. Pick **manual** so you can pick the launch day.
- [ ] Once live, save the App Store URL.
- [ ] For v1.1, bump `version` in `app.json` to `1.0.1` (or `1.1.0`) **and** bump `buildNumber`. EAS's `autoIncrement` handles `buildNumber` for you.

---

## Quick reference: what's blocking each phase

| Phase | Blocked by |
|---|---|
| 0 — Developer account | Nothing — start today |
| 1 — Codebase fixes | Nothing — start today |
| 2 — Hosted pages | Nothing — start today |
| 3 — App Store Connect | Phase 0 complete |
| 4 — Listing content | Phase 3 (mostly) + Phase 2 (URLs) |
| 5 — Build & upload | Phases 1, 3 complete |
| 6 — TestFlight | Phase 5 complete |
| 7 — Submit | Phases 4, 6 complete |
| 8 — Rejections | Continuous |
| 9 — Release | Apple approval |

**Critical path:** Phase 0 (1–3 days) → Phase 5 (~1 hour active, ~30 min build wait) → Phase 6 (~1 day of dogfooding) → Phase 7 (1–2 day review).

Realistic best case: **5–7 days** if Apple approves enrollment quickly and the app passes review on the first try.
