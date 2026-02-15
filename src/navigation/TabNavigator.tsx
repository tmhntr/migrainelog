import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import type { RootTabParamList } from './types';
import { DashboardStack } from './stacks/DashboardStack';
import { TriggersStack } from './stacks/TriggersStack';
import { EpisodesStack } from './stacks/EpisodesStack';
import { TreatmentsStack } from './stacks/TreatmentsStack';
import { SettingsStack } from './stacks/SettingsStack';

const Tab = createBottomTabNavigator<RootTabParamList>();

const ACTIVE_COLOR = '#6200EE';
const INACTIVE_COLOR = '#757575';

export function TabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TriggersTab"
        component={TriggersStack}
        options={{
          tabBarLabel: 'Triggers',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="warning" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EpisodesTab"
        component={EpisodesStack}
        options={{
          tabBarLabel: 'Episodes',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="flash-on" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TreatmentsTab"
        component={TreatmentsStack}
        options={{
          tabBarLabel: 'Treatments',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="healing" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
