import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { episodeSchema } from '@/utils/validation';
import type { EpisodeFormData, PainLocation, Symptom, Trigger } from '@/types/episode';
import { useCreateEpisodeMutation, useUpdateEpisodeMutation } from '@/hooks/useEpisodesQuery';
import { useState } from 'react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

  const form = useForm<EpisodeFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(episodeSchema) as any,
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
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medications',
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: EpisodeFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);

      // Convert medication time_taken strings to Date objects
      const episodeData = {
        ...data,
        start_time: new Date(data.start_time),
        end_time: data.end_time ? new Date(data.end_time) : undefined,
        medications: data.medications.map(med => ({
          ...med,
          time_taken: new Date(med.time_taken),
        })),
      };

      if (episodeId) {
        await updateMutation.mutateAsync({
          id: episodeId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updates: episodeData as any,
        });
        setSubmitSuccess('Episode updated successfully!');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await createMutation.mutateAsync(episodeData as any);
        setSubmitSuccess('Episode created successfully!');
        form.reset();
      }

      onSuccess?.();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save episode');
    }
  };

  return (
    <Form {...form}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8 max-w-3xl">
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
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time *</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Severity Slider */}
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pain Severity: {field.value}/10 *</FormLabel>
                <FormControl>
                  <div className="pt-2">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
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
            )}
          />

          {/* Pain Location Multi-Select */}
          <FormField
            control={form.control}
            name="pain_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pain Location *</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={PAIN_LOCATIONS}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select pain locations..."
                  />
                </FormControl>
                <FormDescription>Select all areas where you feel pain</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Optional Fields Section */}
        <div className="space-y-6 border-b pb-6">
          <h3 className="text-lg font-semibold">Optional Details</h3>

          {/* End Time */}
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>When did the migraine end?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Symptoms Multi-Select */}
          <FormField
            control={form.control}
            name="symptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symptoms</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={SYMPTOMS}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select symptoms..."
                  />
                </FormControl>
                <FormDescription>What symptoms did you experience?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Triggers Multi-Select */}
          <FormField
            control={form.control}
            name="triggers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suspected Triggers</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={TRIGGERS}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select possible triggers..."
                  />
                </FormControl>
                <FormDescription>What might have triggered this episode?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Medications Section */}
        <div className="space-y-6 border-b pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Medications</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  name: '',
                  dosage: '',
                  time_taken: new Date().toISOString().slice(0, 16),
                  effectiveness: undefined,
                })
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => remove(index)}
                >
                  <X className="w-4 h-4" />
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`medications.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Ibuprofen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`medications.${index}.dosage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 200mg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`medications.${index}.time_taken`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Taken</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`medications.${index}.effectiveness`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effectiveness (1-5)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            placeholder="1-5"
                            {...field}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === '' ? undefined : Number(val));
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No medications added yet. Click "Add Medication" to track what you took.
              </p>
            )}
          </div>
        </div>

        {/* Contributing Factors Section */}
        <div className="space-y-6 border-b pb-6">
          <h3 className="text-lg font-semibold">Contributing Factors</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contributing_factors.hours_of_sleep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours of Sleep</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      placeholder="e.g., 7"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? undefined : Number(val));
                      }}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contributing_factors.water_intake_oz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water Intake (oz)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g., 64"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? undefined : Number(val));
                      }}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contributing_factors.weather_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weather Conditions</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Rainy, high pressure" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contributing_factors.stress_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stress Level (1-10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="1-10"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? undefined : Number(val));
                      }}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional observations, patterns, or notes..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Record any other details that might be helpful
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : episodeId ? 'Update Episode' : 'Save Episode'}
          </Button>
        </div>
      </form>
    </Form>
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
