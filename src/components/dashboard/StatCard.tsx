/**
 * Stat Card Component
 *
 * Card for displaying a single statistic on the dashboard
 */
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string; // Alternative to subtitle
  trend?: {
    value: number;
    positive: boolean;
  };
}

export const StatCard = ({ title, value, subtitle, description, trend }: StatCardProps) => {
  const displaySubtitle = subtitle || description;

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold">{value}</p>
        {trend && (
          <span
            className={`text-sm ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {displaySubtitle && <p className="text-sm text-gray-500 mt-1">{displaySubtitle}</p>}
    </div>
  );
};
