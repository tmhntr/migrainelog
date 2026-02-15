import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// --- Param Lists ---

export type RootTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  TriggersTab: NavigatorScreenParams<TriggersStackParamList>;
  EpisodesTab: NavigatorScreenParams<EpisodesStackParamList>;
  TreatmentsTab: NavigatorScreenParams<TreatmentsStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
};

export type TriggersStackParamList = {
  TriggerList: undefined;
  TriggerDetail: { id: string };
  TriggerForm: { id?: string };
};

export type EpisodesStackParamList = {
  EpisodeList: undefined;
  EpisodeDetail: { id: string };
  EpisodeForm: { id?: string };
};

export type TreatmentsStackParamList = {
  TreatmentList: undefined;
  TreatmentDetail: { id: string };
  TreatmentForm: { id?: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
};

// --- Screen Props ---

// Dashboard
export type DashboardScreenProps = NativeStackScreenProps<
  DashboardStackParamList,
  'Dashboard'
>;

// Triggers
export type TriggerListScreenProps = NativeStackScreenProps<
  TriggersStackParamList,
  'TriggerList'
>;
export type TriggerDetailScreenProps = NativeStackScreenProps<
  TriggersStackParamList,
  'TriggerDetail'
>;
export type TriggerFormScreenProps = NativeStackScreenProps<
  TriggersStackParamList,
  'TriggerForm'
>;

// Episodes
export type EpisodeListScreenProps = NativeStackScreenProps<
  EpisodesStackParamList,
  'EpisodeList'
>;
export type EpisodeDetailScreenProps = NativeStackScreenProps<
  EpisodesStackParamList,
  'EpisodeDetail'
>;
export type EpisodeFormScreenProps = NativeStackScreenProps<
  EpisodesStackParamList,
  'EpisodeForm'
>;

// Treatments
export type TreatmentListScreenProps = NativeStackScreenProps<
  TreatmentsStackParamList,
  'TreatmentList'
>;
export type TreatmentDetailScreenProps = NativeStackScreenProps<
  TreatmentsStackParamList,
  'TreatmentDetail'
>;
export type TreatmentFormScreenProps = NativeStackScreenProps<
  TreatmentsStackParamList,
  'TreatmentForm'
>;

// Settings
export type SettingsScreenProps = NativeStackScreenProps<
  SettingsStackParamList,
  'Settings'
>;
