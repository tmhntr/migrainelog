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
    return <div>Loading dashboard...</div>;
  }

  const totalEpisodes = episodes?.length ?? 0;
  const avgSeverity = episodes?.length
    ? (episodes.reduce((sum, ep) => sum + ep.severity, 0) / episodes.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your migraine tracking
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Episodes</CardTitle>
          <CardDescription>Your most recent migraine episodes</CardDescription>
        </CardHeader>
        <CardContent>
          {episodes && episodes.length > 0 ? (
            <div className="space-y-4">
              {episodes.slice(0, 5).map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(episode.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Severity: {episode.severity}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No episodes recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
