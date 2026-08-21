import type { SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';
import type { BaseEvent, ListOptions } from '../models/event';
import type { Trigger, TriggerInsert, TriggerCategory } from '../models/trigger';
import type { Episode, EpisodeInsert } from '../models/episode';
import type { Treatment, TreatmentInsert, TreatmentType } from '../models/treatment';

// ---------------------------------------------------------------------------
// Row types (what SQLite actually returns)
// ---------------------------------------------------------------------------

interface TriggerRow {
  id: string;
  timestamp: string;
  notes: string | null;
  category: string;
  severity: number;
}

interface EpisodeRow {
  id: string;
  timestamp: string;
  notes: string | null;
  severity: number;
  duration_minutes: number | null;
  symptoms: string;
  aura: number;
}

interface TreatmentRow {
  id: string;
  timestamp: string;
  notes: string | null;
  type: string;
  name: string;
  effective: number | null;
}

interface RecentEventRow {
  id: string;
  timestamp: string;
  notes: string | null;
  event_type: string;
}

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

export function mapTriggerRow(row: TriggerRow): Trigger {
  return {
    id: row.id,
    timestamp: row.timestamp,
    notes: row.notes,
    eventType: 'trigger',
    category: row.category as TriggerCategory,
    severity: row.severity,
  };
}

export function mapEpisodeRow(row: EpisodeRow): Episode {
  return {
    id: row.id,
    timestamp: row.timestamp,
    notes: row.notes,
    eventType: 'episode',
    severity: row.severity,
    durationMinutes: row.duration_minutes,
    symptoms: JSON.parse(row.symptoms) as string[],
    aura: row.aura === 1,
  };
}

export function mapTreatmentRow(row: TreatmentRow): Treatment {
  return {
    id: row.id,
    timestamp: row.timestamp,
    notes: row.notes,
    eventType: 'treatment',
    type: row.type as TreatmentType,
    name: row.name,
    effective: row.effective === null ? null : row.effective === 1,
  };
}

// ---------------------------------------------------------------------------
// Trigger CRUD
// ---------------------------------------------------------------------------

export async function insertTrigger(
  db: SQLiteDatabase,
  data: TriggerInsert
): Promise<Trigger> {
  const id = randomUUID();
  await db.runAsync(
    'INSERT INTO triggers (id, timestamp, notes, category, severity) VALUES (?, ?, ?, ?, ?);',
    [id, data.timestamp, data.notes ?? null, data.category, data.severity]
  );
  return {
    id,
    timestamp: data.timestamp,
    notes: data.notes ?? null,
    eventType: 'trigger',
    category: data.category,
    severity: data.severity,
  };
}

export async function getTriggerById(
  db: SQLiteDatabase,
  id: string
): Promise<Trigger | null> {
  const row = await db.getFirstAsync<TriggerRow>(
    'SELECT * FROM triggers WHERE id = ?;',
    [id]
  );
  return row ? mapTriggerRow(row) : null;
}

export async function listTriggers(
  db: SQLiteDatabase,
  opts?: ListOptions
): Promise<Trigger[]> {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (opts?.since) {
    clauses.push('timestamp >= ?');
    params.push(opts.since);
  }
  if (opts?.until) {
    clauses.push('timestamp <= ?');
    params.push(opts.until);
  }
  if (opts?.category) {
    clauses.push('category = ?');
    params.push(opts.category);
  }

  let sql = 'SELECT * FROM triggers';
  if (clauses.length > 0) {
    sql += ' WHERE ' + clauses.join(' AND ');
  }
  sql += ' ORDER BY timestamp DESC';

  if (opts?.limit !== undefined) {
    sql += ' LIMIT ?';
    params.push(opts.limit);
  }
  if (opts?.offset !== undefined) {
    sql += ' OFFSET ?';
    params.push(opts.offset);
  }

  const rows = await db.getAllAsync<TriggerRow>(sql, params);
  return rows.map(mapTriggerRow);
}

export async function updateTrigger(
  db: SQLiteDatabase,
  id: string,
  data: Partial<TriggerInsert>
): Promise<Trigger | null> {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.timestamp !== undefined) {
    fields.push('timestamp = ?');
    params.push(data.timestamp);
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    params.push(data.notes ?? null);
  }
  if (data.category !== undefined) {
    fields.push('category = ?');
    params.push(data.category);
  }
  if (data.severity !== undefined) {
    fields.push('severity = ?');
    params.push(data.severity);
  }

  if (fields.length === 0) {
    return getTriggerById(db, id);
  }

  params.push(id);
  await db.runAsync(
    `UPDATE triggers SET ${fields.join(', ')} WHERE id = ?;`,
    params
  );
  return getTriggerById(db, id);
}

export async function deleteTrigger(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM triggers WHERE id = ?;', [id]);
}

// ---------------------------------------------------------------------------
// Episode CRUD
// ---------------------------------------------------------------------------

export async function insertEpisode(
  db: SQLiteDatabase,
  data: EpisodeInsert
): Promise<Episode> {
  const id = randomUUID();
  const symptoms = JSON.stringify(data.symptoms ?? []);
  const aura = data.aura ? 1 : 0;
  await db.runAsync(
    'INSERT INTO episodes (id, timestamp, notes, severity, duration_minutes, symptoms, aura) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [
      id,
      data.timestamp,
      data.notes ?? null,
      data.severity,
      data.durationMinutes ?? null,
      symptoms,
      aura,
    ]
  );
  return {
    id,
    timestamp: data.timestamp,
    notes: data.notes ?? null,
    eventType: 'episode',
    severity: data.severity,
    durationMinutes: data.durationMinutes ?? null,
    symptoms: data.symptoms ?? [],
    aura: data.aura ?? false,
  };
}

export async function getEpisodeById(
  db: SQLiteDatabase,
  id: string
): Promise<Episode | null> {
  const row = await db.getFirstAsync<EpisodeRow>(
    'SELECT * FROM episodes WHERE id = ?;',
    [id]
  );
  return row ? mapEpisodeRow(row) : null;
}

export async function listEpisodes(
  db: SQLiteDatabase,
  opts?: ListOptions
): Promise<Episode[]> {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (opts?.since) {
    clauses.push('timestamp >= ?');
    params.push(opts.since);
  }
  if (opts?.until) {
    clauses.push('timestamp <= ?');
    params.push(opts.until);
  }

  let sql = 'SELECT * FROM episodes';
  if (clauses.length > 0) {
    sql += ' WHERE ' + clauses.join(' AND ');
  }
  sql += ' ORDER BY timestamp DESC';

  if (opts?.limit !== undefined) {
    sql += ' LIMIT ?';
    params.push(opts.limit);
  }
  if (opts?.offset !== undefined) {
    sql += ' OFFSET ?';
    params.push(opts.offset);
  }

  const rows = await db.getAllAsync<EpisodeRow>(sql, params);
  return rows.map(mapEpisodeRow);
}

export async function updateEpisode(
  db: SQLiteDatabase,
  id: string,
  data: Partial<EpisodeInsert>
): Promise<Episode | null> {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.timestamp !== undefined) {
    fields.push('timestamp = ?');
    params.push(data.timestamp);
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    params.push(data.notes ?? null);
  }
  if (data.severity !== undefined) {
    fields.push('severity = ?');
    params.push(data.severity);
  }
  if (data.durationMinutes !== undefined) {
    fields.push('duration_minutes = ?');
    params.push(data.durationMinutes ?? null);
  }
  if (data.symptoms !== undefined) {
    fields.push('symptoms = ?');
    params.push(JSON.stringify(data.symptoms));
  }
  if (data.aura !== undefined) {
    fields.push('aura = ?');
    params.push(data.aura ? 1 : 0);
  }

  if (fields.length === 0) {
    return getEpisodeById(db, id);
  }

  params.push(id);
  await db.runAsync(
    `UPDATE episodes SET ${fields.join(', ')} WHERE id = ?;`,
    params
  );
  return getEpisodeById(db, id);
}

export async function deleteEpisode(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM episodes WHERE id = ?;', [id]);
}

// ---------------------------------------------------------------------------
// Treatment CRUD
// ---------------------------------------------------------------------------

export async function insertTreatment(
  db: SQLiteDatabase,
  data: TreatmentInsert
): Promise<Treatment> {
  const id = randomUUID();
  const effective = data.effective === undefined || data.effective === null
    ? null
    : data.effective
      ? 1
      : 0;
  await db.runAsync(
    'INSERT INTO treatments (id, timestamp, notes, type, name, effective) VALUES (?, ?, ?, ?, ?, ?);',
    [id, data.timestamp, data.notes ?? null, data.type, data.name, effective]
  );
  return {
    id,
    timestamp: data.timestamp,
    notes: data.notes ?? null,
    eventType: 'treatment',
    type: data.type,
    name: data.name,
    effective: data.effective ?? null,
  };
}

export async function getTreatmentById(
  db: SQLiteDatabase,
  id: string
): Promise<Treatment | null> {
  const row = await db.getFirstAsync<TreatmentRow>(
    'SELECT * FROM treatments WHERE id = ?;',
    [id]
  );
  return row ? mapTreatmentRow(row) : null;
}

export async function listTreatments(
  db: SQLiteDatabase,
  opts?: ListOptions
): Promise<Treatment[]> {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (opts?.since) {
    clauses.push('timestamp >= ?');
    params.push(opts.since);
  }
  if (opts?.until) {
    clauses.push('timestamp <= ?');
    params.push(opts.until);
  }

  let sql = 'SELECT * FROM treatments';
  if (clauses.length > 0) {
    sql += ' WHERE ' + clauses.join(' AND ');
  }
  sql += ' ORDER BY timestamp DESC';

  if (opts?.limit !== undefined) {
    sql += ' LIMIT ?';
    params.push(opts.limit);
  }
  if (opts?.offset !== undefined) {
    sql += ' OFFSET ?';
    params.push(opts.offset);
  }

  const rows = await db.getAllAsync<TreatmentRow>(sql, params);
  return rows.map(mapTreatmentRow);
}

export async function updateTreatment(
  db: SQLiteDatabase,
  id: string,
  data: Partial<TreatmentInsert>
): Promise<Treatment | null> {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.timestamp !== undefined) {
    fields.push('timestamp = ?');
    params.push(data.timestamp);
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    params.push(data.notes ?? null);
  }
  if (data.type !== undefined) {
    fields.push('type = ?');
    params.push(data.type);
  }
  if (data.name !== undefined) {
    fields.push('name = ?');
    params.push(data.name);
  }
  if (data.effective !== undefined) {
    fields.push('effective = ?');
    params.push(
      data.effective === null ? null : data.effective ? 1 : 0
    );
  }

  if (fields.length === 0) {
    return getTreatmentById(db, id);
  }

  params.push(id);
  await db.runAsync(
    `UPDATE treatments SET ${fields.join(', ')} WHERE id = ?;`,
    params
  );
  return getTreatmentById(db, id);
}

export async function deleteTreatment(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM treatments WHERE id = ?;', [id]);
}

// ---------------------------------------------------------------------------
// Risk queries
// ---------------------------------------------------------------------------

export async function listTriggersInWindow(
  db: SQLiteDatabase,
  since: string
): Promise<Trigger[]> {
  const rows = await db.getAllAsync<TriggerRow>(
    'SELECT * FROM triggers WHERE timestamp >= ? ORDER BY timestamp DESC;',
    [since]
  );
  return rows.map(mapTriggerRow);
}

export async function countEpisodesInWindow(
  db: SQLiteDatabase,
  since: string
): Promise<number> {
  const row = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM episodes WHERE timestamp >= ?;',
    [since]
  );
  return row?.cnt ?? 0;
}

export async function getLastEpisodeTimestamp(
  db: SQLiteDatabase
): Promise<string | null> {
  const row = await db.getFirstAsync<{ timestamp: string | null }>(
    'SELECT timestamp FROM episodes ORDER BY timestamp DESC LIMIT 1;'
  );
  return row?.timestamp ?? null;
}

export async function getAverageEpisodeGap(
  db: SQLiteDatabase,
  limit?: number
): Promise<number | null> {
  const effectiveLimit = limit ?? 10;
  const rows = await db.getAllAsync<{ timestamp: string }>(
    'SELECT timestamp FROM episodes ORDER BY timestamp DESC LIMIT ?;',
    [effectiveLimit]
  );

  if (rows.length < 2) {
    return null;
  }

  let totalGapMs = 0;
  for (let i = 0; i < rows.length - 1; i++) {
    const current = new Date(rows[i].timestamp).getTime();
    const next = new Date(rows[i + 1].timestamp).getTime();
    totalGapMs += current - next;
  }

  const avgGapMs = totalGapMs / (rows.length - 1);
  const avgGapDays = avgGapMs / (1000 * 60 * 60 * 24);
  return avgGapDays;
}

// ---------------------------------------------------------------------------
// Recent events (UNION ALL across all tables)
// ---------------------------------------------------------------------------

export async function listRecentEvents(
  db: SQLiteDatabase,
  limit?: number
): Promise<BaseEvent[]> {
  const effectiveLimit = limit ?? 20;
  const rows = await db.getAllAsync<RecentEventRow>(
    `SELECT id, timestamp, notes, 'trigger' as event_type FROM triggers
     UNION ALL
     SELECT id, timestamp, notes, 'episode' as event_type FROM episodes
     UNION ALL
     SELECT id, timestamp, notes, 'treatment' as event_type FROM treatments
     ORDER BY timestamp DESC
     LIMIT ?;`,
    [effectiveLimit]
  );

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    notes: row.notes,
    eventType: row.event_type as BaseEvent['eventType'],
  }));
}

// ---------------------------------------------------------------------------
// Preferences (key-value)
// ---------------------------------------------------------------------------

interface PreferenceRow {
  value: string;
}

export async function getPreference(
  db: SQLiteDatabase,
  key: string
): Promise<string | null> {
  const row = await db.getFirstAsync<PreferenceRow>(
    'SELECT value FROM preferences WHERE key = ?;',
    [key]
  );
  return row?.value ?? null;
}

export async function setPreference(
  db: SQLiteDatabase,
  key: string,
  value: string
): Promise<void> {
  await db.runAsync(
    `INSERT INTO preferences (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
    [key, value]
  );
}
