/**
 * Feedback Domain Types
 *
 * Domain-specific types for feedback feature.
 * Separate from database types for better type safety and flexibility.
 */

import type { Tables, TablesInsert, TablesUpdate } from './database';

export type Feedback = Tables<'feedback'>;
export type FeedbackInsert = TablesInsert<'feedback'>;
export type FeedbackUpdate = TablesUpdate<'feedback'>;

export type FeedbackType = 'feedback' | 'feature_request';
export type FeedbackStatus = 'new' | 'reviewed' | 'planned' | 'implemented' | 'wont_fix';

export interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  description: string;
}
