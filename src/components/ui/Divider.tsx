import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme';

export interface DividerProps {
  /** Insets the rule from the leading edge, for list separators. */
  inset?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Divider({ inset = false, style }: DividerProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          height: theme.border.hairline,
          backgroundColor: theme.colors.border,
        },
        inset && { marginLeft: theme.space.lg },
        style,
      ]}
    />
  );
}
