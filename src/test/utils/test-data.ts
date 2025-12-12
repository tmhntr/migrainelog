import type { PainLocation, Symptom, Trigger } from '../../types/episode';

/**
 * Test Data for E2E Tests
 *
 * Mock episode data and test fixtures
 */

export interface TestEpisodeData {
  startTime: string; // datetime-local format: YYYY-MM-DDTHH:mm
  endTime?: string;
  severity: number;
  painLocations: PainLocation[];
  symptoms: Symptom[];
  triggers: Trigger[];
  medications: {
    name: string;
    dosage: string;
    timeTaken: string;
    effectiveness?: number;
  }[];
  contributingFactors?: {
    hoursOfSleep?: number;
    waterIntakeOz?: number;
    weatherConditions?: string;
    stressLevel?: number;
  };
  notes?: string;
}

/**
 * Generate a datetime-local string for a given offset in hours from now
 */
function getDateTimeLocal(hoursOffset: number = 0): string {
  const date = new Date();
  date.setHours(date.getHours() + hoursOffset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Basic episode with minimal required fields
 */
export const minimalEpisode: TestEpisodeData = {
  startTime: getDateTimeLocal(-2), // 2 hours ago
  severity: 5,
  painLocations: ['forehead'],
  symptoms: [],
  triggers: [],
  medications: [],
};

/**
 * Complete episode with all fields filled
 */
export const completeEpisode: TestEpisodeData = {
  startTime: getDateTimeLocal(-4), // 4 hours ago
  endTime: getDateTimeLocal(-1), // 1 hour ago
  severity: 8,
  painLocations: ['forehead', 'temples', 'eyes'],
  symptoms: [
    'nausea',
    'light_sensitivity',
    'sound_sensitivity',
    'visual_disturbances',
  ],
  triggers: ['stress', 'lack_of_sleep', 'bright_lights'],
  medications: [
    {
      name: 'Ibuprofen',
      dosage: '400mg',
      timeTaken: getDateTimeLocal(-3),
      effectiveness: 3,
    },
    {
      name: 'Acetaminophen',
      dosage: '500mg',
      timeTaken: getDateTimeLocal(-2),
      effectiveness: 4,
    },
  ],
  contributingFactors: {
    hoursOfSleep: 5,
    waterIntakeOz: 32,
    weatherConditions: 'Rainy, low pressure',
    stressLevel: 8,
  },
  notes: 'Very intense episode. Started during work meeting. Had to leave early.',
};

/**
 * Severe episode
 */
export const severeEpisode: TestEpisodeData = {
  startTime: getDateTimeLocal(-6),
  endTime: getDateTimeLocal(-2),
  severity: 10,
  painLocations: ['forehead', 'temples', 'back_of_head', 'neck'],
  symptoms: [
    'nausea',
    'vomiting',
    'light_sensitivity',
    'sound_sensitivity',
    'dizziness',
  ],
  triggers: ['weather_change', 'stress', 'dehydration'],
  medications: [
    {
      name: 'Sumatriptan',
      dosage: '50mg',
      timeTaken: getDateTimeLocal(-5),
      effectiveness: 4,
    },
  ],
  contributingFactors: {
    hoursOfSleep: 4,
    waterIntakeOz: 20,
    stressLevel: 9,
  },
  notes: 'Worst migraine in months. Unable to function for several hours.',
};

/**
 * Mild episode
 */
export const mildEpisode: TestEpisodeData = {
  startTime: getDateTimeLocal(-1),
  severity: 3,
  painLocations: ['temples'],
  symptoms: ['light_sensitivity'],
  triggers: ['caffeine', 'screen_time'],
  medications: [],
  notes: 'Mild headache, manageable without medication.',
};

/**
 * Episode with hormonal trigger
 */
export const hormonalEpisode: TestEpisodeData = {
  startTime: getDateTimeLocal(-12),
  endTime: getDateTimeLocal(-6),
  severity: 7,
  painLocations: ['left_side', 'temples'],
  symptoms: ['nausea', 'light_sensitivity', 'irritability'],
  triggers: ['hormonal_changes', 'stress'],
  medications: [
    {
      name: 'Naproxen',
      dosage: '500mg',
      timeTaken: getDateTimeLocal(-11),
      effectiveness: 3,
    },
  ],
  contributingFactors: {
    hoursOfSleep: 7,
    waterIntakeOz: 64,
    stressLevel: 6,
  },
  notes: 'Monthly pattern continues.',
};

/**
 * Get a random episode from predefined episodes
 */
export function getRandomEpisode(): TestEpisodeData {
  const episodes = [
    completeEpisode,
    severeEpisode,
    mildEpisode,
    hormonalEpisode,
  ];
  return episodes[Math.floor(Math.random() * episodes.length)];
}

/**
 * Generate multiple episodes for list testing
 */
export function generateMultipleEpisodes(count: number): TestEpisodeData[] {
  const episodes: TestEpisodeData[] = [];

  for (let i = 0; i < count; i++) {
    episodes.push({
      startTime: getDateTimeLocal(-24 * (i + 1)), // One per day going back
      severity: Math.floor(Math.random() * 10) + 1,
      painLocations: ['forehead', 'temples'].slice(0, Math.floor(Math.random() * 2) + 1) as PainLocation[],
      symptoms: ['nausea', 'light_sensitivity'].slice(0, Math.floor(Math.random() * 2)) as Symptom[],
      triggers: ['stress', 'lack_of_sleep'].slice(0, Math.floor(Math.random() * 2)) as Trigger[],
      medications: [],
      notes: `Test episode ${i + 1}`,
    });
  }

  return episodes;
}
