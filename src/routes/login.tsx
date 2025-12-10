import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { zodFieldValidator } from '@/utils/zodValidator';
import { signInSchema } from '@/utils/validation';
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
 * Login Route (/login)
 *
 * User authentication page with email/password login
 */
export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setLoading(true);

      try {
        // Validate with Zod
        const validatedData = signInSchema.parse(value);
        await signIn(validatedData.email, validatedData.password);
        navigate({ to: '/' });
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.issues[0]?.message || 'Validation failed');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to sign in');
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
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Migraine Log
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to track your migraine episodes
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
                        placeholder="Enter your password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        autoComplete="current-password"
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
