import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { EpisodesStackParamList } from '../types';
import { EpisodeListScreen } from '../../screens/EpisodeListScreen';
import { EpisodeDetailScreen } from '../../screens/EpisodeDetailScreen';
import { EpisodeFormScreen } from '../../screens/EpisodeFormScreen';
import { buildStackScreenOptions } from '../navigation-theme';
import { useTheme } from '../../theme';

const Stack = createNativeStackNavigator<EpisodesStackParamList>();

export function EpisodesStack(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator screenOptions={buildStackScreenOptions(theme)}>
      <Stack.Screen
        name="EpisodeList"
        component={EpisodeListScreen}
        options={{ title: 'Episodes' }}
      />
      <Stack.Screen
        name="EpisodeDetail"
        component={EpisodeDetailScreen}
        options={{ title: 'Episode' }}
      />
      <Stack.Screen
        name="EpisodeForm"
        component={EpisodeFormScreen}
        options={{ title: 'New episode' }}
      />
    </Stack.Navigator>
  );
}
