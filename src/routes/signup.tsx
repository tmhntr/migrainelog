import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { zodFieldValidator } from '@/utils/zodValidator';
import { signUpSchema } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormFieldContext,
} from '@/components/ui/form';
import { z } from 'zod';

/**
 * Signup Route (/signup)
 *
 * User registration page with email/password signup
 */
export const Route = createFileRoute('/signup')({
  component: Signup,
});

function Signup() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setLoading(true);

      try {
        // Validate with Zod
        const validatedData = signUpSchema.parse(value);
        await signUp(validatedData.email, validatedData.password);
        navigate({ to: '/' });
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.issues[0]?.message || 'Validation failed');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to sign up');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // Redirect if already logged in
  if (user) {
    navigate({ to: '/' });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 pb-4 sm:pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Start tracking your migraine episodes today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field
              name="email"
              validators={{
                onChange: zodFieldValidator(z.string().email('Invalid email address')),
              }}
            >
              {(field) => (
                <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormFieldContext.Provider>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: zodFieldValidator(z.string().min(6, 'Password must be at least 6 characters')),
              }}
            >
              {(field) => (
                <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormFieldContext.Provider>
              )}
            </form.Field>

            <form.Field
              name="confirmPassword"
              validators={{
                onChangeListenTo: ['password'],
                onChange: ({ value, fieldApi }) => {
                  const password = fieldApi.form.getFieldValue('password');
                  if (value !== password) {
                    return "Passwords don't match";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <FormFieldContext.Provider value={{ name: field.name, error: field.state.meta.errors[0] }}>
                  <FormItem>
                    <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormFieldContext.Provider>
              )}
            </form.Field>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
