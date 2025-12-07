import { useEpisodes } from '@/hooks/useEpisodes';

/**
 * Dashboard Page
 *
 * Main dashboard showing overview of migraine episodes,
 * statistics, and recent activity
 */
export const Dashboard = () => {
  const { episodes, loading } = useEpisodes();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats cards will go here */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm text-gray-500">Total Episodes</h3>
          <p className="text-2xl font-bold">{episodes.length}</p>
        </div>
      </div>

      {/* Charts and visualizations will go here */}
    </div>
  );
};
