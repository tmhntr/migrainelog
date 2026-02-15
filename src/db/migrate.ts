import type { SQLiteDatabase } from 'expo-sqlite';
import { migrations } from './migrations';

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // Ensure schema_version table exists
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Get the current max version
  const row = await db.getFirstAsync<{ max_version: number | null }>(
    'SELECT MAX(version) as max_version FROM schema_version;'
  );
  const currentVersion = row?.max_version ?? 0;

  // Run pending migrations in order
  const pending = migrations.filter((m) => m.version > currentVersion);
  pending.sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.runAsync(
        'INSERT INTO schema_version (version) VALUES (?);',
        [migration.version]
      );
    });
  }
}
