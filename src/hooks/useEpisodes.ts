import { useState, useEffect } from 'react';
import type { Episode } from '@/types/episode';
import { episodeService } from '@/services/episodeService';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing episodes
 *
 * Provides CRUD operations and real-time updates for episodes
 */
export const useEpisodes = () => {
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setEpisodes([]);
      setLoading(false);
      return;
    }

    fetchEpisodes();
  }, [user]);

  const fetchEpisodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await episodeService.getEpisodes();
      setEpisodes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch episodes'));
    } finally {
      setLoading(false);
    }
  };

  const createEpisode = async (episode: Omit<Episode, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEpisode = await episodeService.createEpisode(episode);
      setEpisodes((prev) => [newEpisode, ...prev]);
      return newEpisode;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create episode'));
      throw err;
    }
  };

  const updateEpisode = async (id: string, updates: Partial<Episode>) => {
    try {
      const updatedEpisode = await episodeService.updateEpisode(id, updates);
      setEpisodes((prev) =>
        prev.map((episode) => (episode.id === id ? updatedEpisode : episode))
      );
      return updatedEpisode;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update episode'));
      throw err;
    }
  };

  const deleteEpisode = async (id: string) => {
    try {
      await episodeService.deleteEpisode(id);
      setEpisodes((prev) => prev.filter((episode) => episode.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete episode'));
      throw err;
    }
  };

  return {
    episodes,
    loading,
    error,
    createEpisode,
    updateEpisode,
    deleteEpisode,
    refetch: fetchEpisodes,
  };
};
