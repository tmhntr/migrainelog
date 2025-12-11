import { useForm } from '@tanstack/react-form';
import { episodeSchema } from '@/utils/validation';
import type { EpisodeFormData, PainLocation, Symptom, Trigger } from '@/types/episode';
import { useCreateEpisodeMutation, useUpdateEpisodeMutation } from '@/hooks/useEpisodesQuery';
import { useState } from 'react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { zodFieldValidator } from '@/utils/zodValidator';
import { z } from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  FormFieldContext,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Episode Form Component
 *
 * Comprehensive form for creating and editing migraine episodes
 * with all required and optional fields including:
 * - Start/End time
 * - Severity (1-10)
 * - Pain location (multi-select)
 * - Symptoms (multi-select)
 * - Triggers (multi-select)
 * - Medications (dynamic array)
 * - Contributing factors
 * - Notes
 */

interface EpisodeFormProps {
  episodeId?: string;
  initialData?: Partial<EpisodeFormData>;
  onSuccess?: () => void;
}

// Constants for multi-select options
const PAIN_LOCATIONS: { value: PainLocation; label: string }[] = [
  { value: 'forehead', label: 'Forehead' },
  { value: 'temples', label: 'Temples' },
  { value: 'eyes', label: 'Behind Eyes' },
  { value: 'back_of_head', label: 'Back of Head' },
  { value: 'neck', label: 'Neck' },
  { value: 'top_of_head', label: 'Top of Head' },
  { value: 'left_side', label: 'Left Side' },
  { value: 'right_side', label: 'Right Side' },
  { value: 'jaw', label: 'Jaw' },
];

const SYMPTOMS: { value: Symptom; label: string }[] = [
  { value: 'nausea', label: 'Nausea' },
  { value: 'vomiting', label: 'Vomiting' },
  { value: 'light_sensitivity', label: 'Light Sensitivity' },
  { value: 'sound_sensitivity', label: 'Sound Sensitivity' },
  { value: 'visual_disturbances', label: 'Visual Disturbances' },
  { value: 'aura', label: 'Aura' },
  { value: 'dizziness', label: 'Dizziness' },
  { value: 'smell_sensitivity', label: 'Smell Sensitivity' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'confusion', label: 'Confusion' },
  { value: 'irritability', label: 'Irritability' },
];

const TRIGGERS: { value: Trigger; label: string }[] = [
  { value: 'stress', label: 'Stress' },
  { value: 'lack_of_sleep', label: 'Lack of Sleep' },
  { value: 'dehydration', label: 'Dehydration' },
  { value: 'weather_change', label: 'Weather Changes' },
  { value: 'bright_lights', label: 'Bright Lights' },
  { value: 'loud_noises', label: 'Loud Sounds' },
  { value: 'hormonal_changes', label: 'Hormonal Changes' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'caffeine', label: 'Caffeine' },
  { value: 'skipped_meal', label: 'Skipped Meal' },
  { value: 'strong_smells', label: 'Strong Smells' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'screen_time', label: 'Screen Time' },
];

export const EpisodeForm = ({ episodeId, initialData, onSuccess }: EpisodeFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const createMutation = useCreateEpisodeMutation();
  const updateMutation = useUpdateEpisodeMutation();

  const form = useForm({
    defaultValues: {
      start_time: initialData?.start_time || '',
      end_time: initialData?.end_time || '',
      severity: initialData?.severity || 5,
      pain_location: initialData?.pain_location || [],
      symptoms: initialData?.symptoms || [],
      triggers: initialData?.triggers || [],
      medications: initialData?.medications || [],
      notes: initialData?.notes || '',
      contributing_factors: {
        hours_of_sleep: initialData?.contributing_factors?.hours_of_sleep,
        water_intake_oz: initialData?.contributing_factors?.water_intake_oz,
        weather_conditions: initialData?.contributing_factors?.weather_conditions || '',
        stress_level: initialData?.contributing_factors?.stress_level,
      },
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null);
        setSubmitSuccess(null);

        // Validate with Zod
        const validatedData = episodeSchema.parse(value);

        // Convert medication time_taken strings to Date objects
        const episodeData = {
          ...validatedData,
          start_time: new Date(validatedData.start_time),
          end_time: validatedData.end_time ? new Date(validatedData.end_time) : undefined,
          medications: validatedData.medications.map(med => ({
            ...med,
            time_taken: new Date(med.time_taken),
          })),
        };

        if (episodeId) {
          await updateMutation.mutateAsync({
            id: episodeId,
            updates: episodeData,
          });
          setSubmitSuccess('Episode updated successfully!');
        } else {
          await createMutation.mutateAsync(episodeData);
          setSubmitSuccess('Episode created successfully!');
          form.reset();
        }

        onSuccess?.();
      } catch (error) {
        if (error instanceof z.ZodError) {
          setSubmitError(error.issues.map((e: { message: string }) => e.message).join(', '));
        } else {
          setSubmitError(error instanceof Error ? error.message : 'Failed to save episode');
        }
      }
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-8 max-w-3xl"
    >
      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {submitSuccess}
        </div>
      )}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {submitError}
        </div>
      )}

      {/* Required Fields Section */}
      <div className="space-y-6 border-b pb-6">
        <h3 className="text-lg font-semibold">Required Information</h3>

        {/* Start Time */}
        <form.Field
          name="start_time"
          validators={{
            onChange: zodFieldValidator(z.string().min(1, 'Start time is required')),
          }}
        >
          {(field) => (
            <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
              <FormItem>
                <FormLabel>Start Time *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormFieldContext.Provider>
          )}
        </form.Field>

        {/* Severity Slider */}
        <form.Field
          name="severity"
          validators={{
            onChange: zodFieldValidator(z.number().min(1).max(10)),
          }}
        >
          {(field) => (
            <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
              <FormItem>
                <FormLabel>Pain Severity: {field.state.value}/10 *</FormLabel>
                <FormControl>
                  <div className="pt-2">
                    <Slider
                      name="severity"
                      min={1}
                      max={10}
                      step={1}
                      value={[field.state.value]}
                      onValueChange={(vals) => field.handleChange(vals[0]!)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Mild</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                      <span>Extreme</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormFieldContext.Provider>
          )}
        </form.Field>

        {/* Pain Location Multi-Select */}
        <form.Field name="pain_location">
          {(field) => (
            <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
              <FormItem>
                <FormLabel>Pain Location *</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={PAIN_LOCATIONS}
                    selected={field.state.value}
                    onChange={(value) => field.handleChange(value as PainLocation[])}
                    placeholder="Select pain locations..."
                  />
                </FormControl>
                <FormDescription>Select all areas where you feel pain</FormDescription>
                <FormMessage />
              </FormItem>
            </FormFieldContext.Provider>
          )}
        </form.Field>
      </div>

      {/* Optional Fields Section */}
      <div className="space-y-6 border-b pb-6">
        <h3 className="text-lg font-semibold">Optional Details</h3>

        {/* End Time */}
        <form.Field name="end_time">
          {(field) => (
            <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </FormControl>
                <FormDescription>When did the migraine end?</FormDescription>
                <FormMessage />
              </FormItem>
            </FormFieldContext.Provider>
          )}
        </form.Field>

        {/* Symptoms Multi-Select */}
        <form.Field name="symptoms">
          {(field) => (
            <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
              <FormItem>
                <FormLabel>Symptoms</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={SYMPTOMS}
                    selected={field.state.value}
                    onChange={(value) => field.handleChange(value as Symptom[])}
                    placeholder="Select symptoms..."
                  />
                </FormControl>
                <FormDescription>What symptoms did you experience?</FormDescription>
                <FormMessage />
              </FormItem>
            </FormFieldContext.Provider>
          )}
        </form.Field>

        {/* Triggers Multi-Select */}
        <form.Field name="triggers">
          {(field) => (
            <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
              <FormItem>
                <FormLabel>Suspected Triggers</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={TRIGGERS}
                    selected={field.state.value}
                    onChange={(value) => field.handleChange(value as Trigger[])}
                    placeholder="Select possible triggers..."
                  />
                </FormControl>
                <FormDescription>What might have triggered this episode?</FormDescription>
                <FormMessage />
              </FormItem>
            </FormFieldContext.Provider>
          )}
        </form.Field>
      </div>

      {/* Medications Section */}
      <div className="space-y-6 border-b pb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Medications</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentMeds = form.getFieldValue('medications') || [];
              form.setFieldValue('medications', [
                ...currentMeds,
                {
                  name: '',
                  dosage: '',
                  time_taken: new Date().toISOString().slice(0, 16),
                  effectiveness: undefined,
                },
              ]);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>

        <form.Field name="medications" mode="array">
          {(field) => {
            const medications = field.state.value || [];
            return (
              <div className="space-y-4">
                {medications.map((_, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        const newMeds = medications.filter((_, i) => i !== index);
                        field.handleChange(newMeds);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>

                    <div className="grid grid-cols-2 gap-4">
                      <form.Field name={`medications[${index}].name`}>
                        {(subField) => (
                          <FormFieldContext.Provider value={{ name: subField.name, error: subField.state.meta.errors[0] }}>
                            <FormItem>
                              <FormLabel>Medication Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Ibuprofen"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(e.target.value)}
                                  onBlur={subField.handleBlur}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </FormFieldContext.Provider>
                        )}
                      </form.Field>

                      <form.Field name={`medications[${index}].dosage`}>
                        {(subField) => (
                          <FormFieldContext.Provider value={{ name: subField.name, error: subField.state.meta.errors[0] }}>
                            <FormItem>
                              <FormLabel>Dosage</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., 200mg"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(e.target.value)}
                                  onBlur={subField.handleBlur}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </FormFieldContext.Provider>
                        )}
                      </form.Field>

                      <form.Field name={`medications[${index}].time_taken`}>
                        {(subField) => (
                          <FormFieldContext.Provider value={{ name: subField.name, error: subField.state.meta.errors[0] }}>
                            <FormItem>
                              <FormLabel>Time Taken</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(e.target.value)}
                                  onBlur={subField.handleBlur}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </FormFieldContext.Provider>
                        )}
                      </form.Field>

                      <form.Field name={`medications[${index}].effectiveness`}>
                        {(subField) => (
                          <FormFieldContext.Provider value={{ name: subField.name, error: subField.state.meta.errors[0] }}>
                            <FormItem>
                              <FormLabel>Effectiveness (1-5)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={5}
                                  placeholder="1-5"
                                  value={subField.state.value ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    subField.handleChange(val === '' ? undefined : Number(val));
                                  }}
                                  onBlur={subField.handleBlur}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          </FormFieldContext.Provider>
                        )}
                      </form.Field>
                    </div>
                  </div>
                ))}

                {medications.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No medications added yet. Click "Add Medication" to track what you took.
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>
      </div>

      {/* Contributing Factors Section */}
      <div className="space-y-6 border-b pb-6">
        <h3 className="text-lg font-semibold">Contributing Factors</h3>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="contributing_factors.hours_of_sleep">
            {(field) => (
              <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
                <FormItem>
                  <FormLabel>Hours of Sleep</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      placeholder="e.g., 7"
                      value={field.state.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.handleChange(val === '' ? undefined : Number(val));
                      }}
                      onBlur={field.handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormFieldContext.Provider>
            )}
          </form.Field>

          <form.Field name="contributing_factors.water_intake_oz">
            {(field) => (
              <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
                <FormItem>
                  <FormLabel>Water Intake (oz)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g., 64"
                      value={field.state.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.handleChange(val === '' ? undefined : Number(val));
                      }}
                      onBlur={field.handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormFieldContext.Provider>
            )}
          </form.Field>

          <form.Field name="contributing_factors.weather_conditions">
            {(field) => (
              <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
                <FormItem>
                  <FormLabel>Weather Conditions</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Rainy, high pressure"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormFieldContext.Provider>
            )}
          </form.Field>

          <form.Field name="contributing_factors.stress_level">
            {(field) => (
              <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
                <FormItem>
                  <FormLabel>Stress Level (1-10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="1-10"
                      value={field.state.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.handleChange(val === '' ? undefined : Number(val));
                      }}
                      onBlur={field.handleBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormFieldContext.Provider>
            )}
          </form.Field>
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-6">
        <form.Field name="notes">
          {(field) => (
            <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional observations, patterns, or notes..."
                    className="min-h-[120px]"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </FormControl>
                <FormDescription>
                  Record any other details that might be helpful
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormFieldContext.Provider>
          )}
        </form.Field>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : episodeId ? 'Update Episode' : 'Save Episode'}
        </Button>
      </div>
    </form>
  );
};

// Multi-Select Component
interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelect = ({ options, selected, onChange, placeholder }: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Items */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return (
              <Badge key={value} variant="secondary" className="gap-1">
                {option?.label || value}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleRemove(value)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
