import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../types';
import { SettingsScreen } from '../../screens/SettingsScreen';
import { buildStackScreenOptions } from '../navigation-theme';
import { useTheme } from '../../theme';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator screenOptions={buildStackScreenOptions(theme)}>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
