import {
  mapTriggerRow,
  mapEpisodeRow,
  mapTreatmentRow,
  insertTrigger,
  getTriggerById,
  listTriggers,
  updateTrigger,
  deleteTrigger,
  insertEpisode,
  getEpisodeById,
  listEpisodes,
  updateEpisode,
  deleteEpisode,
  insertTreatment,
  getTreatmentById,
  listTreatments,
  updateTreatment,
  deleteTreatment,
  listTriggersInWindow,
  countEpisodesInWindow,
  getLastEpisodeTimestamp,
  getAverageEpisodeGap,
  listRecentEvents,
} from '../queries';
import type { SQLiteDatabase } from 'expo-sqlite';

// ---------------------------------------------------------------------------
// Mock uuid
// ---------------------------------------------------------------------------

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

// ---------------------------------------------------------------------------
// Mock database helper
// ---------------------------------------------------------------------------

function createMockDb(): jest.Mocked<
  Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>
> {
  return {
    runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
  };
}

// ---------------------------------------------------------------------------
// Row mapper tests
// ---------------------------------------------------------------------------

describe('mapTriggerRow', () => {
  it('maps a raw trigger row to a Trigger object', () => {
    const row = {
      id: 'abc-123',
      timestamp: '2025-01-15T10:00:00.000Z',
      notes: 'bad sleep',
      category: 'sleep',
      severity: 3,
    };
    const result = mapTriggerRow(row);
    expect(result).toEqual({
      id: 'abc-123',
      timestamp: '2025-01-15T10:00:00.000Z',
      notes: 'bad sleep',
      eventType: 'trigger',
      category: 'sleep',
      severity: 3,
    });
  });

  it('handles null notes', () => {
    const row = {
      id: 'abc-123',
      timestamp: '2025-01-15T10:00:00.000Z',
      notes: null,
      category: 'stress',
      severity: 5,
    };
    const result = mapTriggerRow(row);
    expect(result.notes).toBeNull();
    expect(result.eventType).toBe('trigger');
  });
});

describe('mapEpisodeRow', () => {
  it('maps a raw episode row to an Episode object', () => {
    const row = {
      id: 'ep-123',
      timestamp: '2025-01-15T10:00:00.000Z',
      notes: null,
      severity: 7,
      duration_minutes: 120,
      symptoms: '["Nausea","Dizziness"]',
      aura: 1,
    };
    const result = mapEpisodeRow(row);
    expect(result).toEqual({
      id: 'ep-123',
      timestamp: '2025-01-15T10:00:00.000Z',
      notes: null,
      eventType: 'episode',
      severity: 7,
      durationMinutes: 120,
      symptoms: ['Nausea', 'Dizziness'],
      aura: true,
    });
  });

  it('maps aura=0 to false and empty symptoms', () => {
    const row = {
      id: 'ep-456',
      timestamp: '2025-01-15T10:00:00.000Z',
      notes: 'mild headache',
      severity: 3,
      duration_minutes: null,
      symptoms: '[]',
      aura: 0,
    };
    const result = mapEpisodeRow(row);
    expect(result.aura).toBe(false);
    expect(result.symptoms).toEqual([]);
    expect(result.durationMinutes).toBeNull();
  });
});

describe('mapTreatmentRow', () => {
  it('maps a raw treatment row to a Treatment object', () => {
    const row = {
      id: 'tr-123',
      timestamp: '2025-01-15T10:00:00.000Z',
      notes: null,
      type: 'medication',
      name: 'Ibuprofen',
      effective: 1,
    };
    const result = mapTreatmentRow(row);
    expect(result).toEqual({
      id: 'tr-123',
      timestamp: '2025-01-15T10:00:00.000Z',
      notes: null,
      eventType: 'treatment',
      type: 'medication',
      name: 'Ibuprofen',
      effective: true,
    });
  });

  it('maps effective=0 to false', () => {
    const row = {
      id: 'tr-456',
      timestamp: '2025-01-15T10:00:00.000Z',
      notes: null,
      type: 'rest',
      name: 'Nap',
      effective: 0,
    };
    const result = mapTreatmentRow(row);
    expect(result.effective).toBe(false);
  });

  it('maps effective=null to null', () => {
    const row = {
      id: 'tr-789',
      timestamp: '2025-01-15T10:00:00.000Z',
      notes: null,
      type: 'hydration',
      name: 'Water',
      effective: null,
    };
    const result = mapTreatmentRow(row);
    expect(result.effective).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Trigger CRUD tests
// ---------------------------------------------------------------------------

describe('Trigger CRUD', () => {
  let db: jest.Mocked<Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>>;

  beforeEach(() => {
    db = createMockDb();
  });

  describe('insertTrigger', () => {
    it('inserts a trigger and returns the created object', async () => {
      const result = await insertTrigger(db as unknown as SQLiteDatabase, {
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: 'poor sleep',
        category: 'sleep',
        severity: 4,
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO triggers'),
        ['test-uuid-1234', '2025-01-15T10:00:00.000Z', 'poor sleep', 'sleep', 4]
      );
      expect(result).toEqual({
        id: 'test-uuid-1234',
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: 'poor sleep',
        eventType: 'trigger',
        category: 'sleep',
        severity: 4,
      });
    });

    it('defaults notes to null when not provided', async () => {
      await insertTrigger(db as unknown as SQLiteDatabase, {
        timestamp: '2025-01-15T10:00:00.000Z',
        category: 'stress',
        severity: 2,
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO triggers'),
        ['test-uuid-1234', '2025-01-15T10:00:00.000Z', null, 'stress', 2]
      );
    });
  });

  describe('getTriggerById', () => {
    it('returns mapped trigger when found', async () => {
      db.getFirstAsync.mockResolvedValue({
        id: 'abc-123',
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: null,
        category: 'food',
        severity: 2,
      });

      const result = await getTriggerById(db as unknown as SQLiteDatabase, 'abc-123');
      expect(db.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM triggers WHERE id = ?'),
        ['abc-123']
      );
      expect(result?.eventType).toBe('trigger');
      expect(result?.category).toBe('food');
    });

    it('returns null when not found', async () => {
      db.getFirstAsync.mockResolvedValue(null);
      const result = await getTriggerById(db as unknown as SQLiteDatabase, 'missing');
      expect(result).toBeNull();
    });
  });

  describe('listTriggers', () => {
    it('lists triggers with no options', async () => {
      db.getAllAsync.mockResolvedValue([
        { id: '1', timestamp: '2025-01-15T10:00:00.000Z', notes: null, category: 'sleep', severity: 3 },
      ]);

      const result = await listTriggers(db as unknown as SQLiteDatabase);
      expect(db.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM triggers'),
        []
      );
      expect(result).toHaveLength(1);
      expect(result[0].eventType).toBe('trigger');
    });

    it('applies since, until, category, limit, and offset', async () => {
      db.getAllAsync.mockResolvedValue([]);

      await listTriggers(db as unknown as SQLiteDatabase, {
        since: '2025-01-01T00:00:00.000Z',
        until: '2025-01-31T23:59:59.999Z',
        category: 'sleep',
        limit: 10,
        offset: 5,
      });

      const [sql, params] = db.getAllAsync.mock.calls[0];
      expect(sql).toContain('timestamp >= ?');
      expect(sql).toContain('timestamp <= ?');
      expect(sql).toContain('category = ?');
      expect(sql).toContain('LIMIT ?');
      expect(sql).toContain('OFFSET ?');
      expect(params).toEqual([
        '2025-01-01T00:00:00.000Z',
        '2025-01-31T23:59:59.999Z',
        'sleep',
        10,
        5,
      ]);
    });
  });

  describe('updateTrigger', () => {
    it('updates specified fields and returns updated trigger', async () => {
      db.getFirstAsync.mockResolvedValue({
        id: 'abc-123',
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: 'updated',
        category: 'stress',
        severity: 5,
      });

      const result = await updateTrigger(db as unknown as SQLiteDatabase, 'abc-123', {
        notes: 'updated',
        severity: 5,
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE triggers SET'),
        ['updated', 5, 'abc-123']
      );
      expect(result?.notes).toBe('updated');
    });

    it('returns current trigger when no fields provided', async () => {
      db.getFirstAsync.mockResolvedValue({
        id: 'abc-123',
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: null,
        category: 'sleep',
        severity: 3,
      });

      const result = await updateTrigger(db as unknown as SQLiteDatabase, 'abc-123', {});
      expect(db.runAsync).not.toHaveBeenCalled();
      expect(result).not.toBeNull();
    });
  });

  describe('deleteTrigger', () => {
    it('deletes a trigger by id', async () => {
      await deleteTrigger(db as unknown as SQLiteDatabase, 'abc-123');
      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM triggers WHERE id = ?'),
        ['abc-123']
      );
    });
  });
});

// ---------------------------------------------------------------------------
// Episode CRUD tests
// ---------------------------------------------------------------------------

describe('Episode CRUD', () => {
  let db: jest.Mocked<Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>>;

  beforeEach(() => {
    db = createMockDb();
  });

  describe('insertEpisode', () => {
    it('inserts an episode with all fields', async () => {
      const result = await insertEpisode(db as unknown as SQLiteDatabase, {
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: 'severe migraine',
        severity: 8,
        durationMinutes: 180,
        symptoms: ['Nausea', 'Light sensitivity'],
        aura: true,
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO episodes'),
        [
          'test-uuid-1234',
          '2025-01-15T10:00:00.000Z',
          'severe migraine',
          8,
          180,
          '["Nausea","Light sensitivity"]',
          1,
        ]
      );
      expect(result.symptoms).toEqual(['Nausea', 'Light sensitivity']);
      expect(result.aura).toBe(true);
    });

    it('defaults optional fields', async () => {
      const result = await insertEpisode(db as unknown as SQLiteDatabase, {
        timestamp: '2025-01-15T10:00:00.000Z',
        severity: 5,
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO episodes'),
        ['test-uuid-1234', '2025-01-15T10:00:00.000Z', null, 5, null, '[]', 0]
      );
      expect(result.symptoms).toEqual([]);
      expect(result.aura).toBe(false);
      expect(result.durationMinutes).toBeNull();
    });
  });

  describe('getEpisodeById', () => {
    it('returns mapped episode when found', async () => {
      db.getFirstAsync.mockResolvedValue({
        id: 'ep-123',
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: null,
        severity: 7,
        duration_minutes: 90,
        symptoms: '["Nausea"]',
        aura: 0,
      });

      const result = await getEpisodeById(db as unknown as SQLiteDatabase, 'ep-123');
      expect(result?.eventType).toBe('episode');
      expect(result?.symptoms).toEqual(['Nausea']);
      expect(result?.aura).toBe(false);
    });
  });

  describe('listEpisodes', () => {
    it('lists episodes with time range', async () => {
      db.getAllAsync.mockResolvedValue([]);
      await listEpisodes(db as unknown as SQLiteDatabase, {
        since: '2025-01-01T00:00:00.000Z',
        limit: 5,
      });

      const [sql, params] = db.getAllAsync.mock.calls[0];
      expect(sql).toContain('timestamp >= ?');
      expect(sql).toContain('LIMIT ?');
      expect(params).toEqual(['2025-01-01T00:00:00.000Z', 5]);
    });
  });

  describe('updateEpisode', () => {
    it('updates severity and symptoms', async () => {
      db.getFirstAsync.mockResolvedValue({
        id: 'ep-123',
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: null,
        severity: 9,
        duration_minutes: null,
        symptoms: '["Dizziness"]',
        aura: 1,
      });

      await updateEpisode(db as unknown as SQLiteDatabase, 'ep-123', {
        severity: 9,
        symptoms: ['Dizziness'],
        aura: true,
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE episodes SET'),
        [9, '["Dizziness"]', 1, 'ep-123']
      );
    });
  });

  describe('deleteEpisode', () => {
    it('deletes an episode by id', async () => {
      await deleteEpisode(db as unknown as SQLiteDatabase, 'ep-123');
      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM episodes WHERE id = ?'),
        ['ep-123']
      );
    });
  });
});

// ---------------------------------------------------------------------------
// Treatment CRUD tests
// ---------------------------------------------------------------------------

describe('Treatment CRUD', () => {
  let db: jest.Mocked<Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>>;

  beforeEach(() => {
    db = createMockDb();
  });

  describe('insertTreatment', () => {
    it('inserts a treatment with effective=true', async () => {
      const result = await insertTreatment(db as unknown as SQLiteDatabase, {
        timestamp: '2025-01-15T10:00:00.000Z',
        type: 'medication',
        name: 'Ibuprofen',
        effective: true,
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO treatments'),
        ['test-uuid-1234', '2025-01-15T10:00:00.000Z', null, 'medication', 'Ibuprofen', 1]
      );
      expect(result.effective).toBe(true);
    });

    it('inserts with effective=null when not provided', async () => {
      const result = await insertTreatment(db as unknown as SQLiteDatabase, {
        timestamp: '2025-01-15T10:00:00.000Z',
        type: 'rest',
        name: 'Nap',
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO treatments'),
        ['test-uuid-1234', '2025-01-15T10:00:00.000Z', null, 'rest', 'Nap', null]
      );
      expect(result.effective).toBeNull();
    });

    it('inserts with effective=false', async () => {
      await insertTreatment(db as unknown as SQLiteDatabase, {
        timestamp: '2025-01-15T10:00:00.000Z',
        type: 'caffeine',
        name: 'Coffee',
        effective: false,
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO treatments'),
        ['test-uuid-1234', '2025-01-15T10:00:00.000Z', null, 'caffeine', 'Coffee', 0]
      );
    });
  });

  describe('getTreatmentById', () => {
    it('returns mapped treatment when found', async () => {
      db.getFirstAsync.mockResolvedValue({
        id: 'tr-123',
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: null,
        type: 'medication',
        name: 'Sumatriptan',
        effective: 1,
      });

      const result = await getTreatmentById(db as unknown as SQLiteDatabase, 'tr-123');
      expect(result?.eventType).toBe('treatment');
      expect(result?.effective).toBe(true);
    });
  });

  describe('listTreatments', () => {
    it('lists treatments with time range', async () => {
      db.getAllAsync.mockResolvedValue([]);
      await listTreatments(db as unknown as SQLiteDatabase, {
        since: '2025-01-01T00:00:00.000Z',
        until: '2025-01-31T23:59:59.999Z',
      });

      const [sql, params] = db.getAllAsync.mock.calls[0];
      expect(sql).toContain('timestamp >= ?');
      expect(sql).toContain('timestamp <= ?');
      expect(params).toEqual([
        '2025-01-01T00:00:00.000Z',
        '2025-01-31T23:59:59.999Z',
      ]);
    });
  });

  describe('updateTreatment', () => {
    it('updates effective to false', async () => {
      db.getFirstAsync.mockResolvedValue({
        id: 'tr-123',
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: null,
        type: 'medication',
        name: 'Ibuprofen',
        effective: 0,
      });

      await updateTreatment(db as unknown as SQLiteDatabase, 'tr-123', {
        effective: false,
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE treatments SET'),
        [0, 'tr-123']
      );
    });

    it('updates effective to null', async () => {
      db.getFirstAsync.mockResolvedValue({
        id: 'tr-123',
        timestamp: '2025-01-15T10:00:00.000Z',
        notes: null,
        type: 'medication',
        name: 'Ibuprofen',
        effective: null,
      });

      await updateTreatment(db as unknown as SQLiteDatabase, 'tr-123', {
        effective: null,
      });

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE treatments SET'),
        [null, 'tr-123']
      );
    });
  });

  describe('deleteTreatment', () => {
    it('deletes a treatment by id', async () => {
      await deleteTreatment(db as unknown as SQLiteDatabase, 'tr-123');
      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM treatments WHERE id = ?'),
        ['tr-123']
      );
    });
  });
});

// ---------------------------------------------------------------------------
// Risk query tests
// ---------------------------------------------------------------------------

describe('Risk queries', () => {
  let db: jest.Mocked<Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>>;

  beforeEach(() => {
    db = createMockDb();
  });

  describe('listTriggersInWindow', () => {
    it('queries triggers since a given timestamp', async () => {
      db.getAllAsync.mockResolvedValue([
        { id: '1', timestamp: '2025-01-15T10:00:00.000Z', notes: null, category: 'sleep', severity: 3 },
      ]);

      const result = await listTriggersInWindow(
        db as unknown as SQLiteDatabase,
        '2025-01-14T00:00:00.000Z'
      );

      expect(db.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE timestamp >= ?'),
        ['2025-01-14T00:00:00.000Z']
      );
      expect(result).toHaveLength(1);
      expect(result[0].eventType).toBe('trigger');
    });
  });

  describe('countEpisodesInWindow', () => {
    it('returns episode count since a given timestamp', async () => {
      db.getFirstAsync.mockResolvedValue({ cnt: 5 });

      const result = await countEpisodesInWindow(
        db as unknown as SQLiteDatabase,
        '2025-01-01T00:00:00.000Z'
      );

      expect(result).toBe(5);
    });

    it('returns 0 when no result', async () => {
      db.getFirstAsync.mockResolvedValue(null);

      const result = await countEpisodesInWindow(
        db as unknown as SQLiteDatabase,
        '2025-01-01T00:00:00.000Z'
      );

      expect(result).toBe(0);
    });
  });

  describe('getLastEpisodeTimestamp', () => {
    it('returns the latest episode timestamp', async () => {
      db.getFirstAsync.mockResolvedValue({ timestamp: '2025-01-15T10:00:00.000Z' });

      const result = await getLastEpisodeTimestamp(db as unknown as SQLiteDatabase);
      expect(result).toBe('2025-01-15T10:00:00.000Z');
    });

    it('returns null when no episodes exist', async () => {
      db.getFirstAsync.mockResolvedValue(null);

      const result = await getLastEpisodeTimestamp(db as unknown as SQLiteDatabase);
      expect(result).toBeNull();
    });
  });

  describe('getAverageEpisodeGap', () => {
    it('calculates average gap in days between episodes', async () => {
      db.getAllAsync.mockResolvedValue([
        { timestamp: '2025-01-15T00:00:00.000Z' },
        { timestamp: '2025-01-12T00:00:00.000Z' },
        { timestamp: '2025-01-09T00:00:00.000Z' },
      ]);

      const result = await getAverageEpisodeGap(db as unknown as SQLiteDatabase);
      // gap1 = 3 days, gap2 = 3 days, avg = 3
      expect(result).toBe(3);
    });

    it('returns null when fewer than 2 episodes', async () => {
      db.getAllAsync.mockResolvedValue([
        { timestamp: '2025-01-15T00:00:00.000Z' },
      ]);

      const result = await getAverageEpisodeGap(db as unknown as SQLiteDatabase);
      expect(result).toBeNull();
    });

    it('returns null when no episodes', async () => {
      db.getAllAsync.mockResolvedValue([]);

      const result = await getAverageEpisodeGap(db as unknown as SQLiteDatabase);
      expect(result).toBeNull();
    });

    it('uses custom limit parameter', async () => {
      db.getAllAsync.mockResolvedValue([]);

      await getAverageEpisodeGap(db as unknown as SQLiteDatabase, 5);
      expect(db.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        [5]
      );
    });

    it('defaults limit to 10', async () => {
      db.getAllAsync.mockResolvedValue([]);

      await getAverageEpisodeGap(db as unknown as SQLiteDatabase);
      expect(db.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        [10]
      );
    });
  });
});

// ---------------------------------------------------------------------------
// Recent events tests
// ---------------------------------------------------------------------------

describe('listRecentEvents', () => {
  let db: jest.Mocked<Pick<SQLiteDatabase, 'runAsync' | 'getFirstAsync' | 'getAllAsync'>>;

  beforeEach(() => {
    db = createMockDb();
  });

  it('returns events from all three tables via UNION ALL', async () => {
    db.getAllAsync.mockResolvedValue([
      { id: '1', timestamp: '2025-01-15T10:00:00.000Z', notes: null, event_type: 'trigger' },
      { id: '2', timestamp: '2025-01-15T09:00:00.000Z', notes: 'bad', event_type: 'episode' },
      { id: '3', timestamp: '2025-01-15T08:00:00.000Z', notes: null, event_type: 'treatment' },
    ]);

    const result = await listRecentEvents(db as unknown as SQLiteDatabase, 10);

    const [sql, params] = db.getAllAsync.mock.calls[0];
    expect(sql).toContain('UNION ALL');
    expect(sql).toContain("'trigger' as event_type");
    expect(sql).toContain("'episode' as event_type");
    expect(sql).toContain("'treatment' as event_type");
    expect(params).toEqual([10]);

    expect(result).toHaveLength(3);
    expect(result[0].eventType).toBe('trigger');
    expect(result[1].eventType).toBe('episode');
    expect(result[2].eventType).toBe('treatment');
  });

  it('defaults limit to 20', async () => {
    db.getAllAsync.mockResolvedValue([]);

    await listRecentEvents(db as unknown as SQLiteDatabase);
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.any(String),
      [20]
    );
  });
});
