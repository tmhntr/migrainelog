import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';

/**
 * Authenticated Layout Route
 *
 * Protects all child routes requiring authentication.
 * Redirects to /login if user is not authenticated.
 */
export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = Route.useNavigate();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate({ to: '/login' });
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
