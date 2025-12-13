import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackService } from '@/services/feedbackService';
import type { FeedbackFormData } from '@/types/feedback';

/**
 * TanStack Query hooks for feedback management
 *
 * Provides reactive data fetching and mutations for feedback
 */

const FEEDBACK_QUERY_KEY = ['feedback'] as const;
const feedbackQueryKey = (id: string) => ['feedback', id] as const;

/**
 * Fetch all feedback for the current user
 */
export function useFeedbackQuery() {
  return useQuery({
    queryKey: FEEDBACK_QUERY_KEY,
    queryFn: () => feedbackService.getFeedback(),
  });
}

/**
 * Fetch a single feedback item by ID
 */
export function useFeedbackByIdQuery(feedbackId: string) {
  return useQuery({
    queryKey: feedbackQueryKey(feedbackId),
    queryFn: () => feedbackService.getFeedbackById(feedbackId),
    enabled: !!feedbackId,
  });
}

/**
 * Create new feedback
 */
export function useCreateFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackData: FeedbackFormData) =>
      feedbackService.createFeedback(feedbackData),
    onSuccess: (newFeedback) => {
      // Invalidate and refetch feedback list
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEY });
      // Optimistically set the new feedback in cache
      queryClient.setQueryData(feedbackQueryKey(newFeedback.id), newFeedback);
    },
  });
}

/**
 * Update existing feedback
 */
export function useUpdateFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<FeedbackFormData> }) =>
      feedbackService.updateFeedback(id, updates),
    onSuccess: (updatedFeedback, variables) => {
      // Update the specific feedback in cache
      queryClient.setQueryData(feedbackQueryKey(variables.id), updatedFeedback);
      // Invalidate feedback list to reflect changes
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEY });
    },
  });
}

/**
 * Delete feedback
 */
export function useDeleteFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackId: string) => feedbackService.deleteFeedback(feedbackId),
    onSuccess: (_, feedbackId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: feedbackQueryKey(feedbackId) });
      // Invalidate feedback list
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEY });
    },
  });
}
