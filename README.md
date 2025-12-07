# Migraine Log

> A comprehensive, production-ready application for tracking and analyzing migraine episodes with detailed symptom and trigger logging.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Episode Tracking](#episode-tracking)
  - [Pattern Analysis](#pattern-analysis)
  - [Data Security](#data-security)
- [Development](#development)
  - [Development Server](#development-server)
  - [Building for Production](#building-for-production)
  - [Code Quality](#code-quality)
- [Testing](#testing)
- [Deployment](#deployment)
- [Database](#database)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

Migraine Log is a modern web application designed to help individuals track their migraine episodes with comprehensive detail. By logging symptoms, triggers, medications, and environmental factors, users can identify patterns and correlations that may help in managing and preventing future episodes.

### Who It's For

- **Individuals with migraines** seeking to understand their triggers and patterns
- **Healthcare providers** who need detailed patient episode histories
- **Researchers** studying migraine patterns and treatment effectiveness

### Key Benefits

- **Identify Triggers**: Track correlations between lifestyle factors and migraine onset
- **Monitor Effectiveness**: Evaluate how well different medications and treatments work
- **Doctor Visits**: Generate comprehensive reports for medical appointments
- **Privacy First**: Your health data stays secure with multi-tenant RLS architecture
- **Accessible Anywhere**: Progressive web app accessible from any device

---

## Key Features

- **Multi-user Authentication**: Secure login with email/password or social providers
- **Comprehensive Episode Tracking**: Detailed logging of symptoms, triggers, and treatments
- **Pattern Analysis**: Interactive browsing and correlation discovery
- **Data Visualization**: Charts and graphs to visualize trends over time
- **Printable Summaries**: Export episode history for medical appointments
- **Real-time Sync**: Cloud-based storage with Supabase
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Type-Safe**: Built with TypeScript for reliability and maintainability

---

## Tech Stack

### Frontend

- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling
- **[React 19](https://reactjs.org/)** - UI component library
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TanStack Router](https://tanstack.com/router)** - Type-safe routing
- **[TanStack Query](https://tanstack.com/query)** - Powerful async state management

### UI/Styling

- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend & Database

- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & user management
  - Row Level Security (RLS)
  - Real-time subscriptions

### Form Handling & Validation

- **[React Hook Form](https://react-hook-form.com/)** - Performant form library
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### Testing

- **[Playwright](https://playwright.dev/)** - End-to-end testing framework
- Cross-browser testing (Chromium, Firefox, WebKit)

### Developer Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TypeScript-specific linting rules

---

## Screenshots

> Coming soon: Screenshots will be added after initial deployment

---

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v22.x or higher (LTS recommended)
- **npm**: v10.x or higher (comes with Node.js)
- **Git**: For version control
- **Supabase Account**: Sign up at [supabase.com](https://supabase.com)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/migrainelog.git
   cd migrainelog
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This will install all required packages including React, Vite, Tailwind CSS, Supabase client, and more.

### Environment Setup

1. **Copy the environment template**

   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**

   Open `.env` and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Get these values from your Supabase project dashboard:
   - Navigate to **Settings** → **API**
   - Copy the **Project URL** and **anon/public** key

### Database Setup

1. **Create a Supabase project**

   - Go to [app.supabase.com](https://app.supabase.com)
   - Click **New Project**
   - Fill in project details and create

2. **Run the database migration**

   **Option A: Using Supabase Dashboard (Recommended for beginners)**

   - In your Supabase dashboard, go to **SQL Editor**
   - Open `supabase/migrations/001_create_episodes.sql` from this project
   - Copy the entire contents and paste into the SQL Editor
   - Click **Run** or press `Cmd/Ctrl + Enter`

   **Option B: Using Supabase CLI**

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link your project
   supabase link --project-ref your-project-ref

   # Push the migration
   supabase db push
   ```

3. **Enable Authentication**

   - In Supabase dashboard, go to **Authentication** → **Providers**
   - Enable **Email** provider
   - Configure any additional providers (Google, GitHub, etc.)

4. **Verify setup**

   Run this SQL query in the SQL Editor to confirm:

   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

   You should see the `episodes` table listed.

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed database setup instructions.

### Running the Application

1. **Start the development server**

   ```bash
   npm run dev
   ```

2. **Open your browser**

   Navigate to [http://localhost:5173](http://localhost:5173)

3. **Create an account**

   Sign up with your email to start tracking episodes!

---

## Project Structure

```
migrainelog/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons, and media files
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components (Button, Card, etc.)
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── episodes/     # Episode tracking components
│   │   ├── analysis/     # Data visualization components
│   │   └── layout/       # Layout components (Header, Footer)
│   ├── contexts/          # React Context providers (AuthContext)
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts    # Authentication hook
│   │   └── useEpisodes.ts # Episode management hook
│   ├── lib/               # Library configurations
│   │   ├── supabase.ts   # Supabase client setup
│   │   └── utils.ts      # Utility functions (cn, etc.)
│   ├── pages/             # Page components (routes)
│   │   ├── Dashboard.tsx
│   │   ├── Episodes.tsx
│   │   ├── Analysis.tsx
│   │   └── Login.tsx
│   ├── routes/            # TanStack Router route definitions
│   ├── services/          # API/Database service layer
│   │   └── episodeService.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── database.ts   # Supabase database types
│   │   └── episode.ts    # Episode-related types
│   └── utils/             # Utility functions and helpers
│       ├── date.ts       # Date formatting
│       └── validation.ts # Zod schemas
├── supabase/
│   ├── migrations/        # Database migration files
│   ├── queries.sql       # Useful SQL queries
│   └── README.md         # Database documentation
├── tests/                 # Playwright E2E tests
├── .env.example          # Environment variable template
├── components.json       # shadcn/ui configuration
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

### Key Directories

- **`/components`**: Reusable UI components organized by feature
- **`/hooks`**: Custom React hooks for shared logic
- **`/pages`**: Top-level page components mapped to routes
- **`/services`**: Business logic and API calls
- **`/types`**: TypeScript interfaces and type definitions
- **`/routes`**: TanStack Router route configuration

See [src/STRUCTURE.md](./src/STRUCTURE.md) for detailed architecture documentation.

---

## Features

### Episode Tracking

Track comprehensive details for each migraine episode:

#### Basic Information

- **Onset Time**: When the migraine started
- **End Time**: When the migraine ended (optional, can be updated later)
- **Severity**: Pain level from 1-10
- **Pain Location**: Specific areas affected
  - Frontal (forehead)
  - Temporal (temples)
  - Occipital (back of head)
  - Unilateral (one side)
  - Bilateral (both sides)

#### Contributing Factors

Track potential triggers and environmental conditions:

- **Sleep Duration**: Hours of sleep before onset
- **Weather Conditions**: Atmospheric conditions during episode
- **Hydration Level**: Water intake assessment
- **Stress Level**: Perceived stress
- **Physical Activity**: Recent exercise
- **Diet/Food Triggers**: Recent meals or specific foods

#### Symptoms & Warning Signs

Record detailed symptoms and early indicators:

- **Primary Symptoms**:
  - Throbbing pain
  - Nausea/vomiting
  - Light sensitivity (photophobia)
  - Sound sensitivity (phonophobia)
  - Visual disturbances
  - Dizziness

- **Warning Signs (Prodrome)**:
  - Vision changes or aura
  - Numbness or tingling
  - Aching neck/shoulder
  - Mood changes
  - Food cravings
  - Frequent yawning

#### Treatment

- **Medications Used**: Track specific drugs, dosages, and timing
- **Effectiveness Rating**: How well each medication worked
- **Non-medication Treatments**: Rest, cold/heat therapy, etc.
- **Notes**: Additional context or observations

### Pattern Analysis

- **Interactive Episode Browser**: Filter and sort through your history
- **Correlation Discovery**: Find relationships between triggers and episodes
- **Time-based Patterns**: Identify daily, weekly, or seasonal trends
- **Trigger Frequency**: See which triggers appear most often
- **Medication Effectiveness**: Compare treatment outcomes over time

### Migraine Summary

- **Comprehensive Reports**: Generate printable summaries of recent episodes
- **Date Range Selection**: Focus on specific time periods
- **Doctor-Ready Format**: Professional formatting for medical appointments
- **Export Options**: Print or save as PDF

### Data Security

- **Row Level Security (RLS)**: Your data is isolated and protected
- **Encrypted Storage**: All data encrypted in transit and at rest
- **Multi-tenant Architecture**: Complete data isolation between users
- **No Data Sharing**: Your health information remains private

---

## Development

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

### Building for Production

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

Preview the production build locally:

```bash
npm run preview
```

### Code Quality

#### Linting

Run ESLint to check for code issues:

```bash
npm run lint
```

ESLint is configured to catch common React and TypeScript issues.

#### Type Checking

TypeScript types are checked during the build process:

```bash
npm run build
```

---

## Testing

### End-to-End Testing with Playwright

This project uses Playwright for comprehensive E2E testing across multiple browsers.

#### Running Tests

```bash
# Run all tests headless
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (watch browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

#### View Test Reports

```bash
npm run test:e2e:report
```

#### Test Coverage

Current test coverage includes:

- User authentication (login/signup)
- Episode creation and editing
- Dashboard statistics
- Episode list filtering
- Form validation

See [TESTING_SETUP.md](./TESTING_SETUP.md) for detailed testing documentation.

#### Writing New Tests

Tests are located in the `tests/` directory. Example:

```typescript
import { test, expect } from '@playwright/test';

test('user can create new episode', async ({ page }) => {
  // Test implementation
});
```

---

## Deployment

### Environment Variables

Ensure the following environment variables are set in your deployment platform:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Build Command

```bash
npm run build
```

### Deployment Platforms

#### Vercel (Recommended)

1. Import your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with default settings (Vite is auto-detected)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

#### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables
5. Deploy

#### Other Platforms

This app can be deployed to any static hosting service:

- **Cloudflare Pages**
- **GitHub Pages**
- **AWS Amplify**
- **Firebase Hosting**

---

## Database

### Schema Overview

The application uses a single `episodes` table with the following structure:

- **id**: UUID primary key
- **user_id**: UUID (references auth.users)
- **start_time**: Timestamp with timezone
- **end_time**: Timestamp with timezone (nullable)
- **severity**: Integer (1-10)
- **pain_location**: Text array
- **symptoms**: Text array
- **triggers**: Text array
- **medications**: JSONB
- **notes**: Text
- **created_at**: Timestamp
- **updated_at**: Timestamp

### Row Level Security

RLS policies ensure data isolation:

- Users can only view their own episodes
- Users can only create episodes for themselves
- Users can only update/delete their own episodes

### Useful Queries

Common SQL queries are available in `supabase/queries.sql`:

- Get episode statistics
- Analyze trigger frequency
- Calculate medication effectiveness
- Identify time-based patterns

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete database documentation.

---

## Contributing

Contributions are welcome! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- Follow the existing TypeScript and React patterns
- Use functional components and hooks
- Maintain type safety (avoid `any`)
- Write meaningful component and variable names
- Add comments for complex logic

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add tests for new features
4. Request review from maintainers
5. Address any feedback

### Development Guidelines

- Keep components small and focused
- Use TypeScript for all new code
- Follow the existing project structure
- Write accessible UI components
- Test across different browsers

---

## Troubleshooting

### Common Issues

#### Build Fails

**Error**: `Module not found` or `Cannot find module`

**Solution**: Ensure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues

**Error**: `Invalid API key` or `Project not found`

**Solution**:
- Verify `.env` file exists and contains correct values
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server after changing `.env`

#### RLS Policy Errors

**Error**: `Row level security policy violation`

**Solution**:
- Ensure you're logged in when creating/viewing episodes
- Verify RLS policies are correctly set up in Supabase
- Check that `user_id` matches the authenticated user

#### TypeScript Errors

**Error**: Type errors in imported components

**Solution**:
- Run `npm run build` to check all type errors
- Ensure `tsconfig.json` paths are configured correctly
- Restart your IDE/editor's TypeScript server

#### Vite Dev Server Issues

**Error**: `Port 5173 already in use`

**Solution**:
```bash
# Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Or specify a different port
npm run dev -- --port 3000
```

### Getting Help

If you encounter issues not covered here:

1. **Check the documentation**:
   - [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup
   - [TESTING_SETUP.md](./TESTING_SETUP.md) - Testing guide
   - [src/STRUCTURE.md](./src/STRUCTURE.md) - Code architecture

2. **Search existing issues**: Check GitHub Issues for similar problems

3. **Create a new issue**: Provide detailed information:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages and logs
   - Environment (Node version, OS, browser)

4. **Community resources**:
   - [Supabase Discord](https://discord.supabase.com)
   - [React Community](https://react.dev/community)
   - [Vite Discord](https://chat.vitejs.dev)

---

## License

This project is licensed under the **ISC License**.

Copyright (c) 2025 Tim Hunter

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for migraine sufferers everywhere**
