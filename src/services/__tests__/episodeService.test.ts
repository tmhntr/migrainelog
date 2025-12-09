import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase - must be before imports
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

import { episodeService } from '../episodeService';
import { supabase } from '@/lib/supabase';
import type { Episode } from '@/types/episode';

type CreateEpisode = Omit<Episode, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Setup mock implementations
const setupMocks = () => {
  const chainable = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
  };

  mockSelect.mockReturnValue(chainable);
  mockInsert.mockReturnValue(chainable);
  mockUpdate.mockReturnValue(chainable);
  mockDelete.mockReturnValue(chainable);
  mockEq.mockReturnValue(chainable);
  mockOrder.mockReturnValue(chainable);

  mockFrom.mockReturnValue(chainable);

  (supabase.from as any) = mockFrom;
  (supabase.auth.getUser as any) = mockGetUser;
};

describe('EpisodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  describe('getEpisodes', () => {
    it('should fetch and transform episodes', async () => {
      const dbEpisodes = [
        {
          id: 'test-1',
          user_id: 'user-1',
          start_time: '2025-01-01T10:00:00Z',
          end_time: '2025-01-01T14:00:00Z',
          severity: 7,
          pain_location: ['forehead'],
          symptoms: ['nausea'],
          triggers: ['stress'],
          medications: ['{"name":"Ibuprofen","dosage":"400mg","time_taken":"2025-01-01T10:30:00Z","effectiveness":3}'],
          notes: 'Test',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-01T10:00:00Z',
        },
      ];

      mockOrder.mockResolvedValueOnce({ data: dbEpisodes, error: null });

      const episodes = await episodeService.getEpisodes();

      expect(mockFrom).toHaveBeenCalledWith('episodes');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('start_time', { ascending: false });
      expect(episodes).toHaveLength(1);
      expect(episodes[0].start_time).toBeInstanceOf(Date);
      expect(episodes[0].end_time).toBeInstanceOf(Date);
      expect(episodes[0].medications[0]).toEqual({
        name: 'Ibuprofen',
        dosage: '400mg',
        time_taken: '2025-01-01T10:30:00Z',
        effectiveness: 3,
      });
    });

    it('should throw error on database failure', async () => {
      const error = new Error('Database error');
      mockOrder.mockResolvedValueOnce({ data: null, error });

      await expect(episodeService.getEpisodes()).rejects.toThrow('Database error');
    });

    it('should handle empty medications array', async () => {
      const dbEpisode = {
        id: 'test-1',
        user_id: 'user-1',
        start_time: '2025-01-01T10:00:00Z',
        end_time: null,
        severity: 5,
        pain_location: ['forehead'],
        symptoms: [],
        triggers: [],
        medications: [],
        notes: null,
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      };

      mockOrder.mockResolvedValueOnce({ data: [dbEpisode], error: null });

      const episodes = await episodeService.getEpisodes();
      expect(episodes[0].medications).toEqual([]);
    });
  });

  describe('getEpisode', () => {
    it('should fetch and transform a single episode', async () => {
      const dbEpisode = {
        id: 'test-1',
        user_id: 'user-1',
        start_time: '2025-01-01T10:00:00Z',
        end_time: '2025-01-01T14:00:00Z',
        severity: 7,
        pain_location: ['forehead'],
        symptoms: ['nausea'],
        triggers: ['stress'],
        medications: ['{"name":"Ibuprofen","dosage":"400mg","time_taken":"2025-01-01T10:30:00Z"}'],
        notes: 'Test',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      };

      mockSingle.mockResolvedValueOnce({ data: dbEpisode, error: null });

      const episode = await episodeService.getEpisode('test-1');

      expect(mockFrom).toHaveBeenCalledWith('episodes');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'test-1');
      expect(mockSingle).toHaveBeenCalled();
      expect(episode.id).toBe('test-1');
      expect(episode.start_time).toBeInstanceOf(Date);
    });

    it('should throw error when episode not found', async () => {
      const error = new Error('Episode not found');
      mockSingle.mockResolvedValueOnce({ data: null, error });

      await expect(episodeService.getEpisode('invalid-id')).rejects.toThrow();
    });
  });

  describe('createEpisode', () => {
    it('should create a new episode', async () => {
      const newEpisode = {
        start_time: new Date('2025-01-01T10:00:00Z'),
        end_time: new Date('2025-01-01T14:00:00Z'),
        severity: 7,
        pain_location: ['forehead', 'temples'],
        symptoms: ['nausea'],
        triggers: ['stress'],
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '400mg',
            time_taken: new Date('2025-01-01T10:30:00Z'),
            effectiveness: 3,
          },
        ],
        notes: 'Test episode',
      } as CreateEpisode;

      const mockUser = { id: 'user-1' };
      mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });

      const createdDbEpisode = {
        id: 'new-episode-id',
        user_id: 'user-1',
        start_time: '2025-01-01T10:00:00Z',
        end_time: '2025-01-01T14:00:00Z',
        severity: 7,
        pain_location: ['forehead', 'temples'],
        symptoms: ['nausea'],
        triggers: ['stress'],
        medications: ['{"name":"Ibuprofen","dosage":"400mg","time_taken":"2025-01-01T10:30:00Z","effectiveness":3}'],
        notes: 'Test episode',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      };

      mockSingle.mockResolvedValueOnce({ data: createdDbEpisode, error: null });

      const result = await episodeService.createEpisode(newEpisode);

      expect(mockGetUser).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith('episodes');
      expect(mockInsert).toHaveBeenCalled();
      expect(result.id).toBe('new-episode-id');
      expect(result.user_id).toBe('user-1');
    });

    it('should throw error when user not authenticated', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const newEpisode = {
        start_time: new Date('2025-01-01T10:00:00Z'),
        severity: 7,
        pain_location: ['forehead'],
        symptoms: [],
        triggers: [],
        medications: [],
      } as CreateEpisode;

      await expect(episodeService.createEpisode(newEpisode)).rejects.toThrow(
        'User not authenticated'
      );
    });

    it('should handle episode without end_time', async () => {
      const newEpisode = {
        start_time: new Date('2025-01-01T10:00:00Z'),
        end_time: null,
        severity: 5,
        pain_location: ['back_of_head'],
        symptoms: [],
        triggers: [],
        medications: [],
      } as CreateEpisode;

      const mockUser = { id: 'user-1' };
      mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });

      const createdDbEpisode = {
        id: 'new-id',
        user_id: 'user-1',
        start_time: '2025-01-01T10:00:00Z',
        end_time: null,
        severity: 5,
        pain_location: ['back_of_head'],
        symptoms: [],
        triggers: [],
        medications: [],
        notes: null,
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      };

      mockSingle.mockResolvedValueOnce({ data: createdDbEpisode, error: null });

      const result = await episodeService.createEpisode(newEpisode);
      expect(result.end_time).toBeNull();
    });
  });

  describe('updateEpisode', () => {
    it('should update an episode', async () => {
      const updates = {
        severity: 8,
        notes: 'Updated notes',
      };

      const updatedDbEpisode = {
        id: 'episode-1',
        user_id: 'user-1',
        start_time: '2025-01-01T10:00:00Z',
        end_time: '2025-01-01T14:00:00Z',
        severity: 8,
        pain_location: ['forehead'],
        symptoms: ['nausea'],
        triggers: ['stress'],
        medications: [],
        notes: 'Updated notes',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T11:00:00Z',
      };

      mockSingle.mockResolvedValueOnce({ data: updatedDbEpisode, error: null });

      const result = await episodeService.updateEpisode('episode-1', updates);

      expect(mockFrom).toHaveBeenCalledWith('episodes');
      expect(mockEq).toHaveBeenCalledWith('id', 'episode-1');
      expect(result.severity).toBe(8);
      expect(result.notes).toBe('Updated notes');
    });

    it('should update medications', async () => {
      const updates = {
        medications: [
          {
            name: 'Aspirin',
            dosage: '500mg',
            time_taken: new Date('2025-01-01T10:00:00Z'),
            effectiveness: 4,
          },
        ],
      };

      const updatedDbEpisode = {
        id: 'episode-1',
        user_id: 'user-1',
        start_time: '2025-01-01T10:00:00Z',
        end_time: null,
        severity: 7,
        pain_location: ['forehead'],
        symptoms: [],
        triggers: [],
        medications: ['{"name":"Aspirin","dosage":"500mg","time_taken":"2025-01-01T10:00:00Z","effectiveness":4}'],
        notes: null,
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T11:00:00Z',
      };

      mockSingle.mockResolvedValueOnce({ data: updatedDbEpisode, error: null });

      const result = await episodeService.updateEpisode('episode-1', updates);
      expect(result.medications).toHaveLength(1);
      expect(result.medications[0].name).toBe('Aspirin');
    });
  });

  describe('deleteEpisode', () => {
    it('should delete an episode', async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      await episodeService.deleteEpisode('episode-1');

      expect(mockFrom).toHaveBeenCalledWith('episodes');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'episode-1');
    });

    it('should throw error on delete failure', async () => {
      const error = new Error('Delete failed');
      mockEq.mockResolvedValueOnce({ error });

      await expect(episodeService.deleteEpisode('episode-1')).rejects.toThrow(
        'Delete failed'
      );
    });
  });

  describe('getEpisodeStats', () => {
    it('should throw not implemented error', async () => {
      await expect(episodeService.getEpisodeStats()).rejects.toThrow(
        'Not implemented'
      );
    });
  });
});
