import type { Episode } from '@/types/episode';
import { formatDate, calculateDuration } from '@/utils/date';

/**
 * Episode Card Component
 *
 * Card display for a single episode in a list
 */
interface EpisodeCardProps {
  episode: Episode;
  onClick?: () => void;
}

export const EpisodeCard = ({ episode, onClick }: EpisodeCardProps) => {
  const duration = episode.end_time
    ? calculateDuration(episode.start_time, episode.end_time)
    : 'Ongoing';

  return (
    <div
      onClick={onClick}
      className="p-4 sm:p-5 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50 active:scale-[0.99]"
      data-episode-card
      data-testid="episode-card"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base sm:text-lg truncate">
            {formatDate(episode.start_time)}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Duration: {duration}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1 shrink-0">
          <p className="text-xl sm:text-2xl font-bold text-red-600">
            {episode.severity}/10
          </p>
          <p className="text-xs text-muted-foreground">Severity</p>
        </div>
      </div>

      {/* Symptoms Section */}
      {episode.symptoms.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">Symptoms:</p>
          <div className="flex flex-wrap gap-1.5">
            {episode.symptoms.slice(0, 3).map((symptom) => (
              <span
                key={symptom}
                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {symptom.replace(/_/g, ' ')}
              </span>
            ))}
            {episode.symptoms.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{episode.symptoms.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Triggers Section */}
      {episode.triggers.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Triggers:</p>
          <div className="flex flex-wrap gap-1.5">
            {episode.triggers.slice(0, 3).map((trigger) => (
              <span
                key={trigger}
                className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full"
              >
                {trigger.replace(/_/g, ' ')}
              </span>
            ))}
            {episode.triggers.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{episode.triggers.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {episode.symptoms.length === 0 && episode.triggers.length === 0 && (
        <p className="text-xs sm:text-sm text-muted-foreground italic">
          No symptoms or triggers recorded
        </p>
      )}
    </div>
  );
};
