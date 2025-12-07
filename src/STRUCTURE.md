# Migraine Log - Source Code Structure

This document outlines the organization and purpose of the source code directory structure.

## Directory Structure

```
src/
├── assets/              # Static assets (images, icons, etc.)
├── components/          # React components
│   ├── ui/             # shadcn/ui components (button, card, input, etc.)
│   ├── auth/           # Authentication-related components
│   ├── dashboard/      # Dashboard-specific components
│   ├── episodes/       # Episode-related components
│   ├── analysis/       # Analysis/reports components
│   └── layout/         # Layout components (Header, Footer, etc.)
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Library configurations and setup
├── pages/              # Page-level components (routes)
├── services/           # API/Database service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

## Directory Purposes

### `/components`
Reusable React components organized by feature area.

- **`ui/`**: Low-level UI components from shadcn/ui library
- **`auth/`**: Authentication components (login forms, signup forms, etc.)
- **`dashboard/`**: Dashboard-specific components (StatCard, charts, etc.)
- **`episodes/`**: Episode management components (EpisodeForm, EpisodeCard, etc.)
- **`analysis/`**: Analysis and reporting components (charts, graphs, etc.)
- **`layout/`**: Layout components (Header, Footer, Sidebar, Layout wrapper)

### `/contexts`
React Context providers for global state management.

- **`AuthContext.tsx`**: Authentication state and methods (user, session, signIn, signOut)

### `/hooks`
Custom React hooks for shared logic and state management.

- **`useAuth.ts`**: Hook for accessing authentication context
- **`useEpisodes.ts`**: Hook for CRUD operations on episodes

### `/lib`
Third-party library configurations and client setup.

- **`utils.ts`**: Utility functions for className merging (cn)
- **`supabase.ts`**: Supabase client initialization and configuration

### `/pages`
Page-level components that represent routes in the application.

- **`Dashboard.tsx`**: Main dashboard with statistics overview
- **`Episodes.tsx`**: Episode list view with filtering/sorting
- **`EpisodeDetail.tsx`**: Detailed view of a single episode
- **`Analysis.tsx`**: Analysis and reports page with charts
- **`Login.tsx`**: Login page for user authentication
- **`Signup.tsx`**: Registration page for new users

### `/services`
Service layer for API calls and database operations.

- **`episodeService.ts`**: CRUD operations for episodes
  - Handles data transformation between database and application
  - Provides methods: getEpisodes, getEpisode, createEpisode, updateEpisode, deleteEpisode

### `/types`
TypeScript type definitions and interfaces.

- **`database.ts`**: Supabase database schema types (auto-generated)
- **`episode.ts`**: Episode-related types (Episode, EpisodeFormData, EpisodeStats, etc.)
- **`index.ts`**: Central export for all types

### `/utils`
Utility functions and helper modules.

- **`date.ts`**: Date formatting and manipulation functions
- **`validation.ts`**: Zod schemas for form validation

## Key Files Created

### Configuration & Setup
1. **`/src/lib/supabase.ts`** - Supabase client configuration
2. **`/.env.example`** - Environment variable template

### Type Definitions
3. **`/src/types/database.ts`** - Database schema types
4. **`/src/types/episode.ts`** - Episode-related types
5. **`/src/types/index.ts`** - Type exports

### State Management
6. **`/src/contexts/AuthContext.tsx`** - Authentication context provider
7. **`/src/hooks/useAuth.ts`** - Authentication hook
8. **`/src/hooks/useEpisodes.ts`** - Episodes management hook

### Services
9. **`/src/services/episodeService.ts`** - Episode database operations

### Utilities
10. **`/src/utils/date.ts`** - Date formatting utilities
11. **`/src/utils/validation.ts`** - Form validation schemas

### Pages
12. **`/src/pages/Dashboard.tsx`** - Dashboard page
13. **`/src/pages/Episodes.tsx`** - Episodes list page
14. **`/src/pages/EpisodeDetail.tsx`** - Episode detail page
15. **`/src/pages/Analysis.tsx`** - Analysis page
16. **`/src/pages/Login.tsx`** - Login page
17. **`/src/pages/Signup.tsx`** - Signup page
18. **`/src/pages/index.ts`** - Page exports

### Components
19. **`/src/components/layout/Header.tsx`** - Header component
20. **`/src/components/layout/Layout.tsx`** - Main layout wrapper
21. **`/src/components/episodes/EpisodeForm.tsx`** - Episode form
22. **`/src/components/episodes/EpisodeCard.tsx`** - Episode card
23. **`/src/components/dashboard/StatCard.tsx`** - Stat card

## Next Steps

1. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Supabase project URL and anon key

3. **Set Up Routing**
   - Install React Router: `npm install react-router-dom`
   - Configure routes in `App.tsx`

4. **Create Database Tables**
   - Set up the `episodes` table in Supabase
   - Run migrations or use the Supabase dashboard

5. **Implement Remaining Components**
   - Complete form fields in EpisodeForm
   - Add charts/visualizations to Analysis page
   - Build dashboard statistics components

## Import Patterns

The structure supports clean import patterns:

```typescript
// Pages
import { Dashboard, Episodes, Login } from '@/pages';

// Types
import { Episode, EpisodeFormData } from '@/types';

// Hooks
import { useAuth, useEpisodes } from '@/hooks';

// Components
import { EpisodeCard } from '@/components/episodes/EpisodeCard';
import { Button } from '@/components/ui/button';

// Services
import { episodeService } from '@/services/episodeService';

// Utils
import { formatDate } from '@/utils/date';
```

## Design Principles

1. **Separation of Concerns**: Each directory has a clear, single responsibility
2. **Feature-Based Organization**: Components grouped by feature/domain
3. **Type Safety**: Comprehensive TypeScript types for all data structures
4. **Service Layer**: Database operations isolated in service classes
5. **Reusability**: Shared logic in hooks and utilities
6. **Scalability**: Structure supports growth without major refactoring
