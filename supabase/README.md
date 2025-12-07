# Supabase Migrations

This directory contains SQL migration files for the Migraine Log application's Supabase database.

## Migrations

### 001_create_episodes.sql
Creates the core `episodes` table with:
- Full schema for migraine episode tracking
- Row Level Security (RLS) policies
- Performance indexes
- Validation functions
- Statistics view

## Running Migrations

### Option 1: Using Supabase CLI (Recommended for Production)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Link your project**:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

3. **Run migrations**:
   ```bash
   supabase db push
   ```

4. **Verify migration**:
   ```bash
   supabase db remote commit
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Open the migration file: `migrations/001_create_episodes.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option 3: Using Supabase Client (For Development/Testing)

You can also run the SQL directly using a database client or the Supabase API, though this is not recommended for production.

## Verifying the Migration

After running the migration, verify that everything was created correctly:

```sql
-- Check if episodes table exists
SELECT * FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'episodes';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'episodes';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'episodes';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'episodes';

-- View the episode_stats view
SELECT * FROM episode_stats;
```

## Database Schema

### Episodes Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| user_id | UUID | Foreign key to auth.users |
| start_time | TIMESTAMPTZ | When the episode started |
| end_time | TIMESTAMPTZ | When the episode ended (nullable) |
| severity | INTEGER | Pain severity (1-10) |
| pain_location | TEXT[] | Array of pain locations |
| symptoms | TEXT[] | Array of symptoms |
| triggers | TEXT[] | Array of triggers |
| medications | JSONB | Array of medication objects |
| notes | TEXT | Additional notes (nullable) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Indexes

- `idx_episodes_user_id` - User lookup
- `idx_episodes_start_time` - Time-based queries
- `idx_episodes_severity` - Severity filtering
- `idx_episodes_user_start_time` - Composite for user timeline queries
- `idx_episodes_user_severity_time` - Complex analytics queries
- `idx_episodes_pain_location` - GIN index for array searches
- `idx_episodes_symptoms` - GIN index for array searches
- `idx_episodes_triggers` - GIN index for array searches
- `idx_episodes_medications` - GIN index for JSONB searches

### RLS Policies

All policies ensure users can only access their own data:

1. **SELECT**: Users can view their own episodes
2. **INSERT**: Users can insert their own episodes
3. **UPDATE**: Users can update their own episodes
4. **DELETE**: Users can delete their own episodes

### Helper Functions

- `validate_pain_location(TEXT[])` - Validates pain location values
- `validate_symptoms(TEXT[])` - Validates symptom values
- `validate_triggers(TEXT[])` - Validates trigger values

### Views

- `episode_stats` - Aggregated statistics per user

## Rollback

If you need to rollback this migration:

```sql
-- Drop the episodes table and all related objects
DROP VIEW IF EXISTS public.episode_stats;
DROP TABLE IF EXISTS public.episodes CASCADE;
DROP FUNCTION IF EXISTS trigger_set_timestamp() CASCADE;
DROP FUNCTION IF EXISTS validate_pain_location(TEXT[]);
DROP FUNCTION IF EXISTS validate_symptoms(TEXT[]);
DROP FUNCTION IF EXISTS validate_triggers(TEXT[]);
```

## Next Steps

After running this migration:

1. Verify the table was created: Check the Supabase dashboard
2. Test RLS policies: Try querying the table with different users
3. Update your application: Ensure your TypeScript types match (see `src/types/database.ts`)
4. Test CRUD operations: Insert, read, update, and delete test episodes
5. Check performance: Monitor query performance with the created indexes

## Environment Setup

Make sure you have your Supabase credentials in your `.env` file:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Support

For issues with migrations or database schema:
- Check Supabase logs in the dashboard
- Review the SQL migration file for syntax errors
- Verify your Supabase project permissions
- Consult the [Supabase Documentation](https://supabase.com/docs)
