import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Treatment, TreatmentInsert } from '../models/treatment';
import {
  insertTreatment,
  listTreatments,
  updateTreatment,
  deleteTreatment,
} from '../db/queries';

interface TreatmentState {
  treatments: Treatment[];
  loading: boolean;
  hydrate: (db: SQLiteDatabase) => Promise<void>;
  add: (db: SQLiteDatabase, data: TreatmentInsert) => Promise<Treatment>;
  update: (db: SQLiteDatabase, id: string, data: Partial<TreatmentInsert>) => Promise<Treatment | null>;
  remove: (db: SQLiteDatabase, id: string) => Promise<void>;
}

export const useTreatmentStore = create<TreatmentState>((set) => ({
  treatments: [],
  loading: false,

  hydrate: async (db) => {
    set({ loading: true });
    const treatments = await listTreatments(db, { limit: 100 });
    set({ treatments, loading: false });
  },

  add: async (db, data) => {
    const treatment = await insertTreatment(db, data);
    set((s) => ({ treatments: [treatment, ...s.treatments] }));
    return treatment;
  },

  update: async (db, id, data) => {
    const updated = await updateTreatment(db, id, data);
    if (updated) {
      set((s) => ({
        treatments: s.treatments.map((t) => (t.id === id ? updated : t)),
      }));
    }
    return updated;
  },

  remove: async (db, id) => {
    await deleteTreatment(db, id);
    set((s) => ({ treatments: s.treatments.filter((t) => t.id !== id) }));
  },
}));
