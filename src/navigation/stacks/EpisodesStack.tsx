import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { EpisodesStackParamList } from '../types';
import { EpisodeListScreen } from '../../screens/EpisodeListScreen';
import { EpisodeDetailScreen } from '../../screens/EpisodeDetailScreen';
import { EpisodeFormScreen } from '../../screens/EpisodeFormScreen';

const Stack = createNativeStackNavigator<EpisodesStackParamList>();

export function EpisodesStack(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EpisodeList"
        component={EpisodeListScreen}
        options={{ title: 'Episodes' }}
      />
      <Stack.Screen
        name="EpisodeDetail"
        component={EpisodeDetailScreen}
        options={{ title: 'Episode Detail' }}
      />
      <Stack.Screen
        name="EpisodeForm"
        component={EpisodeFormScreen}
        options={{ title: 'Episode Form' }}
      />
    </Stack.Navigator>
  );
}
