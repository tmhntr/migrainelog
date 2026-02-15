import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TriggersStackParamList } from '../types';
import { TriggerListScreen } from '../../screens/TriggerListScreen';
import { TriggerDetailScreen } from '../../screens/TriggerDetailScreen';
import { TriggerFormScreen } from '../../screens/TriggerFormScreen';

const Stack = createNativeStackNavigator<TriggersStackParamList>();

export function TriggersStack(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TriggerList"
        component={TriggerListScreen}
        options={{ title: 'Triggers' }}
      />
      <Stack.Screen
        name="TriggerDetail"
        component={TriggerDetailScreen}
        options={{ title: 'Trigger Detail' }}
      />
      <Stack.Screen
        name="TriggerForm"
        component={TriggerFormScreen}
        options={{ title: 'Trigger Form' }}
      />
    </Stack.Navigator>
  );
}
