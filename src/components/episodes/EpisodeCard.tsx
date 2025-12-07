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
      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      data-episode-card
      data-testid="episode-card"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold">{formatDate(episode.start_time)}</p>
          <p className="text-sm text-gray-600">Duration: {duration}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-red-600">{episode.severity}/10</p>
          <p className="text-xs text-gray-500">Severity</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {episode.triggers.slice(0, 3).map((trigger) => (
          <span
            key={trigger}
            className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded"
          >
            {trigger}
          </span>
        ))}
        {episode.triggers.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            +{episode.triggers.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
};
