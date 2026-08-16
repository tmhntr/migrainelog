import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '../types';
import { DashboardScreen } from '../../screens/DashboardScreen';
import { buildStackScreenOptions } from '../navigation-theme';
import { useTheme } from '../../theme';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStack(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator screenOptions={buildStackScreenOptions(theme)}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Today' }}
      />
    </Stack.Navigator>
  );
}
