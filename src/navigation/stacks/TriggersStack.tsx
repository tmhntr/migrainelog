import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TriggersStackParamList } from '../types';
import { TriggerListScreen } from '../../screens/TriggerListScreen';
import { TriggerDetailScreen } from '../../screens/TriggerDetailScreen';
import { TriggerFormScreen } from '../../screens/TriggerFormScreen';
import { buildStackScreenOptions } from '../navigation-theme';
import { useTheme } from '../../theme';

const Stack = createNativeStackNavigator<TriggersStackParamList>();

export function TriggersStack(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator screenOptions={buildStackScreenOptions(theme)}>
      <Stack.Screen
        name="TriggerList"
        component={TriggerListScreen}
        options={{ title: 'Triggers' }}
      />
      <Stack.Screen
        name="TriggerDetail"
        component={TriggerDetailScreen}
        options={{ title: 'Trigger' }}
      />
      <Stack.Screen
        name="TriggerForm"
        component={TriggerFormScreen}
        options={{ title: 'New trigger' }}
      />
    </Stack.Navigator>
  );
}
