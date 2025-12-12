import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/**
 * Authenticated Layout Route
 *
 * Protects all child routes requiring authentication.
 * Redirects to /login if user is not authenticated.
 */
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/about" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { loading } = useAuth();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { name: "Dashboard", path: "/" },
    { name: "Logs", path: "/episodes" },
    { name: "Trends", path: "/analysis" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Tab Navigation */}
        <div className="flex justify-center py-4 sm:py-6">
          <div className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground">
            {tabs.map((tab) => {
              const isActive = currentPath === tab.path ||
                (tab.path === "/episodes" && currentPath.startsWith("/episodes"));

              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={cn(
                    "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-4 py-1 text-sm font-medium whitespace-nowrap transition-all",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground hover:bg-background/50"
                  )}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="py-4 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
