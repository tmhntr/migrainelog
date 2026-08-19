# Onboarding Flow Design

Visual storyboard (frame mockups in the app's real tokens): [Quiet Start](https://claude.ai/code/artifact/73ae1e76-a3fb-40ed-960e-5f5a070dc035)

## Goal

A first-launch flow that does four things — introduces the app, states plainly what
it is not, teaches the three-verb model, and gets out of the way — for someone who
may be installing it at 2 a.m. with a migraine already underway.

## Constraints

1. **It may be read mid-attack.** No timed advances, no auto-playing carousel, no
   animation beyond a cross-fade. Targets clear the 48pt floor (`minTouchTarget`).
   Skipping to a log entry is one tap from every frame but 02.
2. **The disclaimer is a gate, not a slide.** Frame 02 cannot be skipped or swiped
   past, and takes an explicit acknowledgement stored with the app version, so
   revised wording can ask again rather than inherit consent given to older text.
3. **Teach the model, not the interface.** No tooltip tour or spotlight overlays.
   The app is four controls deep; what a new user lacks is the mental model —
   trigger, episode, treatment, and what the number at the top does and doesn't mean.

## Frames

| # | Frame | Job | Skippable |
|---|-------|-----|-----------|
| 01 | Welcome | Name the app and its promise in one sentence | Yes |
| 02 | What this app is, and isn't | Medical disclaimer + acknowledgement | **No — gate** |
| 03 | Your data stays here | On-device, no account, no network | Yes |
| 04 | Three things you log | Trigger / episode / treatment | Yes |
| 05 | The risk reading | What the score is made of; not a forecast | Yes |
| 06 | Research and further reading | Turner et al. 2025 + outbound links | Yes |
| 07 | Comfort | Theme preference, previewed live | Yes |
| 08 | Done | One first action | No — ending |

Design notes per frame:

- **01** deliberately omits the risk gauge. It is the app's signature reading and
  lands harder on frame 05 if this is not where it is first seen. The wordmark is
  the only use of the `display` role outside the gauge, at its lightest weight.
- **02** shows the three claims as hairline-separated points rather than a grey
  paragraph. Substance matches `SettingsScreen`'s disclaimer word for word so the
  two cannot drift. Bold falls on the two *nots*. Supports App Review 1.4.1.
- **03** states four absences rather than a feature list, and volunteers the device-
  backup caveat already in `docs/privacy-policy.md` — the flat claim "never leaves
  this phone" is otherwise not quite true, and a user who finds the gap themselves
  discounts everything else on the frame.
- **04** reuses each type's exact quick-log tint, border, and glyph
  (`change-history`, `blur-on`, `medication` from the bundled `MaterialIcons.ttf`),
  so the dashboard control is already familiar. Rows are illustrative, not tappable.
  "Notes and times can wait" pre-empts the commonest abandonment reason — the sense
  that a half-finished entry is a failed one.
- **05** uses the live `RiskGauge` with a frozen demo input (score 58 → `high` →
  "Elevated"), not a screenshot, so it follows token changes. The body's four
  clauses map one-to-one onto the factors in `src/utils/risk.ts` — trigger load,
  accumulation, episode frequency, recency — in plain language, without the numbers.
  The cold-start line is an honesty requirement: a score built from three entries
  genuinely swings, and an unwarned user reads that as the app being broken.
- **06** says outright that the current score is hand-tuned, which is true and is
  what makes the rest of the sentence credible. The surprisal finding is attributed
  to the study and never restated as something this app computes — see
  `docs/SURPRISAL_INTEGRATION.md`. Every outbound row is marked `Web ↗`: three
  frames after promising no network requests, an unlabelled link that opens a
  browser reads as a broken promise.
- **07** is the only configuration frame. Chips reuse `SettingsScreen`'s labels and
  write through `preference-store` immediately, repainting the frame so the choice
  is previewed rather than promised. No copy calls dark mode "easier on the eyes" —
  it is here for photophobia, and naming the real reason is what makes the setting
  findable again later.
- **08** ends on a doing. The risk score stays meaningless until something is logged,
  so the primary button starts the shortest form (trigger) rather than dropping the
  user on an empty dashboard. Cancelling that form lands on the Dashboard, never
  back in onboarding.

## Behaviour

| Concern | Decision |
|---------|----------|
| Presentation | One horizontal pager mounted *above* the tab navigator, so the dashboard never flashes behind it. `DatabaseProvider` already blocks render until hydration; the completion flag is read in the same pass. |
| Navigation | Swipe or **Continue** forward, swipe or **‹ Back** back. Forward-swipe disabled on frame 02 until acknowledged. No auto-advance, no timers. |
| Progress | Dots, not "3 of 8" — a count reads as homework. The active dot widens to a bar, so position survives greyscale (same shape-not-colour rule as the gauge). |
| Skip | Top-right on frames 01 and 03–07. Confirms once, then jumps to the Dashboard. |
| Persistence | Migration **v3** adds no table: the existing `preferences` key/value store takes `onboarding.completed_version`, `disclaimer.acknowledged_at`, `disclaimer.acknowledged_version`, hydrated alongside the theme preference. |
| Completion | Marked when frame 08 is *reached*, before either button is pressed. A user who force-quits there has seen the flow. |
| Re-entry | Settings → About → **Replay introduction**. Read-only: never clears data, and frame 07's chips reflect the current preference rather than resetting. |
| Upgrades | A 1.0.0 user has no completion flag but has data. If any table has rows, mark onboarding complete silently and show only frame 02 if the disclaimer version has moved. |
| Widget | Deep links (`migrainelog://quick-log/…`) bypass onboarding and go straight to the form — except that an unacknowledged disclaimer presents frame 02 first, as a sheet. |
| Accessibility | Each frame is one VoiceOver region read top to bottom; dots labelled "Step 3 of 8"; targets ≥ 48pt; contrast checked in both schemes; nothing conveyed by colour alone; under reduce-motion, frames cut instead of sliding. |
| Tokens | No new ones. Headlines `title`, body `body`, footnotes `label`, eyebrows `caption` uppercased. |

## Deliberately excluded

- **Permission prompts.** The app needs none, and asking for notifications before
  earning a reason to send any is how trackers get muted on day one.
- **Account, sign-in, data import.** There is no server.
- **A "tell us about your migraines" questionnaire.** The risk model is built from
  logged events, so quiz answers would change nothing on the dashboard while costing
  four more screens before the first entry.

## Copy deck

Final wording. Sentence case throughout, no exclamation marks, no second-person
imperatives about health. Strings that already exist elsewhere in the app or the
store listing are matched, not rewritten.

| Key | Role | String |
|-----|------|--------|
| `f1.eyebrow` | caption | Welcome to |
| `f1.wordmark` | display | MigraineLog |
| `f1.body` | body | A private place to record what happens before, during, and after a migraine — and to notice the patterns you can't hold in your head. |
| `f1.footnote` | label | Takes about a minute. Nothing to sign up for. |
| `f1.cta` | button | Get started |
| `common.skip` | button | Skip |
| `common.skip.confirm` | dialog | Skip the introduction? You can replay it from Settings. |
| `f2.eyebrow` | caption | Before you start |
| `f2.headline` | title | This is a notebook, not a diagnosis. |
| `f2.point.1` | body | It does **not** diagnose, treat, or prevent any medical condition. |
| `f2.point.2` | body | It does **not** predict migraines. The risk number summarises what you've already logged. |
| `f2.point.3` | body | Nothing here replaces advice from a clinician. Bringing your log to one is exactly what it's for. |
| `f2.ack` | checkbox | I understand |
| `f2.cta` | button | Continue |
| `f3.eyebrow` | caption | Privacy |
| `f3.headline` | title | Your log never leaves this phone. |
| `f3.point.1` | body | No account, no sign-in, no email. |
| `f3.point.2` | body | No network requests at all. It works in airplane mode. |
| `f3.point.3` | body | No analytics, ads, or third-party trackers. |
| `f3.point.4` | body | Delete everything at once in **Settings → Clear all data**. |
| `f3.caveat` | label | Your device backup includes it, if you have iCloud or Finder backups turned on. Those are Apple's, not ours — we can't see them either. |
| `f3.link` | button | Read the privacy policy |
| `f4.eyebrow` | caption | How it works |
| `f4.headline` | title | Three things to log. |
| `f4.trigger` | body | Something that might set one off — thin sleep, a stressful day, a skipped meal. Pick a category, rate it 1–5. |
| `f4.episode` | body | The migraine itself — severity 1–10, how long it lasted, symptoms, whether there was aura. |
| `f4.treatment` | body | What you tried — a medication, rest, water, caffeine — and later, whether it actually helped. |
| `f4.footnote` | label | Each is two taps from the dashboard. Only the thing you came to record is required; notes and times can wait. |
| `f5.headline` | title | The number reads backwards, not forwards. |
| `f5.body` | body | It weighs four things you've already entered: how heavy your recent triggers were, how many different kinds, how often episodes have come lately, and how recently the last one ended. |
| `f5.coldstart` | label | Expect it to jump around at first. It steadies once there are a couple of weeks of entries behind it. |
| `f6.eyebrow` | caption | Further reading |
| `f6.headline` | title | Where the ideas come from. |
| `f6.body` | body | Today's score is a simple weighted tally, tuned by hand. A better-grounded one is being built on **surprisal** — a measure of how unusual a day's exposures are compared with your own history. |
| `f6.citation` | caption | Turner DP, et al. Information-Theoretic Trigger Surprisal and Future Headache Activity. *JAMA Network Open.* 2025;8(11):e2542944. |
| `f6.finding` | label | In that study each additional bit of surprisal came with roughly double the odds of a headache starting within 24 hours. |
| `f6.links` | rows | How the risk score works · The research paper `↗` · Privacy policy `↗` · Support & contact `↗` |
| `f7.eyebrow` | caption | One setting |
| `f7.headline` | title | Set the brightness now, not mid-attack. |
| `f7.body` | body | Dark keeps the screen dim during an attack even when the rest of your phone is in light mode. Tap one to see it — the whole app changes with it. |
| `f7.footnote` | label | Changeable any time in Settings → Appearance. |
| `f8.eyebrow` | caption | That's everything |
| `f8.headline` | title | You're set. |
| `f8.body` | body | The dashboard is the whole app: your reading at the top, the three log buttons under it, and everything you've recorded below that. |
| `f8.footnote` | label | The first entry is the hard one. After that it's a few taps. |
| `f8.cta` | button | Log my first trigger |
| `f8.secondary` | button | Go to the dashboard |
| `settings.replay` | button | Replay introduction |

## Open questions

1. **Does frame 06 belong in the flow?** It is the most skippable frame and the one
   that convinces the sceptical user. The alternative is a single line on frame 05 —
   "How the risk score works" — with the research living in Settings, trading
   first-launch credibility for one fewer screen.
2. **Does the in-app article exist?** Frame 06 links to "How the risk score works",
   which is not built. Either write it in the same change or drop that row; a link
   to nothing is worse than no link.
3. **Frame 07's default.** *Match device* is honest, but someone installing during an
   attack would be better served by dark. Preselecting dark is presumptuous on a well
   day. Worth a decision rather than a default.

## Files this would touch

| File | Change |
|------|--------|
| `src/screens/onboarding/OnboardingPager.tsx` | New — the pager and frame state |
| `src/screens/onboarding/frames/*.tsx` | New — one component per frame |
| `src/db/migrations.ts` | Bump to v3; no schema change, keys only |
| `src/stores/preference-store.ts` | Onboarding completion + disclaimer ack |
| `src/hooks/use-database.ts` | Read the completion flag during hydration |
| `src/navigation/types.ts` | Onboarding route params |
| `src/screens/SettingsScreen.tsx` | **Replay introduction** in the About section |
| `CLAUDE.md` | Note the flow and the disclaimer-version rule |
