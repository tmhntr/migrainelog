import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEpisodeQuery, useDeleteEpisodeMutation } from '@/hooks/useEpisodesQuery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Episode Detail Route (/episodes/:episodeId)
 *
 * Displays detailed information about a specific episode
 */
export const Route = createFileRoute('/_authenticated/episodes/$episodeId')({
  component: EpisodeDetail,
});

function EpisodeDetail() {
  const { episodeId } = Route.useParams();
  const navigate = useNavigate();
  const { data: episode, isLoading } = useEpisodeQuery(episodeId);
  const deleteMutation = useDeleteEpisodeMutation();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this episode?')) {
      await deleteMutation.mutateAsync(episodeId);
      navigate({ to: '/episodes' });
    }
  };

  if (isLoading) {
    return <div>Loading episode...</div>;
  }

  if (!episode) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Episode not found</p>
        <Button
          onClick={() => navigate({ to: '/episodes' })}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Episodes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate({ to: '/episodes' })}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Episodes
        </Button>
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="sm"
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div>
        <h1 className="text-4xl font-bold">
          Episode - {format(new Date(episode.start_time), 'PPP')}
        </h1>
        <p className="text-muted-foreground mt-2">
          Detailed information about this migraine episode
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>When the episode occurred</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Started</p>
              <p className="text-muted-foreground">
                {format(new Date(episode.start_time), 'PPp')}
              </p>
            </div>
            {episode.end_time && (
              <div>
                <p className="text-sm font-medium">Ended</p>
                <p className="text-muted-foreground">
                  {format(new Date(episode.end_time), 'PPp')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity</CardTitle>
            <CardDescription>Pain intensity level</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{episode.severity}/10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pain Locations</CardTitle>
            <CardDescription>Where you felt pain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {episode.pain_location.map((location) => (
                <span
                  key={location}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {location.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Symptoms</CardTitle>
            <CardDescription>Associated symptoms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {episode.symptoms.map((symptom) => (
                <span
                  key={symptom}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {symptom.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Triggers</CardTitle>
            <CardDescription>Potential causes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {episode.triggers.map((trigger) => (
                <span
                  key={trigger}
                  className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800"
                >
                  {trigger.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {episode.medications && episode.medications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
              <CardDescription>Treatment taken</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {episode.medications.map((med, index) => (
                  <div key={index} className="border-l-2 border-primary pl-3">
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    {med.effectiveness && (
                      <p className="text-sm text-muted-foreground">
                        Effectiveness: {med.effectiveness}/5
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {episode.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Additional information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {episode.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
