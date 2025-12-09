import type { Episode } from '@/types/episode';

export const mockEpisode: Episode = {
  id: 'test-episode-1',
  user_id: 'test-user-1',
  start_time: new Date('2025-01-01T10:00:00Z'),
  end_time: new Date('2025-01-01T14:00:00Z'),
  severity: 7,
  pain_location: ['forehead', 'temples'],
  symptoms: ['nausea', 'light_sensitivity'],
  triggers: ['stress', 'lack_of_sleep'],
  medications: [
    {
      name: 'Ibuprofen',
      dosage: '400mg',
      time_taken: '2025-01-01T10:30:00Z',
      effectiveness: 3,
    },
  ],
  notes: 'Test episode notes',
  created_at: new Date('2025-01-01T10:00:00Z'),
  updated_at: new Date('2025-01-01T10:00:00Z'),
};

export const mockEpisodeMinimal: Episode = {
  id: 'test-episode-2',
  user_id: 'test-user-1',
  start_time: new Date('2025-01-02T08:00:00Z'),
  end_time: null,
  severity: 5,
  pain_location: ['back_of_head'],
  symptoms: [],
  triggers: [],
  medications: [],
  notes: null,
  created_at: new Date('2025-01-02T08:00:00Z'),
  updated_at: new Date('2025-01-02T08:00:00Z'),
};

export const mockEpisodes: Episode[] = [mockEpisode, mockEpisodeMinimal];
