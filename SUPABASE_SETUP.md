# Supabase Database Setup Guide

This guide will help you set up the Supabase database for the Migraine Log application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Supabase CLI installed (optional but recommended)
- Your Supabase project credentials

## Quick Start

### Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - Project name: "Migraine Log" (or your preferred name)
   - Database password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create new project"

### Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Project API key** (`anon` / `public` key)
3. Add these to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Run the Database Migration

Choose one of the following methods:

#### Option A: Using Supabase Dashboard (Easiest)

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `/Users/timhunter/Developer/migrainelog/supabase/migrations/001_create_episodes.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** or press `Ctrl/Cmd + Enter`
6. You should see "Success. No rows returned" message

#### Option B: Using Supabase CLI (Recommended for Production)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project-ref from dashboard URL)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push

# Verify the migration
supabase db remote commit
```

### Step 4: Verify the Setup

Run the following SQL in the SQL Editor to verify everything was created:

```sql
-- Check if episodes table exists
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'episodes';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'episodes';
```

You should see:
- The `episodes` table listed
- 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)
- Multiple indexes (at least 8)

### Step 5: Enable Authentication

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Enable your preferred authentication methods:
   - **Email** (recommended for development)
   - **Google** (optional)
   - **GitHub** (optional)
   - Other providers as needed

For email authentication:
- Enable "Email" provider
- Configure email templates if needed
- Enable "Confirm email" if you want email verification

### Step 6: Test the Database

You can test the database setup by running a simple query:

```sql
-- This should return an empty result (no episodes yet)
SELECT * FROM episodes;

-- Try to insert a test episode (will fail if not authenticated)
-- You need to be logged in for this to work due to RLS policies
```

## Database Schema Overview

### Episodes Table

The main table for storing migraine episodes with the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | User who owns this episode |
| `start_time` | TIMESTAMPTZ | When the episode started |
| `end_time` | TIMESTAMPTZ | When it ended (nullable) |
| `severity` | INTEGER | Pain level (1-10) |
| `pain_location` | TEXT[] | Where it hurts |
| `symptoms` | TEXT[] | Associated symptoms |
| `triggers` | TEXT[] | Potential triggers |
| `medications` | JSONB | Medications taken |
| `notes` | TEXT | Additional notes |
| `created_at` | TIMESTAMPTZ | Record creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |

### Security (RLS Policies)

Row Level Security ensures users can only access their own data:

- **SELECT**: Users can view only their episodes
- **INSERT**: Users can create episodes for themselves
- **UPDATE**: Users can modify only their episodes
- **DELETE**: Users can delete only their episodes

### Performance Features

The migration includes several optimizations:

- **Indexes** on user_id, start_time, and severity for fast queries
- **GIN indexes** on array and JSONB columns for efficient searching
- **Composite indexes** for common query patterns
- **Auto-updating timestamps** via triggers

## Using the Database in Your App

### Import the Types

```typescript
import type { Database, Episode, EpisodeInsert } from '@/types/database';
import { createEpisodeInsert, parseMedications } from '@/lib/database-helpers';
```

### Initialize Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Example: Insert an Episode

```typescript
import { createEpisodeInsert } from '@/lib/database-helpers';

const { data, error } = await supabase
  .from('episodes')
  .insert(createEpisodeInsert(userId, {
    startTime: new Date(),
    severity: 7,
    painLocation: ['temples', 'forehead'],
    symptoms: ['nausea', 'light_sensitivity'],
    triggers: ['stress'],
    medications: [
      {
        name: 'Ibuprofen',
        dosage: '400mg',
        time_taken: new Date().toISOString(),
        effectiveness: 3,
      },
    ],
    notes: 'Started after work',
  }))
  .select()
  .single();
```

### Example: Query Episodes

```typescript
// Get all episodes for current user
const { data: episodes, error } = await supabase
  .from('episodes')
  .select('*')
  .order('start_time', { ascending: false });

// Get episodes from last 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const { data: recentEpisodes } = await supabase
  .from('episodes')
  .select('*')
  .gte('start_time', thirtyDaysAgo.toISOString())
  .order('start_time', { ascending: false });
```

### Example: Update an Episode

```typescript
import { createEpisodeUpdate } from '@/lib/database-helpers';

const { data, error } = await supabase
  .from('episodes')
  .update(createEpisodeUpdate({
    endTime: new Date(),
    severity: 6,
    notes: 'Feeling better after rest',
  }))
  .eq('id', episodeId)
  .select()
  .single();
```

### Example: Get Statistics

```typescript
// Query the episode_stats view
const { data: stats } = await supabase
  .from('episode_stats')
  .select('*')
  .single();

console.log('Total episodes:', stats?.total_episodes);
console.log('Average severity:', stats?.average_severity);
console.log('Average duration:', stats?.average_duration_hours, 'hours');
```

## Helpful SQL Queries

See `/Users/timhunter/Developer/migrainelog/supabase/queries.sql` for a comprehensive list of useful queries including:

- Episode analytics
- Trigger and symptom frequency analysis
- Time-based patterns
- Medication effectiveness tracking
- And more!

## Troubleshooting

### Migration Fails

- **Error: "relation already exists"**: The table already exists. You can either drop it first or skip this error.
- **Error: "permission denied"**: Make sure you're running the migration as the database owner or have proper permissions.

### RLS Policies Not Working

- Make sure you're authenticated when querying the database
- Check that `auth.uid()` returns a valid user ID
- Verify RLS is enabled: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'episodes';`

### Queries Return Empty Results

- Make sure you're logged in with authentication
- Check that the `user_id` in your episodes matches the authenticated user
- Verify RLS policies with: `SELECT * FROM pg_policies WHERE tablename = 'episodes';`

### Slow Queries

- Check if indexes are being used: `EXPLAIN ANALYZE your-query`
- Review the query plan in the SQL Editor
- Consider adding additional indexes for your specific use case

## Next Steps

1. Set up authentication in your application
2. Create UI components for episode entry
3. Implement the episode list and detail views
4. Add analytics and visualization features
5. Test with real data

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Array Functions](https://www.postgresql.org/docs/current/functions-array.html)
- [PostgreSQL JSONB Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter issues:

1. Check the [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Review the [Supabase Discord](https://discord.supabase.com)
3. Check the database logs in your Supabase dashboard
4. Review the migration file for any syntax errors

## Migration Files

- **Main Migration**: `/Users/timhunter/Developer/migrainelog/supabase/migrations/001_create_episodes.sql`
- **Common Queries**: `/Users/timhunter/Developer/migrainelog/supabase/queries.sql`
- **Detailed README**: `/Users/timhunter/Developer/migrainelog/supabase/README.md`
- **TypeScript Types**: `/Users/timhunter/Developer/migrainelog/src/types/database.ts`
- **Helper Functions**: `/Users/timhunter/Developer/migrainelog/src/lib/database-helpers.ts`
