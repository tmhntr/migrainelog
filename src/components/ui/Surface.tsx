import React from 'react';
import { View, type ViewProps } from 'react-native';

import { useTheme } from '../../theme';

export interface SurfaceProps extends ViewProps {
  /** Sits above other surfaces — dialogs, sheets. */
  raised?: boolean;
  /** Applies the standard internal padding. */
  padded?: boolean;
  /** Horizontal gutter matching the screen edge. */
  inset?: boolean;
  /** Accent rail down the leading edge, used to type event cards. */
  railColor?: string;
}

/**
 * A panel. Defined by a hairline border and a lift in background value rather
 * than a drop shadow: shadows read as noise on the light ground and are
 * invisible on the dark one.
 */
export function Surface({
  raised = false,
  padded = true,
  inset = false,
  railColor,
  style,
  children,
  ...rest
}: SurfaceProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: raised ? theme.colors.surfaceRaised : theme.colors.surface,
          borderRadius: theme.radius.md,
          borderWidth: theme.border.hairline,
          borderColor: theme.colors.border,
        },
        padded && { padding: theme.space.lg },
        inset && { marginHorizontal: theme.space.lg },
        railColor !== undefined && {
          borderLeftWidth: theme.border.rail,
          borderLeftColor: railColor,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
