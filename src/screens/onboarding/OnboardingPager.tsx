import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDatabase } from '../../hooks/use-database';
import { usePreferenceStore } from '../../stores/preference-store';
import { useTheme } from '../../theme';
import { Button, Text } from '../../components/ui';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { WelcomeFrame } from './frames/WelcomeFrame';
import { DisclaimerFrame } from './frames/DisclaimerFrame';
import { PrivacyFrame } from './frames/PrivacyFrame';
import { WhatYouLogFrame } from './frames/WhatYouLogFrame';
import { RiskFrame } from './frames/RiskFrame';
import { ResearchFrame } from './frames/ResearchFrame';
import { ComfortFrame } from './frames/ComfortFrame';
import { DoneFrame } from './frames/DoneFrame';

/** Where the flow hands control back to. */
export type OnboardingExit = 'dashboard' | 'log-trigger';

export interface OnboardingPagerProps {
  /**
   * `full` runs the eight-frame flow. `disclaimer` presents the gate alone,
   * for an established user meeting revised wording — they have seen the rest.
   */
  mode?: 'full' | 'disclaimer';
  onDone: (exit: OnboardingExit) => void;
}

interface FrameSpec {
  key: string;
  body: React.ReactNode;
  primaryLabel: string;
  secondaryLabel?: string;
  /** The disclaimer gate: no skip, no swipe, no advance until acknowledged. */
  gate?: boolean;
}

/**
 * The first-launch flow. Mounted above the tab navigator rather than inside
 * it, so the dashboard never flashes behind it.
 *
 * Nothing here advances on its own: no timers, no auto-playing carousel. It
 * may be read by someone with a migraine already underway, and a screen that
 * moves without being asked is the last thing that person needs.
 */
export function OnboardingPager({
  mode = 'full',
  onDone,
}: OnboardingPagerProps): React.JSX.Element {
  const theme = useTheme();
  const db = useDatabase();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const completeOnboarding = usePreferenceStore((s) => s.completeOnboarding);
  const acknowledgeDisclaimer = usePreferenceStore((s) => s.acknowledgeDisclaimer);

  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const frames = useMemo<FrameSpec[]>(() => {
    const disclaimer: FrameSpec = {
      key: 'disclaimer',
      body: (
        <DisclaimerFrame
          acknowledged={acknowledged}
          onToggle={() => setAcknowledged((prev) => !prev)}
        />
      ),
      primaryLabel: 'Continue',
      gate: true,
    };

    if (mode === 'disclaimer') return [disclaimer];

    return [
      { key: 'welcome', body: <WelcomeFrame />, primaryLabel: 'Get started' },
      disclaimer,
      {
        key: 'privacy',
        body: <PrivacyFrame />,
        primaryLabel: 'Continue',
      },
      { key: 'what-you-log', body: <WhatYouLogFrame />, primaryLabel: 'Continue' },
      { key: 'risk', body: <RiskFrame />, primaryLabel: 'Continue' },
      { key: 'research', body: <ResearchFrame />, primaryLabel: 'Continue' },
      { key: 'comfort', body: <ComfortFrame />, primaryLabel: 'Continue' },
      {
        key: 'done',
        body: <DoneFrame />,
        primaryLabel: 'Log my first trigger',
        secondaryLabel: 'Go to the dashboard',
      },
    ];
  }, [acknowledged, mode]);

  const current = frames[index];
  const isLast = index === frames.length - 1;
  const gateIndex = frames.findIndex((frame) => frame.gate === true);

  const scrollTo = useCallback(
    (next: number) => {
      scrollRef.current?.scrollTo({ x: next * width, animated: !reduceMotion });
      setIndex(next);
    },
    [reduceMotion, width],
  );

  // The acknowledgement is recorded on leaving the gate, not on ticking the
  // box: a box ticked and then unticked is not consent.
  useEffect(() => {
    if (gateIndex >= 0 && index > gateIndex && acknowledged) {
      void acknowledgeDisclaimer(db);
    }
  }, [acknowledgeDisclaimer, acknowledged, db, gateIndex, index]);

  // Completion is marked on *reaching* the last frame, before either button is
  // pressed — someone who force-quits here has seen the flow.
  useEffect(() => {
    if (mode === 'full' && isLast) {
      void completeOnboarding(db);
    }
  }, [completeOnboarding, db, isLast, mode]);

  const finish = useCallback(
    async (exit: OnboardingExit) => {
      if (mode === 'full') await completeOnboarding(db);
      if (acknowledged) await acknowledgeDisclaimer(db);
      onDone(exit);
    },
    [acknowledgeDisclaimer, acknowledged, completeOnboarding, db, mode, onDone],
  );

  const handlePrimary = useCallback(() => {
    if (isLast) {
      void finish(mode === 'full' ? 'log-trigger' : 'dashboard');
      return;
    }
    scrollTo(index + 1);
  }, [finish, index, isLast, mode, scrollTo]);

  const handleSkip = useCallback(() => {
    // Before the gate there is nothing to skip *to* — jump to the one frame
    // that has to be seen rather than asking a pointless question.
    if (index < gateIndex) {
      scrollTo(gateIndex);
      return;
    }
    setConfirmSkip(true);
  }, [gateIndex, index, scrollTo]);

  const showSkip = mode === 'full' && current?.gate !== true && !isLast;
  const canAdvance = current?.gate !== true || acknowledged;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: theme.minTouchTarget,
          paddingTop: insets.top + theme.space.sm,
          paddingHorizontal: theme.space.md,
        }}
      >
        {index > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => scrollTo(index - 1)}
            style={{ minHeight: theme.minTouchTarget, justifyContent: 'center', paddingHorizontal: theme.space.sm }}
          >
            <Text variant="label" tone="faint">
              &lsaquo; Back
            </Text>
          </Pressable>
        ) : (
          <View />
        )}

        {showSkip ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip the introduction"
            onPress={handleSkip}
            style={{ minHeight: theme.minTouchTarget, justifyContent: 'center', paddingHorizontal: theme.space.sm }}
          >
            <Text variant="label" tone="faint">
              Skip
            </Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        // The gate is the only frame that traps the pager. Swiping is disabled
        // there entirely until the box is ticked; Back still works, because it
        // moves away from the thing being gated rather than past it.
        scrollEnabled={frames.length > 1 && canAdvance}
        onMomentumScrollEnd={(event) => {
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
        style={{ flex: 1 }}
      >
        {frames.map((frame) => (
          <View key={frame.key} style={{ width }} accessible={false}>
            {frame.body}
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          gap: theme.space.md,
          paddingHorizontal: theme.space.lg,
          paddingTop: theme.space.lg,
          paddingBottom: insets.bottom + theme.space.lg,
        }}
      >
        {frames.length > 1 && (
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={`Step ${index + 1} of ${frames.length}`}
            style={{
              flexDirection: 'row',
              gap: theme.space.sm,
              justifyContent: 'center',
              paddingBottom: theme.space.xs,
            }}
          >
            {frames.map((frame, i) => (
              <View
                key={frame.key}
                style={{
                  height: 6,
                  // The active dot widens rather than only changing colour, so
                  // position survives greyscale — the gauge's rule, applied to
                  // the chrome.
                  width: i === index ? 18 : 6,
                  borderRadius: theme.radius.pill,
                  backgroundColor:
                    i === index ? theme.colors.accent : theme.colors.borderStrong,
                }}
              />
            ))}
          </View>
        )}

        <Button
          label={current?.primaryLabel ?? 'Continue'}
          size="lg"
          disabled={!canAdvance}
          onPress={handlePrimary}
        />

        {current?.secondaryLabel !== undefined && (
          <Button
            label={current.secondaryLabel}
            variant="secondary"
            onPress={() => {
              void finish('dashboard');
            }}
          />
        )}
      </View>

      <ConfirmDialog
        visible={confirmSkip}
        title="Skip the introduction?"
        message="You can replay it any time from Settings."
        confirmLabel="Skip"
        destructive={false}
        onConfirm={() => {
          setConfirmSkip(false);
          void finish('dashboard');
        }}
        onCancel={() => setConfirmSkip(false)}
      />
    </View>
  );
}
