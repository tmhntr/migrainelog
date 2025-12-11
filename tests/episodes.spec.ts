import { test, expect } from "@playwright/test";
import { generateTestUser, signUp } from "./utils/auth-helpers";
import {
  minimalEpisode,
  completeEpisode,
  severeEpisode,
} from "./utils/test-data";
import type { TestEpisodeData } from "./utils/test-data";

/**
 * Episode CRUD Operations E2E Tests
 *
 * Tests for episode management including:
 * - Creating episodes with all fields
 * - Viewing episode list
 * - Viewing episode detail
 * - Editing episodes
 * - Deleting episodes
 * - Form validation
 */

/**
 * Helper function to set slider value using keyboard navigation
 * Slider has min=1, max=10, step=1, default=5
 */
async function setSliderValue(slider: any, targetValue: number) {
  // Focus the slider
  await slider.focus();
  // Press Home to go to minimum value (1)
  await slider.press("Home");
  // Press ArrowRight (targetValue - 1) times to reach target
  const steps = targetValue - 1;
  for (let i = 0; i < steps; i++) {
    await slider.press("ArrowRight");
  }
}

test.describe("Episodes", () => {
  test.beforeEach(async ({ page }) => {
    // Create and login a test user before each test
    const testUser = generateTestUser();
    await signUp(page, testUser);

    // Navigate to episodes page
    await page.goto("/episodes");
    await expect(page.getByRole("heading", { name: "Episodes" })).toBeVisible();
  });

  test("should show empty state when no episodes exist", async ({ page }) => {
    // Verify empty state message
    await expect(page.getByText(/no episodes recorded/i)).toBeVisible();

    // Verify "Create your first episode" button exists
    await expect(
      page.getByRole("button", { name: /create your first episode/i }),
    ).toBeVisible();
  });

  test("should open episode creation dialog", async ({ page }) => {
    // Click the "New Episode" button
    await page.getByRole("button", { name: /new episode/i }).click();

    // Verify dialog is open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "New Episode" }),
    ).toBeVisible();
    await expect(
      page.getByText("Record details about your migraine episode"),
    ).toBeVisible();
  });

  test("should create a minimal episode with required fields only", async ({
    page,
  }) => {
    // Open the episode creation dialog
    await page.getByRole("button", { name: /new episode/i }).click();

    // Fill in required fields only
    await page.getByLabel("Start Time").fill(minimalEpisode.startTime);

    // Set severity using slider
    const severitySlider = page.getByRole("slider");
    await setSliderValue(severitySlider, minimalEpisode.severity);

    // Select pain location
    await page.getByRole("combobox").first().click();
    await page.getByText("Forehead").click();
    // Close the combobox
    await page.keyboard.press("Escape");

    // Submit the form
    await page.getByRole("button", { name: /save episode/i }).click();

    // Wait for dialog to close and episode to appear in list
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });

    // Verify the episode appears in the list by checking for the severity display
    await expect(page.getByText(`${minimalEpisode.severity}/10`)).toBeVisible({ timeout: 5000 });
  });

  test("should create a complete episode with all fields", async ({ page }) => {
    // Open the episode creation dialog
    await page.getByRole("button", { name: /new episode/i }).click();

    await fillEpisodeForm(page, completeEpisode);

    // Submit the form
    await page.getByRole("button", { name: /save episode/i }).click();

    // Wait for success message
    await expect(page.getByText(/episode created successfully/i)).toBeVisible({
      timeout: 10000,
    });

    // Close the dialog
    await page.keyboard.press("Escape");

    // Verify the episode appears in the list
    await expect(page.locator("[data-episode-card]").first()).toBeVisible({
      timeout: 5000,
    });

    // Verify severity is displayed
    await expect(
      page.getByText(new RegExp(completeEpisode.severity.toString())),
    ).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    // Open the episode creation dialog
    await page.getByRole("button", { name: /new episode/i }).click();

    // Try to submit without filling required fields
    await page.getByRole("button", { name: /save episode/i }).click();

    // Check for validation messages (browser native or custom)
    // The form should not submit and we should still be in the dialog
    await expect(page.getByRole("dialog")).toBeVisible();

    // Start time should be required
    const startTimeInput = page.getByLabel("Start Time");
    await expect(startTimeInput).toBeVisible();
  });

  test("should view episode list with multiple episodes", async ({ page }) => {
    // Create multiple episodes
    await createEpisode(page, minimalEpisode);
    await createEpisode(page, severeEpisode);

    // Navigate to episodes page
    await page.goto("/episodes");

    // Verify multiple episodes are displayed
    const episodeCards = page.locator("[data-episode-card]");
    await expect(episodeCards).toHaveCount(2, { timeout: 5000 });
  });

  test("should navigate to episode detail page", async ({ page }) => {
    // Create an episode
    await createEpisode(page, completeEpisode);

    // Click on the episode card to view details
    await page.locator("[data-episode-card]").first().click();

    // Verify we're on the detail page
    // The URL should contain /episodes/[id]
    await page.waitForURL(/\/episodes\/[a-zA-Z0-9-]+/, { timeout: 5000 });

    // Verify episode details are visible
    await expect(
      page.getByText(new RegExp(completeEpisode.severity.toString())),
    ).toBeVisible();
  });

  test("should edit an existing episode", async ({ page }) => {
    // Create an episode
    await createEpisode(page, minimalEpisode);

    // Click on the episode to view details
    await page.locator("[data-episode-card]").first().click();

    // Wait for detail page to load
    await page.waitForURL(/\/episodes\/[a-zA-Z0-9-]+/);

    // Look for edit button
    const editButton = page.getByRole("button", { name: /edit/i });
    await expect(editButton).toBeVisible({ timeout: 5000 });
    await editButton.click();

    // Verify edit form is shown (could be a dialog or inline)
    // Update the severity
    const severitySlider = page.getByRole("slider");
    await setSliderValue(severitySlider, 8);

    // Add a note
    const notesTextarea = page.getByLabel(/additional notes/i);
    if (await notesTextarea.isVisible()) {
      await notesTextarea.fill("Updated episode with additional information.");
    }

    // Submit the update
    await page.getByRole("button", { name: /update episode/i }).click();

    // Wait for success message
    await expect(page.getByText(/episode updated successfully/i)).toBeVisible({
      timeout: 10000,
    });

    // Verify the updated information is displayed
    await expect(page.getByText("8")).toBeVisible();
  });

  test("should delete an episode with confirmation", async ({ page }) => {
    // Create an episode
    await createEpisode(page, minimalEpisode);

    // Click on the episode to view details
    await page.locator("[data-episode-card]").first().click();

    // Wait for detail page to load
    await page.waitForURL(/\/episodes\/[a-zA-Z0-9-]+/);

    // Look for delete button
    const deleteButton = page.getByRole("button", { name: /delete/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    await deleteButton.click();

    // Verify confirmation dialog appears
    await expect(page.getByRole("dialog")).toBeVisible();

    // Look for confirmation in the dialog
    const confirmButton = page
      .getByRole("button", { name: /delete|confirm/i })
      .last();
    await confirmButton.click();

    // Wait for redirect back to episodes list
    await page.waitForURL("/episodes", { timeout: 10000 });

    // Verify empty state (assuming this was the only episode)
    await expect(page.getByText(/no episodes recorded/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should cancel episode deletion", async ({ page }) => {
    // Create an episode
    await createEpisode(page, minimalEpisode);

    // Click on the episode to view details
    await page.locator("[data-episode-card]").first().click();

    // Wait for detail page to load
    await page.waitForURL(/\/episodes\/[a-zA-Z0-9-]+/);

    // Look for delete button
    const deleteButton = page.getByRole("button", { name: /delete/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    await deleteButton.click();

    // Verify confirmation dialog appears
    await expect(page.getByRole("dialog")).toBeVisible();

    // Click cancel
    const cancelButton = page.getByRole("button", { name: /cancel/i });
    await cancelButton.click();

    // Verify we're still on the detail page
    expect(page.url()).toContain("/episodes/");
    expect(page.url()).not.toBe("/episodes");
  });

  test("should add and remove medications dynamically", async ({ page }) => {
    // Open the episode creation dialog
    await page.getByRole("button", { name: /new episode/i }).click();

    // Fill required fields
    await page.getByLabel("Start Time").fill(minimalEpisode.startTime);
    const severitySlider = page.getByRole("slider");
    await setSliderValue(severitySlider, minimalEpisode.severity);
    await page.getByRole("combobox").first().click();
    await page.getByText("Forehead").click();
    await page.keyboard.press("Escape");

    // Add a medication
    await page.getByRole("button", { name: /add medication/i }).click();

    // Fill medication details
    const medNameInput = page.getByLabel("Medication Name").first();
    await medNameInput.fill("Ibuprofen");

    const dosageInput = page.getByLabel("Dosage").first();
    await dosageInput.fill("400mg");

    // Verify medication is added
    await expect(medNameInput).toHaveValue("Ibuprofen");

    // Add another medication
    await page.getByRole("button", { name: /add medication/i }).click();

    // Verify we now have 2 medication sections
    const medicationSections = page.getByLabel("Medication Name");
    await expect(medicationSections).toHaveCount(2);

    // Remove the first medication
    const removeButtons = page
      .getByRole("button")
      .filter({ hasText: "" })
      .filter({
        has: page.locator("svg"),
      });
    await removeButtons.first().click();

    // Verify we're back to 1 medication
    await expect(page.getByLabel("Medication Name")).toHaveCount(1);
  });

  test("should filter/select multiple pain locations", async ({ page }) => {
    // Open the episode creation dialog
    await page.getByRole("button", { name: /new episode/i }).click();

    // Open pain location selector
    await page.getByRole("combobox").first().click();

    // Select multiple locations
    await page.getByText("Forehead").click();
    await page.getByText("Temples").click();
    await page.getByText("Behind Eyes").click();

    // Close the selector
    await page.keyboard.press("Escape");

    // Verify selections are shown (should see badges or tags)
    await expect(page.getByText("Forehead")).toBeVisible();
    await expect(page.getByText("Temples")).toBeVisible();
    await expect(page.getByText("Behind Eyes")).toBeVisible();
  });

  test("should handle episode with end time", async ({ page }) => {
    // Open the episode creation dialog
    await page.getByRole("button", { name: /new episode/i }).click();

    // Fill in episode with start and end time
    await page.getByLabel("Start Time").fill(completeEpisode.startTime);
    await page.getByLabel("End Time").fill(completeEpisode.endTime!);

    const severitySlider = page.getByRole("slider");
    await setSliderValue(severitySlider, completeEpisode.severity);

    await page.getByRole("combobox").first().click();
    await page.getByText("Forehead").click();
    await page.keyboard.press("Escape");

    // Submit
    await page.getByRole("button", { name: /save episode/i }).click();

    // Wait for success
    await expect(page.getByText(/episode created successfully/i)).toBeVisible({
      timeout: 10000,
    });

    // Close dialog
    await page.keyboard.press("Escape");

    // Verify episode was created
    await expect(page.locator("[data-episode-card]").first()).toBeVisible();
  });
});

/**
 * Helper function to fill the episode form with all fields
 */
async function fillEpisodeForm(page: any, episodeData: TestEpisodeData) {
  // Start Time
  await page.getByLabel("Start Time").fill(episodeData.startTime);

  // End Time (if provided)
  if (episodeData.endTime) {
    await page.getByLabel("End Time").fill(episodeData.endTime);
  }

  // Severity
  const severitySlider = page.getByRole("slider");
  await setSliderValue(severitySlider, episodeData.severity);

  // Pain Locations
  if (episodeData.painLocations.length > 0) {
    await page.getByRole("combobox").first().click();
    for (const location of episodeData.painLocations) {
      const formattedLocation = formatPainLocation(location);
      await page.getByText(formattedLocation).click();
    }
    await page.keyboard.press("Escape");
  }

  // Symptoms
  if (episodeData.symptoms && episodeData.symptoms.length > 0) {
    await page.getByRole("combobox", { name: /select symptoms/i }).click();
    for (const symptom of episodeData.symptoms) {
      const formattedSymptom = formatSymptom(symptom);
      await page.getByText(formattedSymptom).click();
    }
    await page.keyboard.press("Escape");
  }

  // Triggers
  if (episodeData.triggers && episodeData.triggers.length > 0) {
    await page
      .getByRole("combobox", { name: /select possible triggers/i })
      .click();
    for (const trigger of episodeData.triggers) {
      const formattedTrigger = formatTrigger(trigger);
      await page.getByText(formattedTrigger).click();
    }
    await page.keyboard.press("Escape");
  }

  // Medications
  if (episodeData.medications && episodeData.medications.length > 0) {
    for (let i = 0; i < episodeData.medications.length; i++) {
      const medication = episodeData.medications[i];

      // Add medication
      await page.getByRole("button", { name: /add medication/i }).click();

      // Fill medication details (use nth to handle multiple medications)
      const medNameInputs = page.getByLabel("Medication Name");
      await medNameInputs.nth(i).fill(medication.name);

      const dosageInputs = page.getByLabel("Dosage");
      await dosageInputs.nth(i).fill(medication.dosage);

      const timeTakenInputs = page.getByLabel("Time Taken");
      await timeTakenInputs.nth(i).fill(medication.timeTaken);

      if (medication.effectiveness) {
        const effectivenessInputs = page.getByLabel(/effectiveness/i);
        await effectivenessInputs
          .nth(i)
          .fill(medication.effectiveness.toString());
      }
    }
  }

  // Contributing Factors
  if (episodeData.contributingFactors) {
    if (episodeData.contributingFactors.hoursOfSleep) {
      await page
        .getByLabel("Hours of Sleep")
        .fill(episodeData.contributingFactors.hoursOfSleep.toString());
    }

    if (episodeData.contributingFactors.waterIntakeOz) {
      await page
        .getByLabel("Water Intake (oz)")
        .fill(episodeData.contributingFactors.waterIntakeOz.toString());
    }

    if (episodeData.contributingFactors.weatherConditions) {
      await page
        .getByLabel("Weather Conditions")
        .fill(episodeData.contributingFactors.weatherConditions);
    }

    if (episodeData.contributingFactors.stressLevel) {
      await page
        .getByLabel("Stress Level (1-10)")
        .fill(episodeData.contributingFactors.stressLevel.toString());
    }
  }

  // Notes
  if (episodeData.notes) {
    await page.getByLabel(/additional notes/i).fill(episodeData.notes);
  }
}

/**
 * Helper function to create an episode quickly
 */
async function createEpisode(page: any, episodeData: TestEpisodeData) {
  await page.goto("/episodes");
  await page.getByRole("button", { name: /new episode/i }).click();
  await fillEpisodeForm(page, episodeData);
  await page.getByRole("button", { name: /save episode/i }).click();

  // Verify dialog closes and episode appears in list
  await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
  await expect(page.getByText(`${episodeData.severity}/10`)).toBeVisible({ timeout: 5000 });
}

// Format helpers (same as in assertions.ts)
function formatPainLocation(location: string): string {
  const map: Record<string, string> = {
    forehead: "Forehead",
    temples: "Temples",
    back_of_head: "Back of Head",
    top_of_head: "Top of Head",
    left_side: "Left Side",
    right_side: "Right Side",
    eyes: "Behind Eyes",
    jaw: "Jaw",
    neck: "Neck",
  };
  return map[location] || location;
}

function formatSymptom(symptom: string): string {
  const map: Record<string, string> = {
    nausea: "Nausea",
    vomiting: "Vomiting",
    light_sensitivity: "Light Sensitivity",
    sound_sensitivity: "Sound Sensitivity",
    smell_sensitivity: "Smell Sensitivity",
    visual_disturbances: "Visual Disturbances",
    aura: "Aura",
    dizziness: "Dizziness",
    fatigue: "Fatigue",
    confusion: "Confusion",
    irritability: "Irritability",
  };
  return map[symptom] || symptom;
}

function formatTrigger(trigger: string): string {
  const map: Record<string, string> = {
    stress: "Stress",
    lack_of_sleep: "Lack of Sleep",
    weather_change: "Weather Changes",
    bright_lights: "Bright Lights",
    loud_noises: "Loud Sounds",
    strong_smells: "Strong Smells",
    alcohol: "Alcohol",
    caffeine: "Caffeine",
    dehydration: "Dehydration",
    skipped_meal: "Skipped Meal",
    hormonal_changes: "Hormonal Changes",
    exercise: "Exercise",
    screen_time: "Screen Time",
  };
  return map[trigger] || trigger;
}
