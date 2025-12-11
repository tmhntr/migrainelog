import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';

/**
 * Root Route Layout
 *
 * Provides global context providers:
 * - QueryClientProvider for TanStack Query
 * - AuthProvider for authentication state
 */
export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        {import.meta.env.DEV && (
          <>
            <ReactQueryDevtools initialIsOpen={false} />
            <TanStackRouterDevtools position="bottom-right" />
          </>
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}
