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
    <div className="p-4 sm:p-5 lg:p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold truncate">
          {value}
        </p>
        {trend && (
          <span
            className={`text-xs sm:text-sm shrink-0 ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {displaySubtitle && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {displaySubtitle}
        </p>
      )}
    </div>
  );
};
