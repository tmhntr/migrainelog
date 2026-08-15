# App Store Listing — MigraineLog v1.0.0

Everything below is ready to paste into App Store Connect. Character counts are noted against Apple's limits so nothing gets truncated.

---

## App information

| Field | Value |
|---|---|
| **App Name** (max 30) | `MigraineLog` (11) |
| **Subtitle** (max 30) | `Private migraine tracker` (25) |
| **Primary Category** | Health & Fitness |
| **Secondary Category** | Medical (optional) |
| **Bundle ID** | `dev.tmhntr.migrainelog` |
| **SKU** | `migrainelog-ios-001` |
| **Primary Language** | English (U.S.) |
| **Price** | Free |
| **Age Rating** | 4+ |

> If `MigraineLog` is taken, fall back to `MigraineLog: Tracker` (20).

---

## Promotional text (max 170, editable without resubmission)

```
Track migraine triggers, episodes, and treatments in seconds. 100% private — all your data stays on your device. No account, no ads, no tracking.
```
(147 chars)

---

## Description (max 4000)

```
MigraineLog is a simple, private way to understand your migraines.

Log triggers, episodes, and treatments in seconds, then see the patterns that matter — all without an account and without your data ever leaving your phone.

TRACK WHAT MATTERS
• Triggers — sleep, stress, food, weather, hormonal, and more, with a severity rating
• Episodes — severity, duration, symptoms, and aura
• Treatments — medications, rest, hydration, caffeine, and whether they actually helped

SEE YOUR PATTERNS
• A clear dashboard with your current risk level based on recent activity
• Your most common triggers and how often episodes occur
• Which treatments have worked best for you

PRIVATE BY DESIGN
• All data is stored locally on your device
• No account, no sign-up, no login
• No ads, no analytics, no third-party tracking
• Works completely offline

FAST TO LOG
• Quick-log buttons for triggers, episodes, and treatments
• Designed to capture an entry in just a few taps

MigraineLog keeps your health information where it belongs — with you.

—

MigraineLog is a personal tracking tool. It does not diagnose, treat, or prevent any medical condition, and it does not predict migraines. Consult a qualified healthcare provider for medical advice.
```
(~1,180 chars)

---

## Keywords (max 100 total, comma-separated, no spaces)

```
migraine,headache,tracker,journal,diary,trigger,symptom,health,log,aura,relief,pain
```
(84 chars)

---

## What's New in This Version

```
Initial release.
```

---

## URLs

| Field | Value |
|---|---|
| **Support URL** | https://tmhntr.github.io/migrainelog/support.html |
| **Privacy Policy URL** | https://tmhntr.github.io/migrainelog/privacy-policy.html |
| **Marketing URL** | (optional — leave blank) |

---

## Copyright

```
© 2026 Tim Hunter
```
(Replace with the exact legal name you want shown; this is the App Store copyright field.)

---

## App Privacy ("nutrition label")

Select **Data Not Collected**. The app makes no network calls, has no analytics or third-party SDKs, and stores everything on-device. This must match the Privacy Policy page.

---

## Age Rating questionnaire

Answer **No / None** to every content question → results in **4+**.

---

## App Review Information

- **Sign-in required:** No (the app has no account or login).
- **Demo account:** Not applicable.
- **Contact:** your name, phone, and email (App Review occasionally calls).
- **Notes:**

```
MigraineLog stores all data locally on the device. No login or account is required. To exercise the app, use the Quick Log buttons on the Dashboard (or the + on any tab) to add a trigger, episode, or treatment. The Dashboard then shows a calculated risk level and summary based on recent entries. A medical disclaimer is shown in Settings and in the App Store description. The app makes no network calls and works fully offline (safe to test in Airplane Mode).
```

---

## Export Compliance

- Uses non-exempt encryption: **No**.
- Already declared in the binary via `ITSAppUsesNonExemptEncryption: false` in `app.json`, so you should not be prompted again on upload.

---

## Screenshots

Location: `docs/app-store/screenshots/` — five 6.9" iPhone screenshots (1320 × 2868, iPhone 16 Pro Max), captured on the current `dev` build with realistic sample data and a clean 9:41 status bar. This is the only device size Apple requires.

| Order | File | Shows |
|---|---|---|
| 1 | `01-dashboard.png` | Dashboard — risk level, quick log, summary, recent events |
| 2 | `02-triggers.png` | Trigger history with category filters and severity |
| 3 | `03-log-trigger.png` | Logging a trigger — category, severity, notes |
| 4 | `04-episode-detail.png` | Episode detail — severity, aura, duration, symptoms |
| 5 | `05-settings-privacy.png` | Settings — on-device storage note and medical disclaimer |

Notes:
- Order 5 intentionally surfaces the privacy/disclaimer copy, which helps with Guideline 1.4.1 (Physical Harm) and 5.1.1 (Privacy).
- All five screens reflect features actually in the build — no widgets or unshipped features are shown (Guideline 2.3.10, Accurate Metadata).
- Upload in this order; App Store Connect uses the first as the primary preview.
```
