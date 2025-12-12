import { expect, type Page } from '@playwright/test';
import type { TestEpisodeData } from './test-data';

/**
 * Custom Assertions for Episode Testing
 *
 * Higher-level assertions for verifying episode data in the UI
 */

/**
 * Assert that an episode card displays correct information
 */
export async function assertEpisodeCardData(
  page: Page,
  episodeData: Partial<TestEpisodeData>
) {
  // Check severity is displayed
  if (episodeData.severity !== undefined) {
    await expect(
      page.getByText(new RegExp(`severity.*${episodeData.severity}`, 'i'))
    ).toBeVisible();
  }

  // Check pain locations are displayed
  if (episodeData.painLocations && episodeData.painLocations.length > 0) {
    for (const location of episodeData.painLocations.slice(0, 2)) {
      // Check first couple
      const formattedLocation = formatPainLocation(location);
      await expect(page.getByText(formattedLocation)).toBeVisible();
    }
  }

  // Check that the episode exists in the list
  await expect(page.locator('[data-episode-card]').first()).toBeVisible();
}

/**
 * Assert that episode detail page shows correct information
 */
export async function assertEpisodeDetailData(
  page: Page,
  episodeData: TestEpisodeData
) {
  // Check severity
  await expect(
    page.getByText(new RegExp(`severity.*${episodeData.severity}`, 'i'))
  ).toBeVisible();

  // Check pain locations
  if (episodeData.painLocations.length > 0) {
    for (const location of episodeData.painLocations) {
      const formattedLocation = formatPainLocation(location);
      await expect(page.getByText(formattedLocation)).toBeVisible();
    }
  }

  // Check symptoms
  if (episodeData.symptoms && episodeData.symptoms.length > 0) {
    for (const symptom of episodeData.symptoms) {
      const formattedSymptom = formatSymptom(symptom);
      await expect(page.getByText(formattedSymptom)).toBeVisible();
    }
  }

  // Check triggers
  if (episodeData.triggers && episodeData.triggers.length > 0) {
    for (const trigger of episodeData.triggers) {
      const formattedTrigger = formatTrigger(trigger);
      await expect(page.getByText(formattedTrigger)).toBeVisible();
    }
  }

  // Check medications
  if (episodeData.medications && episodeData.medications.length > 0) {
    for (const medication of episodeData.medications) {
      await expect(page.getByText(medication.name)).toBeVisible();
      await expect(page.getByText(medication.dosage)).toBeVisible();
    }
  }

  // Check notes
  if (episodeData.notes) {
    await expect(page.getByText(episodeData.notes)).toBeVisible();
  }
}

/**
 * Assert that episode form is empty/reset
 */
export async function assertEpisodeFormEmpty(page: Page) {
  // Check that required fields are empty or at default values
  const startTimeInput = page.getByLabel('Start Time');
  await expect(startTimeInput).toHaveValue('');

  // Severity should be at default (5)
  const severityLabel = page.getByText(/Pain Severity.*\/10/);
  await expect(severityLabel).toBeVisible();
}

/**
 * Assert that an error message is displayed
 */
export async function assertErrorMessage(page: Page, errorText?: string) {
  if (errorText) {
    await expect(page.getByText(errorText)).toBeVisible();
  } else {
    // Check for any error message container
    await expect(
      page.locator('.bg-destructive, .bg-red-50, [role="alert"]').first()
    ).toBeVisible();
  }
}

/**
 * Assert that a success message is displayed
 */
export async function assertSuccessMessage(page: Page, successText?: string) {
  if (successText) {
    await expect(page.getByText(successText)).toBeVisible();
  } else {
    // Check for any success message container
    await expect(
      page.locator('.bg-green-50, [role="status"]').first()
    ).toBeVisible();
  }
}

/**
 * Assert that episodes list has a specific count
 */
export async function assertEpisodeCount(page: Page, count: number) {
  if (count === 0) {
    await expect(
      page.getByText(/no episodes recorded/i)
    ).toBeVisible();
  } else {
    const episodeCards = page.locator('[data-episode-card]');
    await expect(episodeCards).toHaveCount(count);
  }
}

/**
 * Assert that a confirmation dialog is visible
 */
export async function assertConfirmationDialog(
  page: Page,
  title?: string,
  description?: string
) {
  // Check for dialog
  await expect(page.getByRole('dialog')).toBeVisible();

  if (title) {
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  }

  if (description) {
    await expect(page.getByText(description)).toBeVisible();
  }
}

/**
 * Helper: Format pain location for display
 */
function formatPainLocation(location: string): string {
  const locationMap: Record<string, string> = {
    forehead: 'Forehead',
    temples: 'Temples',
    back_of_head: 'Back of Head',
    top_of_head: 'Top of Head',
    left_side: 'Left Side',
    right_side: 'Right Side',
    eyes: 'Behind Eyes',
    jaw: 'Jaw',
    neck: 'Neck',
  };
  return locationMap[location] || location;
}

/**
 * Helper: Format symptom for display
 */
function formatSymptom(symptom: string): string {
  const symptomMap: Record<string, string> = {
    nausea: 'Nausea',
    vomiting: 'Vomiting',
    light_sensitivity: 'Light Sensitivity',
    sound_sensitivity: 'Sound Sensitivity',
    smell_sensitivity: 'Smell Sensitivity',
    visual_disturbances: 'Visual Disturbances',
    aura: 'Aura',
    dizziness: 'Dizziness',
    fatigue: 'Fatigue',
    confusion: 'Confusion',
    irritability: 'Irritability',
  };
  return symptomMap[symptom] || symptom;
}

/**
 * Helper: Format trigger for display
 */
function formatTrigger(trigger: string): string {
  const triggerMap: Record<string, string> = {
    stress: 'Stress',
    lack_of_sleep: 'Lack of Sleep',
    weather_change: 'Weather Changes',
    bright_lights: 'Bright Lights',
    loud_noises: 'Loud Sounds',
    strong_smells: 'Strong Smells',
    alcohol: 'Alcohol',
    caffeine: 'Caffeine',
    dehydration: 'Dehydration',
    skipped_meal: 'Skipped Meal',
    hormonal_changes: 'Hormonal Changes',
    exercise: 'Exercise',
    screen_time: 'Screen Time',
  };
  return triggerMap[trigger] || trigger;
}
