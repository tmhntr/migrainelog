import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TreatmentsStackParamList } from '../types';
import { TreatmentListScreen } from '../../screens/TreatmentListScreen';
import { TreatmentDetailScreen } from '../../screens/TreatmentDetailScreen';
import { TreatmentFormScreen } from '../../screens/TreatmentFormScreen';
import { buildStackScreenOptions } from '../navigation-theme';
import { useTheme } from '../../theme';

const Stack = createNativeStackNavigator<TreatmentsStackParamList>();

export function TreatmentsStack(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator screenOptions={buildStackScreenOptions(theme)}>
      <Stack.Screen
        name="TreatmentList"
        component={TreatmentListScreen}
        options={{ title: 'Treatments' }}
      />
      <Stack.Screen
        name="TreatmentDetail"
        component={TreatmentDetailScreen}
        options={{ title: 'Treatment' }}
      />
      <Stack.Screen
        name="TreatmentForm"
        component={TreatmentFormScreen}
        options={{ title: 'New treatment' }}
      />
    </Stack.Navigator>
  );
}
