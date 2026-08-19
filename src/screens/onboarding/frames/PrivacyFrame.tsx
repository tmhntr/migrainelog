import React from 'react';

import { Text } from '../../../components/ui';
import { FramePoints, OnboardingFrame } from '../OnboardingFrame';

/**
 * Stated as four absences rather than a feature list — what is *not*
 * happening is the product. The backup caveat is volunteered rather than
 * buried: "never leaves this phone" is otherwise not quite true, and a user
 * who finds the gap themselves discounts everything else on the frame.
 */
export function PrivacyFrame(): React.JSX.Element {
  return (
    <OnboardingFrame eyebrow="Privacy" headline="Your log never leaves this phone.">
      <FramePoints>
        <Text variant="body" tone="muted">
          No account, no sign-in, no email.
        </Text>
        <Text variant="body" tone="muted">
          No network requests at all. It works in airplane mode.
        </Text>
        <Text variant="body" tone="muted">
          No analytics, ads, or third-party trackers.
        </Text>
        <Text variant="body" tone="muted">
          Delete everything at once in{' '}
          <Text variant="bodyStrong">Settings &rarr; Clear all data</Text>.
        </Text>
      </FramePoints>

      <Text variant="label" tone="faint">
        Your device backup includes it, if you have iCloud or Finder backups
        turned on. Those are Apple&rsquo;s, not ours — we can&rsquo;t see them
        either.
      </Text>
    </OnboardingFrame>
  );
}
