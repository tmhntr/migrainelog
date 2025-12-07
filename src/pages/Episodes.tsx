import { useEpisodes } from '@/hooks/useEpisodes';

/**
 * Episodes Page
 *
 * List view of all migraine episodes with filtering and sorting options
 */
export const Episodes = () => {
  const { episodes, loading } = useEpisodes();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Episodes</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Log New Episode
        </button>
      </div>

      {/* Episode list will go here */}
      <div className="space-y-4">
        {episodes.map((episode) => (
          <div key={episode.id} className="p-4 border rounded-lg">
            <p>Episode from {episode.start_time.toLocaleDateString()}</p>
            <p>Severity: {episode.severity}/10</p>
          </div>
        ))}
      </div>
    </div>
  );
};
