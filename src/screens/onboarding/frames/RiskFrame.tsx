import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../../../theme';
import { Text } from '../../../components/ui';
import { RiskGauge } from '../../../components/RiskGauge';
import { OnboardingFrame } from '../OnboardingFrame';

/** A frozen reading, chosen to sit mid-ramp so the gauge reads as a scale. */
const DEMO_SCORE = 58;

/**
 * The gauge is the one element a user will misread as a forecast, so the
 * headline corrects that before the number is described. The four clauses map
 * one-to-one onto the factors in `src/utils/risk.ts`, in plain language and
 * without the arithmetic.
 */
export function RiskFrame(): React.JSX.Element {
  const theme = useTheme();

  return (
    <OnboardingFrame
      eyebrow="How it works"
      headline="The number reads backwards, not forwards."
    >
      <View
        // The gauge insets itself to the screen gutter; this frame already
        // applies one, so cancel the double margin.
        style={{ marginHorizontal: -theme.space.lg }}
        // Illustrative: the real gauge, with a fixed input rather than this
        // user's (empty) data, and inert to VoiceOver's control navigation.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <RiskGauge score={DEMO_SCORE} label="high" />
      </View>

      <Text variant="body" tone="muted">
        It weighs four things you have already entered: how heavy your recent
        triggers were, how many different kinds, how often episodes have come
        lately, and how recently the last one ended.
      </Text>

      <Text variant="label" tone="faint" style={{ marginTop: -theme.space.sm }}>
        Expect it to jump around at first. It steadies once there are a couple of
        weeks of entries behind it.
      </Text>
    </OnboardingFrame>
  );
}
