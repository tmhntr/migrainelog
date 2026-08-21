import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import type { RootTabParamList } from './types';
import { DashboardStack } from './stacks/DashboardStack';
import { TriggersStack } from './stacks/TriggersStack';
import { EpisodesStack } from './stacks/EpisodesStack';
import { TreatmentsStack } from './stacks/TreatmentsStack';
import { SettingsStack } from './stacks/SettingsStack';
import { useTheme } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function TabNavigator(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.inkFaint,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: theme.border.hairline,
        },
        tabBarLabelStyle: theme.type.caption,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="insights" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TriggersTab"
        component={TriggersStack}
        options={{
          tabBarLabel: 'Triggers',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="change-history" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EpisodesTab"
        component={EpisodesStack}
        options={{
          tabBarLabel: 'Episodes',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="blur-on" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TreatmentsTab"
        component={TreatmentsStack}
        options={{
          tabBarLabel: 'Treatments',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="medication" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="tune" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
