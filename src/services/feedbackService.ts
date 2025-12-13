import { supabase } from '@/lib/supabase';
import type { Feedback, FeedbackFormData } from '@/types/feedback';
import type { Database } from '@/types/database';

/**
 * Feedback Service
 *
 * Service layer for feedback-related database operations
 */
class FeedbackService {
  async getFeedback(): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  }

  async createFeedback(feedbackData: FeedbackFormData): Promise<Feedback> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const insertData: Database['public']['Tables']['feedback']['Insert'] = {
      user_id: user.id,
      type: feedbackData.type,
      title: feedbackData.title,
      description: feedbackData.description,
    };

    const { data, error } = await supabase
      .from('feedback')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateFeedback(id: string, updates: Partial<FeedbackFormData>): Promise<Feedback> {
    const updateData: Database['public']['Tables']['feedback']['Update'] = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteFeedback(id: string): Promise<void> {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const feedbackService = new FeedbackService();
