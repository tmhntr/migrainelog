import { requireNativeModule, Platform } from 'expo-modules-core';

export interface WidgetData {
  riskScore: number;
  riskLabel: string;
  triggerCount24h: number;
  episodeCount7d: number;
  lastUpdated: string;
}

const WidgetBridge =
  Platform.OS === 'ios' ? requireNativeModule('WidgetBridge') : null;

export function setWidgetData(data: WidgetData): void {
  if (WidgetBridge) {
    WidgetBridge.setWidgetData(data);
  }
}
