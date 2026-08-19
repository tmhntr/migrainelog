import React from 'react';
import { Linking, Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../../theme';
import { Text } from '../../../components/ui';
import { OnboardingFrame } from '../OnboardingFrame';
import { PRIVACY_POLICY_URL, RESEARCH_PAPER_URL, SUPPORT_URL } from '../links';

interface ExternalLink {
  label: string;
  url: string;
}

const LINKS: ExternalLink[] = [
  { label: 'The research paper', url: RESEARCH_PAPER_URL },
  { label: 'Privacy policy', url: PRIVACY_POLICY_URL },
  { label: 'Support & contact', url: SUPPORT_URL },
];

/**
 * Says outright that today's score is hand-tuned, which is true and is what
 * makes the rest of the frame credible. The surprisal finding is attributed to
 * the study and never restated as something this app computes — that scoring
 * has not shipped. See docs/SURPRISAL_INTEGRATION.md.
 */
export function ResearchFrame(): React.JSX.Element {
  const theme = useTheme();

  return (
    <OnboardingFrame eyebrow="Further reading" headline="Where the ideas come from.">
      <Text variant="body" tone="muted">
        Today&rsquo;s score is a simple weighted tally, tuned by hand. A
        better-grounded one is being built on{' '}
        <Text variant="bodyStrong">surprisal</Text> — a measure of how unusual a
        day&rsquo;s exposures are compared with your own history.
      </Text>

      <View
        style={{
          borderLeftWidth: theme.border.thick,
          borderLeftColor: theme.colors.borderStrong,
          paddingLeft: theme.space.md,
        }}
      >
        <Text variant="caption" tone="faint">
          Turner DP, et al. Information-Theoretic Trigger Surprisal and Future
          Headache Activity. JAMA Network Open. 2025;8(11):e2542944.
        </Text>
      </View>

      <Text variant="label" tone="muted">
        In that study each additional bit of surprisal came with roughly double
        the odds of a headache starting within 24 hours.
      </Text>

      <View>
        {LINKS.map((link) => (
          <Pressable
            key={link.url}
            accessibilityRole="link"
            accessibilityHint="Opens in your browser"
            onPress={() => {
              void Linking.openURL(link.url);
            }}
            style={({ pressed }) => [
              {
                minHeight: theme.minTouchTarget,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: theme.space.md,
                borderTopWidth: theme.border.hairline,
                borderTopColor: theme.colors.border,
              },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text variant="bodyStrong" tone="accent">
              {link.label}
            </Text>
            {/*
              Every outbound row is marked. Three frames after promising the app
              makes no network requests, an unlabelled link that opens a browser
              reads as a broken promise.
            */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
              <Text variant="caption" tone="faint" uppercase>
                Web
              </Text>
              <MaterialIcons
                name="open-in-new"
                size={14}
                color={theme.colors.inkFaint}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </OnboardingFrame>
  );
}
