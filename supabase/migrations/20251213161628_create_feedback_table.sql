-- Migration: Create Feedback Table
-- Description: Creates the feedback table for user feedback and feature requests

-- Create feedback type enum
CREATE TYPE feedback_type AS ENUM ('feedback', 'feature_request');

-- Create feedback status enum
CREATE TYPE feedback_status AS ENUM ('new', 'reviewed', 'planned', 'implemented', 'wont_fix');

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type feedback_type NOT NULL DEFAULT 'feedback',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status feedback_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  CONSTRAINT valid_description_length CHECK (char_length(description) >= 10 AND char_length(description) <= 5000)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_created ON public.feedback(user_id, created_at DESC);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.feedback
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- RLS Policy: Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- RLS Policy: Users can update their own feedback (only if status is 'new')
CREATE POLICY "Users can update their own feedback"
  ON public.feedback
  FOR UPDATE
  USING ((select auth.uid()) = user_id AND status = 'new')
  WITH CHECK ((select auth.uid()) = user_id AND status = 'new');

-- RLS Policy: Users can delete their own feedback (only if status is 'new')
CREATE POLICY "Users can delete their own feedback"
  ON public.feedback
  FOR DELETE
  USING ((select auth.uid()) = user_id AND status = 'new');

-- Add helpful comments
COMMENT ON TABLE public.feedback IS 'Stores user feedback and feature requests';
COMMENT ON COLUMN public.feedback.id IS 'Unique identifier for the feedback';
COMMENT ON COLUMN public.feedback.user_id IS 'Reference to the user who submitted the feedback';
COMMENT ON COLUMN public.feedback.type IS 'Type of submission: feedback or feature_request';
COMMENT ON COLUMN public.feedback.title IS 'Brief title/summary of the feedback';
COMMENT ON COLUMN public.feedback.description IS 'Detailed description of the feedback or feature request';
COMMENT ON COLUMN public.feedback.status IS 'Current status of the feedback';
COMMENT ON COLUMN public.feedback.created_at IS 'Timestamp when the feedback was created';
COMMENT ON COLUMN public.feedback.updated_at IS 'Timestamp when the feedback was last updated';
