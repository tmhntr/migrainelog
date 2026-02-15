import { create } from 'zustand';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Episode, EpisodeInsert } from '../models/episode';
import {
  insertEpisode,
  listEpisodes,
  updateEpisode,
  deleteEpisode,
} from '../db/queries';
import { useRiskStore } from './risk-store';

interface EpisodeState {
  episodes: Episode[];
  loading: boolean;
  hydrate: (db: SQLiteDatabase) => Promise<void>;
  add: (db: SQLiteDatabase, data: EpisodeInsert) => Promise<Episode>;
  update: (db: SQLiteDatabase, id: string, data: Partial<EpisodeInsert>) => Promise<Episode | null>;
  remove: (db: SQLiteDatabase, id: string) => Promise<void>;
}

export const useEpisodeStore = create<EpisodeState>((set) => ({
  episodes: [],
  loading: false,

  hydrate: async (db) => {
    set({ loading: true });
    const episodes = await listEpisodes(db, { limit: 100 });
    set({ episodes, loading: false });
  },

  add: async (db, data) => {
    const episode = await insertEpisode(db, data);
    set((s) => ({ episodes: [episode, ...s.episodes] }));
    await useRiskStore.getState().recalculate(db);
    return episode;
  },

  update: async (db, id, data) => {
    const updated = await updateEpisode(db, id, data);
    if (updated) {
      set((s) => ({
        episodes: s.episodes.map((e) => (e.id === id ? updated : e)),
      }));
      await useRiskStore.getState().recalculate(db);
    }
    return updated;
  },

  remove: async (db, id) => {
    await deleteEpisode(db, id);
    set((s) => ({ episodes: s.episodes.filter((e) => e.id !== id) }));
    await useRiskStore.getState().recalculate(db);
  },
}));
