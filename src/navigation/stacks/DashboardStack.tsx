import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '../types';
import { DashboardScreen } from '../../screens/DashboardScreen';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStack(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
}
