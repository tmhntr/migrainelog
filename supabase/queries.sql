-- Common SQL Queries for Migraine Log Application
-- Use these queries for testing, debugging, and data analysis

-- ============================================
-- TESTING & VERIFICATION QUERIES
-- ============================================

-- Verify episodes table exists and check structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'episodes'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'episodes';

-- View all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'episodes';

-- Check all indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'episodes'
ORDER BY indexname;

-- ============================================
-- SAMPLE DATA QUERIES
-- ============================================

-- Insert a sample episode (replace user_id with actual auth.uid())
INSERT INTO episodes (
  user_id,
  start_time,
  end_time,
  severity,
  pain_location,
  symptoms,
  triggers,
  medications,
  notes
) VALUES (
  auth.uid(), -- Current authenticated user
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '30 minutes',
  7,
  ARRAY['temples', 'forehead'],
  ARRAY['nausea', 'light_sensitivity', 'visual_disturbances'],
  ARRAY['stress', 'lack_of_sleep'],
  '[{"name": "Ibuprofen", "dosage": "400mg", "time_taken": "2025-12-07T12:00:00Z", "effectiveness": 3}]'::jsonb,
  'Started after stressful meeting, felt better after medication'
);

-- ============================================
-- BASIC CRUD QUERIES
-- ============================================

-- Get all episodes for current user (most recent first)
SELECT * FROM episodes
WHERE user_id = auth.uid()
ORDER BY start_time DESC;

-- Get episodes from last 30 days
SELECT * FROM episodes
WHERE user_id = auth.uid()
  AND start_time >= NOW() - INTERVAL '30 days'
ORDER BY start_time DESC;

-- Get severe episodes (severity >= 7)
SELECT * FROM episodes
WHERE user_id = auth.uid()
  AND severity >= 7
ORDER BY start_time DESC;

-- Get ongoing episodes (no end_time)
SELECT * FROM episodes
WHERE user_id = auth.uid()
  AND end_time IS NULL
ORDER BY start_time DESC;

-- Update an episode
UPDATE episodes
SET
  end_time = NOW(),
  severity = 6,
  notes = 'Updated notes'
WHERE id = 'episode-id-here'
  AND user_id = auth.uid();

-- Delete an episode
DELETE FROM episodes
WHERE id = 'episode-id-here'
  AND user_id = auth.uid();

-- ============================================
-- ANALYTICS QUERIES
-- ============================================

-- Get episode statistics for current user
SELECT * FROM episode_stats
WHERE user_id = auth.uid();

-- Count episodes by month
SELECT
  DATE_TRUNC('month', start_time) as month,
  COUNT(*) as episode_count,
  ROUND(AVG(severity), 2) as avg_severity
FROM episodes
WHERE user_id = auth.uid()
  AND start_time >= NOW() - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', start_time)
ORDER BY month DESC;

-- Most common triggers
SELECT
  trigger_item,
  COUNT(*) as frequency
FROM episodes,
  UNNEST(triggers) as trigger_item
WHERE user_id = auth.uid()
GROUP BY trigger_item
ORDER BY frequency DESC
LIMIT 10;

-- Most common symptoms
SELECT
  symptom,
  COUNT(*) as frequency
FROM episodes,
  UNNEST(symptoms) as symptom
WHERE user_id = auth.uid()
GROUP BY symptom
ORDER BY frequency DESC
LIMIT 10;

-- Most common pain locations
SELECT
  location,
  COUNT(*) as frequency
FROM episodes,
  UNNEST(pain_location) as location
WHERE user_id = auth.uid()
GROUP BY location
ORDER BY frequency DESC;

-- Average episode duration by severity
SELECT
  severity,
  COUNT(*) as episode_count,
  ROUND(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600)::numeric, 2) as avg_duration_hours
FROM episodes
WHERE user_id = auth.uid()
  AND end_time IS NOT NULL
GROUP BY severity
ORDER BY severity;

-- Episodes by day of week
SELECT
  TO_CHAR(start_time, 'Day') as day_of_week,
  EXTRACT(DOW FROM start_time) as day_number,
  COUNT(*) as episode_count
FROM episodes
WHERE user_id = auth.uid()
GROUP BY day_of_week, day_number
ORDER BY day_number;

-- Episodes by hour of day
SELECT
  EXTRACT(HOUR FROM start_time) as hour,
  COUNT(*) as episode_count
FROM episodes
WHERE user_id = auth.uid()
GROUP BY hour
ORDER BY hour;

-- Medication effectiveness analysis
SELECT
  med->>'name' as medication_name,
  COUNT(*) as times_taken,
  ROUND(AVG((med->>'effectiveness')::numeric), 2) as avg_effectiveness
FROM episodes,
  jsonb_array_elements(medications) as med
WHERE user_id = auth.uid()
  AND med->>'effectiveness' IS NOT NULL
GROUP BY med->>'name'
ORDER BY avg_effectiveness DESC;

-- ============================================
-- SEARCH QUERIES
-- ============================================

-- Search episodes by trigger
SELECT * FROM episodes
WHERE user_id = auth.uid()
  AND 'stress' = ANY(triggers)
ORDER BY start_time DESC;

-- Search episodes by symptom
SELECT * FROM episodes
WHERE user_id = auth.uid()
  AND 'nausea' = ANY(symptoms)
ORDER BY start_time DESC;

-- Search episodes by pain location
SELECT * FROM episodes
WHERE user_id = auth.uid()
  AND 'temples' = ANY(pain_location)
ORDER BY start_time DESC;

-- Search episodes by notes (full-text search)
SELECT * FROM episodes
WHERE user_id = auth.uid()
  AND notes ILIKE '%meeting%'
ORDER BY start_time DESC;

-- ============================================
-- DATE RANGE QUERIES
-- ============================================

-- Episodes in specific date range
SELECT * FROM episodes
WHERE user_id = auth.uid()
  AND start_time >= '2025-01-01'
  AND start_time < '2025-02-01'
ORDER BY start_time DESC;

-- This week's episodes
SELECT * FROM episodes
WHERE user_id = auth.uid()
  AND start_time >= DATE_TRUNC('week', NOW())
ORDER BY start_time DESC;

-- This month's episodes
SELECT * FROM episodes
WHERE user_id = auth.uid()
  AND start_time >= DATE_TRUNC('month', NOW())
ORDER BY start_time DESC;

-- ============================================
-- ADVANCED ANALYTICS
-- ============================================

-- Find patterns: triggers that correlate with high severity
SELECT
  trigger_item,
  COUNT(*) as occurrences,
  ROUND(AVG(severity), 2) as avg_severity,
  MAX(severity) as max_severity
FROM episodes,
  UNNEST(triggers) as trigger_item
WHERE user_id = auth.uid()
GROUP BY trigger_item
HAVING COUNT(*) >= 3
ORDER BY avg_severity DESC;

-- Monthly trend: Are episodes getting better or worse?
SELECT
  DATE_TRUNC('month', start_time) as month,
  COUNT(*) as episode_count,
  ROUND(AVG(severity), 2) as avg_severity,
  ROUND(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600)::numeric, 2) as avg_duration_hours
FROM episodes
WHERE user_id = auth.uid()
  AND start_time >= NOW() - INTERVAL '6 months'
  AND end_time IS NOT NULL
GROUP BY DATE_TRUNC('month', start_time)
ORDER BY month;

-- Compare weekday vs weekend episodes
SELECT
  CASE
    WHEN EXTRACT(DOW FROM start_time) IN (0, 6) THEN 'Weekend'
    ELSE 'Weekday'
  END as day_type,
  COUNT(*) as episode_count,
  ROUND(AVG(severity), 2) as avg_severity
FROM episodes
WHERE user_id = auth.uid()
GROUP BY day_type;
