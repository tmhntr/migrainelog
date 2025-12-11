import { createFileRoute } from '@tanstack/react-router';
import { useEpisodesQuery } from '@/hooks/useEpisodesQuery';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Dashboard Route (/)
 *
 * Main dashboard showing overview of migraine episodes,
 * statistics, and recent activity
 */
export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
});

function Dashboard() {
  const { data: episodes, isLoading } = useEpisodesQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalEpisodes = episodes?.length ?? 0;
  const avgSeverity = episodes?.length
    ? (episodes.reduce((sum, ep) => sum + ep.severity, 0) / episodes.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Overview of your migraine tracking
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Total Episodes"
          value={totalEpisodes}
          description="All time"
        />
        <StatCard
          title="Average Severity"
          value={avgSeverity}
          description="Out of 10"
        />
        <StatCard
          title="This Month"
          value={0}
          description="Episodes recorded"
        />
      </div>

      {/* Recent Episodes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Episodes</CardTitle>
          <CardDescription className="text-sm">Your most recent migraine episodes</CardDescription>
        </CardHeader>
        <CardContent>
          {episodes && episodes.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {episodes.slice(0, 5).map((episode) => (
                <div
                  key={episode.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 sm:pb-4 last:border-0 gap-2 sm:gap-0"
                >
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      {new Date(episode.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Severity: {episode.severity}/10
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {episode.triggers.slice(0, 2).map((trigger) => (
                      <span
                        key={trigger}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded"
                      >
                        {trigger}
                      </span>
                    ))}
                    {episode.triggers.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{episode.triggers.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm sm:text-base text-muted-foreground">No episodes recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
