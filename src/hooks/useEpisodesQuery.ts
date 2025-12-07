import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { episodeService } from '@/services/episodeService';
import type { Episode } from '@/types/episode';

/**
 * TanStack Query hooks for episode management
 *
 * Provides reactive data fetching and mutations for episodes
 */

const EPISODES_QUERY_KEY = ['episodes'] as const;
const episodeQueryKey = (id: string) => ['episodes', id] as const;

/**
 * Fetch all episodes for the current user
 */
export function useEpisodesQuery() {
  return useQuery({
    queryKey: EPISODES_QUERY_KEY,
    queryFn: () => episodeService.getEpisodes(),
  });
}

/**
 * Fetch a single episode by ID
 */
export function useEpisodeQuery(episodeId: string) {
  return useQuery({
    queryKey: episodeQueryKey(episodeId),
    queryFn: () => episodeService.getEpisode(episodeId),
    enabled: !!episodeId,
  });
}

/**
 * Create a new episode
 */
export function useCreateEpisodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (episode: Omit<Episode, 'id' | 'user_id' | 'created_at' | 'updated_at'>) =>
      episodeService.createEpisode(episode),
    onSuccess: (newEpisode) => {
      // Invalidate and refetch episodes list
      queryClient.invalidateQueries({ queryKey: EPISODES_QUERY_KEY });
      // Optimistically set the new episode in cache
      queryClient.setQueryData(episodeQueryKey(newEpisode.id), newEpisode);
    },
  });
}

/**
 * Update an existing episode
 */
export function useUpdateEpisodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Episode> }) =>
      episodeService.updateEpisode(id, updates),
    onSuccess: (updatedEpisode, variables) => {
      // Update the specific episode in cache
      queryClient.setQueryData(episodeQueryKey(variables.id), updatedEpisode);
      // Invalidate episodes list to reflect changes
      queryClient.invalidateQueries({ queryKey: EPISODES_QUERY_KEY });
    },
  });
}

/**
 * Delete an episode
 */
export function useDeleteEpisodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (episodeId: string) => episodeService.deleteEpisode(episodeId),
    onSuccess: (_, episodeId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: episodeQueryKey(episodeId) });
      // Invalidate episodes list
      queryClient.invalidateQueries({ queryKey: EPISODES_QUERY_KEY });
    },
  });
}
