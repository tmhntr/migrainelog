import { createFileRoute } from '@tanstack/react-router';
import { useEpisodesQuery } from '@/hooks/useEpisodesQuery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Analysis Route (/analysis)
 *
 * Displays analytics and insights about migraine patterns
 */
export const Route = createFileRoute('/_authenticated/analysis')({
  component: Analysis,
});

function Analysis() {
  const { data: episodes, isLoading } = useEpisodesQuery();

  if (isLoading) {
    return <div>Loading analysis...</div>;
  }

  // Calculate statistics
  const totalEpisodes = episodes?.length ?? 0;
  const avgSeverity = episodes?.length
    ? (episodes.reduce((sum, ep) => sum + ep.severity, 0) / episodes.length).toFixed(1)
    : 0;

  // Find most common triggers
  const triggerCounts = new Map<string, number>();
  episodes?.forEach((episode) => {
    episode.triggers.forEach((trigger) => {
      triggerCounts.set(trigger, (triggerCounts.get(trigger) || 0) + 1);
    });
  });
  const topTriggers = Array.from(triggerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Find most common symptoms
  const symptomCounts = new Map<string, number>();
  episodes?.forEach((episode) => {
    episode.symptoms.forEach((symptom) => {
      symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1);
    });
  });
  const topSymptoms = Array.from(symptomCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Insights and patterns from your migraine data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>General statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Episodes
              </p>
              <p className="text-3xl font-bold">{totalEpisodes}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Average Severity
              </p>
              <p className="text-3xl font-bold">{avgSeverity}/10</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Common Triggers</CardTitle>
            <CardDescription>Your top triggers</CardDescription>
          </CardHeader>
          <CardContent>
            {topTriggers.length > 0 ? (
              <div className="space-y-3">
                {topTriggers.map(([trigger, count]) => (
                  <div key={trigger} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {trigger.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {count} {count === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Common Symptoms</CardTitle>
            <CardDescription>Your top symptoms</CardDescription>
          </CardHeader>
          <CardContent>
            {topSymptoms.length > 0 ? (
              <div className="space-y-3">
                {topSymptoms.map(([symptom, count]) => (
                  <div key={symptom} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {symptom.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {count} {count === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pain Patterns</CardTitle>
            <CardDescription>Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Advanced analytics and visualizations will be available here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
