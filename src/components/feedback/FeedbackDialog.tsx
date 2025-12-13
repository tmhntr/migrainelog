import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { feedbackSchema } from '@/utils/validation';
import { useCreateFeedbackMutation } from '@/hooks/useFeedbackQuery';
import { zodFieldValidator } from '@/utils/zodValidator';
import type { FeedbackType } from '@/types/feedback';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  FormFieldContext,
} from '@/components/ui/form';
import { MessageSquare } from 'lucide-react';

/**
 * Feedback Dialog Component
 *
 * Modal dialog for submitting feedback and feature requests
 */

const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'feedback', label: 'General Feedback' },
  { value: 'feature_request', label: 'Feature Request' },
];

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateFeedbackMutation();

  const form = useForm({
    defaultValues: {
      type: 'feedback' as FeedbackType,
      title: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync(value);
        setOpen(false);
        form.reset();
      } catch (error) {
        console.error('Error submitting feedback:', error);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Help us improve MigrainLog by sharing your feedback or requesting new features.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Feedback Type Field */}
          <form.Field
            name="type"
            validators={{
              onChange: zodFieldValidator(feedbackSchema.shape.type),
            }}
          >
            {(field) => (
              <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as FeedbackType)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FEEDBACK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose whether this is general feedback or a feature request
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormFieldContext.Provider>
            )}
          </form.Field>

          {/* Title Field */}
          <form.Field
            name="title"
            validators={{
              onChange: zodFieldValidator(feedbackSchema.shape.title),
            }}
          >
            {(field) => (
              <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief summary of your feedback"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </FormControl>
                  <FormDescription>
                    A short, descriptive title (3-200 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormFieldContext.Provider>
            )}
          </form.Field>

          {/* Description Field */}
          <form.Field
            name="description"
            validators={{
              onChange: zodFieldValidator(feedbackSchema.shape.description),
            }}
          >
            {(field) => (
              <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about your feedback or feature request..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={6}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description (10-5000 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormFieldContext.Provider>
            )}
          </form.Field>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>

          {createMutation.isError && (
            <div className="text-sm text-red-600">
              Error submitting feedback. Please try again.
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
