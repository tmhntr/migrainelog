import { format, formatDistance, formatDuration, intervalToDuration } from 'date-fns';

/**
 * Date Utility Functions
 *
 * Common date formatting and manipulation functions
 */

export const formatDate = (date: Date, formatStr: string = 'PPP'): string => {
  return format(date, formatStr);
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'PPP p');
};

export const formatTimeAgo = (date: Date): string => {
  return formatDistance(date, new Date(), { addSuffix: true });
};

export const calculateDuration = (start: Date, end: Date): string => {
  const duration = intervalToDuration({ start, end });
  return formatDuration(duration, { format: ['hours', 'minutes'] });
};

export const getDurationInHours = (start: Date, end: Date): number => {
  const diff = end.getTime() - start.getTime();
  return diff / (1000 * 60 * 60);
};
