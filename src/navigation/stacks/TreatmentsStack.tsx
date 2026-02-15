import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TreatmentsStackParamList } from '../types';
import { TreatmentListScreen } from '../../screens/TreatmentListScreen';
import { TreatmentDetailScreen } from '../../screens/TreatmentDetailScreen';
import { TreatmentFormScreen } from '../../screens/TreatmentFormScreen';

const Stack = createNativeStackNavigator<TreatmentsStackParamList>();

export function TreatmentsStack(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TreatmentList"
        component={TreatmentListScreen}
        options={{ title: 'Treatments' }}
      />
      <Stack.Screen
        name="TreatmentDetail"
        component={TreatmentDetailScreen}
        options={{ title: 'Treatment Detail' }}
      />
      <Stack.Screen
        name="TreatmentForm"
        component={TreatmentFormScreen}
        options={{ title: 'Treatment Form' }}
      />
    </Stack.Navigator>
  );
}
