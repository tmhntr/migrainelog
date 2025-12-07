-- Migration: Create Episodes Table for Migraine Log Application
-- Description: Creates the episodes table with proper indexes, RLS policies, and triggers
-- Created: 2025-12-07

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
-- This function automatically updates the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create episodes table
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  pain_location TEXT[] NOT NULL DEFAULT '{}',
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  triggers TEXT[] NOT NULL DEFAULT '{}',
  medications JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time IS NULL OR end_time >= start_time),
  CONSTRAINT valid_severity CHECK (severity >= 1 AND severity <= 10)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_episodes_user_id ON public.episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_episodes_start_time ON public.episodes(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_severity ON public.episodes(severity);
CREATE INDEX IF NOT EXISTS idx_episodes_user_start_time ON public.episodes(user_id, start_time DESC);

-- Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_episodes_user_severity_time ON public.episodes(user_id, severity, start_time DESC);

-- Add GIN indexes for array columns to support array operations
CREATE INDEX IF NOT EXISTS idx_episodes_pain_location ON public.episodes USING GIN(pain_location);
CREATE INDEX IF NOT EXISTS idx_episodes_symptoms ON public.episodes USING GIN(symptoms);
CREATE INDEX IF NOT EXISTS idx_episodes_triggers ON public.episodes USING GIN(triggers);

-- Add GIN index for JSONB medications column
CREATE INDEX IF NOT EXISTS idx_episodes_medications ON public.episodes USING GIN(medications);

-- Create trigger for updated_at
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view their own episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can insert their own episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can update their own episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can delete their own episodes" ON public.episodes;

-- RLS Policy: Users can view their own episodes
CREATE POLICY "Users can view their own episodes"
  ON public.episodes
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own episodes
CREATE POLICY "Users can insert their own episodes"
  ON public.episodes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own episodes
CREATE POLICY "Users can update their own episodes"
  ON public.episodes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own episodes
CREATE POLICY "Users can delete their own episodes"
  ON public.episodes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a helpful function to validate pain locations
CREATE OR REPLACE FUNCTION validate_pain_location(locations TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
  valid_locations TEXT[] := ARRAY[
    'forehead', 'temples', 'back_of_head', 'top_of_head',
    'left_side', 'right_side', 'eyes', 'jaw', 'neck'
  ];
  location TEXT;
BEGIN
  FOREACH location IN ARRAY locations
  LOOP
    IF NOT (location = ANY(valid_locations)) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a helpful function to validate symptoms
CREATE OR REPLACE FUNCTION validate_symptoms(symptom_list TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
  valid_symptoms TEXT[] := ARRAY[
    'nausea', 'vomiting', 'light_sensitivity', 'sound_sensitivity',
    'smell_sensitivity', 'visual_disturbances', 'aura', 'dizziness',
    'fatigue', 'confusion', 'irritability'
  ];
  symptom TEXT;
BEGIN
  FOREACH symptom IN ARRAY symptom_list
  LOOP
    IF NOT (symptom = ANY(valid_symptoms)) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a helpful function to validate triggers
CREATE OR REPLACE FUNCTION validate_triggers(trigger_list TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
  valid_triggers TEXT[] := ARRAY[
    'stress', 'lack_of_sleep', 'weather_change', 'bright_lights',
    'loud_noises', 'strong_smells', 'alcohol', 'caffeine',
    'dehydration', 'skipped_meal', 'hormonal_changes', 'exercise',
    'screen_time'
  ];
  trigger_item TEXT;
BEGIN
  FOREACH trigger_item IN ARRAY trigger_list
  LOOP
    IF NOT (trigger_item = ANY(valid_triggers)) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add validation constraints (optional - uncomment if you want strict validation)
-- ALTER TABLE public.episodes ADD CONSTRAINT valid_pain_locations
--   CHECK (validate_pain_location(pain_location));
-- ALTER TABLE public.episodes ADD CONSTRAINT valid_symptoms_list
--   CHECK (validate_symptoms(symptoms));
-- ALTER TABLE public.episodes ADD CONSTRAINT valid_triggers_list
--   CHECK (validate_triggers(triggers));

-- Create a view for episode statistics (useful for analytics)
CREATE OR REPLACE VIEW public.episode_stats AS
SELECT
  user_id,
  COUNT(*) as total_episodes,
  ROUND(AVG(severity)::numeric, 2) as average_severity,
  ROUND(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600)::numeric, 2) as average_duration_hours,
  MIN(start_time) as first_episode,
  MAX(start_time) as latest_episode
FROM public.episodes
WHERE end_time IS NOT NULL
GROUP BY user_id;

-- Enable RLS on the view
ALTER VIEW public.episode_stats SET (security_invoker = true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.episodes TO authenticated;
GRANT SELECT ON public.episode_stats TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add helpful comments for documentation
COMMENT ON TABLE public.episodes IS 'Stores migraine episode data for users';
COMMENT ON COLUMN public.episodes.id IS 'Unique identifier for the episode';
COMMENT ON COLUMN public.episodes.user_id IS 'Reference to the user who owns this episode';
COMMENT ON COLUMN public.episodes.start_time IS 'When the migraine episode started';
COMMENT ON COLUMN public.episodes.end_time IS 'When the migraine episode ended (null if ongoing)';
COMMENT ON COLUMN public.episodes.severity IS 'Pain severity on a scale of 1-10';
COMMENT ON COLUMN public.episodes.pain_location IS 'Array of pain locations (e.g., forehead, temples)';
COMMENT ON COLUMN public.episodes.symptoms IS 'Array of symptoms experienced';
COMMENT ON COLUMN public.episodes.triggers IS 'Array of potential triggers identified';
COMMENT ON COLUMN public.episodes.medications IS 'JSONB array of medications taken with details';
COMMENT ON COLUMN public.episodes.notes IS 'Additional notes about the episode';
COMMENT ON COLUMN public.episodes.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.episodes.updated_at IS 'Timestamp when the record was last updated';
