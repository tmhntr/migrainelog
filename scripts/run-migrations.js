#!/usr/bin/env node

/**
 * Supabase Migration Runner
 *
 * This script runs Supabase migrations against a cloud project.
 * It's designed to run in CI/CD before deployment to ensure
 * database schema is up-to-date.
 *
 * Environment Variables Required:
 * - SUPABASE_ACCESS_TOKEN: Your Supabase access token
 * - SUPABASE_PROJECT_REF: The project reference ID
 * - SUPABASE_DB_PASSWORD: Database password
 * - DEPLOYMENT_ENV: "production" or "preview"
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const REQUIRED_ENV_VARS = [
  'SUPABASE_ACCESS_TOKEN',
  'SUPABASE_PROJECT_REF',
  'SUPABASE_DB_PASSWORD',
  'DEPLOYMENT_ENV'
];

const PROJECT_ROOT = resolve(__dirname, '..');
const MIGRATIONS_DIR = resolve(PROJECT_ROOT, 'supabase/migrations');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(title, 'cyan');
  log('='.repeat(60), 'cyan');
}

function validateEnvironment() {
  logSection('Validating Environment');

  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

  if (missing.length > 0) {
    log(`❌ Missing required environment variables:`, 'red');
    missing.forEach(key => log(`   - ${key}`, 'red'));
    process.exit(1);
  }

  log('✅ All required environment variables present', 'green');
  log(`📍 Deployment Environment: ${process.env.DEPLOYMENT_ENV}`, 'blue');
  log(`🔑 Project Reference: ${process.env.SUPABASE_PROJECT_REF}`, 'blue');
}

function validateMigrationsDirectory() {
  logSection('Validating Migrations Directory');

  if (!existsSync(MIGRATIONS_DIR)) {
    log(`❌ Migrations directory not found: ${MIGRATIONS_DIR}`, 'red');
    process.exit(1);
  }

  log(`✅ Migrations directory found: ${MIGRATIONS_DIR}`, 'green');
}

function linkSupabaseProject() {
  logSection('Linking to Supabase Project');

  try {
    const projectRef = process.env.SUPABASE_PROJECT_REF;
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;

    log('🔗 Linking to Supabase project...', 'blue');

    // Link to the cloud project
    execSync(
      `supabase link --project-ref ${projectRef} --password "${dbPassword}"`,
      {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
        env: {
          ...process.env,
          SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN
        }
      }
    );

    log('✅ Successfully linked to Supabase project', 'green');
  } catch (error) {
    log('❌ Failed to link Supabase project', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function runMigrations() {
  logSection('Running Database Migrations');

  try {
    log('🚀 Executing migrations...', 'blue');

    // Run migrations with db push
    const output = execSync('supabase db push', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN
      }
    });

    log(output, 'reset');
    log('✅ Migrations completed successfully', 'green');
  } catch (error) {
    log('❌ Migration failed', 'red');
    log(error.message, 'red');

    if (error.stdout) {
      log('\nStdout:', 'yellow');
      log(error.stdout.toString(), 'reset');
    }

    if (error.stderr) {
      log('\nStderr:', 'yellow');
      log(error.stderr.toString(), 'reset');
    }

    process.exit(1);
  }
}

function generateMigrationReport() {
  logSection('Migration Summary');

  log(`✅ All migrations applied successfully`, 'green');
  log(`📅 Timestamp: ${new Date().toISOString()}`, 'blue');
  log(`🌍 Environment: ${process.env.DEPLOYMENT_ENV}`, 'blue');
  log(`🔑 Project: ${process.env.SUPABASE_PROJECT_REF}`, 'blue');
}

async function main() {
  try {
    log('\n🗄️  Supabase Migration Runner', 'cyan');
    log('════════════════════════════════════════════════════════════\n', 'cyan');

    // Step 1: Validate environment variables
    validateEnvironment();

    // Step 2: Validate migrations directory exists
    validateMigrationsDirectory();

    // Step 3: Link to Supabase project
    linkSupabaseProject();

    // Step 4: Run migrations
    runMigrations();

    // Step 5: Generate report
    generateMigrationReport();

    log('\n✨ Migration process completed successfully!\n', 'green');
    process.exit(0);
  } catch (error) {
    log('\n💥 Unexpected error occurred', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Run the migration process
main();
