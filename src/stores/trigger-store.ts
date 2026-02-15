import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Trigger, TriggerInsert } from '../models/trigger';
import {
  insertTrigger,
  listTriggers,
  updateTrigger,
  deleteTrigger,
} from '../db/queries';
import { useRiskStore } from './risk-store';

interface TriggerState {
  triggers: Trigger[];
  loading: boolean;
  hydrate: (db: SQLiteDatabase) => Promise<void>;
  add: (db: SQLiteDatabase, data: TriggerInsert) => Promise<Trigger>;
  update: (db: SQLiteDatabase, id: string, data: Partial<TriggerInsert>) => Promise<Trigger | null>;
  remove: (db: SQLiteDatabase, id: string) => Promise<void>;
}

export const useTriggerStore = create<TriggerState>((set) => ({
  triggers: [],
  loading: false,

  hydrate: async (db) => {
    set({ loading: true });
    const triggers = await listTriggers(db, { limit: 100 });
    set({ triggers, loading: false });
  },

  add: async (db, data) => {
    const trigger = await insertTrigger(db, data);
    set((s) => ({ triggers: [trigger, ...s.triggers] }));
    await useRiskStore.getState().recalculate(db);
    return trigger;
  },

  update: async (db, id, data) => {
    const updated = await updateTrigger(db, id, data);
    if (updated) {
      set((s) => ({
        triggers: s.triggers.map((t) => (t.id === id ? updated : t)),
      }));
      await useRiskStore.getState().recalculate(db);
    }
    return updated;
  },

  remove: async (db, id) => {
    await deleteTrigger(db, id);
    set((s) => ({ triggers: s.triggers.filter((t) => t.id !== id) }));
    await useRiskStore.getState().recalculate(db);
  },
}));
