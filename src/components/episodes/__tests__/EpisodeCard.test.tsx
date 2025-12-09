import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { EpisodeCard } from '../EpisodeCard';
import type { Episode } from '@/types/episode';
import userEvent from '@testing-library/user-event';

// Mock date utilities
vi.mock('@/utils/date', () => ({
  formatDate: vi.fn((date: Date) => 'January 1st, 2025'),
  calculateDuration: vi.fn((start: Date, end: Date) => '4 hours'),
}));

describe('EpisodeCard', () => {
  const mockEpisode: Episode = {
    id: 'test-1',
    user_id: 'user-1',
    start_time: new Date('2025-01-01T10:00:00Z'),
    end_time: new Date('2025-01-01T14:00:00Z'),
    severity: 7,
    pain_location: ['forehead', 'temples'],
    symptoms: ['nausea', 'light_sensitivity'],
    triggers: ['stress', 'lack_of_sleep'],
    medications: [],
    notes: 'Test notes',
    created_at: new Date('2025-01-01T10:00:00Z'),
    updated_at: new Date('2025-01-01T10:00:00Z'),
  };

  it('should render episode date', () => {
    render(<EpisodeCard episode={mockEpisode} />);

    expect(screen.getByText('January 1st, 2025')).toBeInTheDocument();
  });

  it('should render episode duration', () => {
    render(<EpisodeCard episode={mockEpisode} />);

    expect(screen.getByText(/Duration: 4 hours/)).toBeInTheDocument();
  });

  it('should render severity', () => {
    render(<EpisodeCard episode={mockEpisode} />);

    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
  });

  it('should render ongoing for episode without end_time', () => {
    const ongoingEpisode: Episode = {
      ...mockEpisode,
      end_time: null,
    };

    render(<EpisodeCard episode={ongoingEpisode} />);

    expect(screen.getByText(/Duration: Ongoing/)).toBeInTheDocument();
  });

  it('should render triggers up to 3', () => {
    render(<EpisodeCard episode={mockEpisode} />);

    expect(screen.getByText('stress')).toBeInTheDocument();
    expect(screen.getByText('lack_of_sleep')).toBeInTheDocument();
  });

  it('should show "+X more" when more than 3 triggers', () => {
    const episodeWithManyTriggers: Episode = {
      ...mockEpisode,
      triggers: ['stress', 'lack_of_sleep', 'weather_change', 'caffeine', 'dehydration'],
    };

    render(<EpisodeCard episode={episodeWithManyTriggers} />);

    expect(screen.getByText('stress')).toBeInTheDocument();
    expect(screen.getByText('lack_of_sleep')).toBeInTheDocument();
    expect(screen.getByText('weather_change')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    expect(screen.queryByText('caffeine')).not.toBeInTheDocument();
    expect(screen.queryByText('dehydration')).not.toBeInTheDocument();
  });

  it('should not show "+X more" when exactly 3 triggers', () => {
    const episodeWith3Triggers: Episode = {
      ...mockEpisode,
      triggers: ['stress', 'lack_of_sleep', 'weather_change'],
    };

    render(<EpisodeCard episode={episodeWith3Triggers} />);

    expect(screen.getByText('stress')).toBeInTheDocument();
    expect(screen.getByText('lack_of_sleep')).toBeInTheDocument();
    expect(screen.getByText('weather_change')).toBeInTheDocument();
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it('should render without triggers', () => {
    const episodeNoTriggers: Episode = {
      ...mockEpisode,
      triggers: [],
    };

    render(<EpisodeCard episode={episodeNoTriggers} />);

    expect(screen.getByTestId('episode-card')).toBeInTheDocument();
    expect(screen.queryByText('stress')).not.toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<EpisodeCard episode={mockEpisode} onClick={handleClick} />);

    const card = screen.getByTestId('episode-card');
    await user.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not error when onClick is not provided', async () => {
    const user = userEvent.setup();

    render(<EpisodeCard episode={mockEpisode} />);

    const card = screen.getByTestId('episode-card');
    await user.click(card);

    // Should not throw error
    expect(card).toBeInTheDocument();
  });

  it('should have data-episode-card attribute', () => {
    render(<EpisodeCard episode={mockEpisode} />);

    const card = screen.getByTestId('episode-card');
    expect(card).toHaveAttribute('data-episode-card');
  });

  it('should apply cursor-pointer class', () => {
    render(<EpisodeCard episode={mockEpisode} />);

    const card = screen.getByTestId('episode-card');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('should render severity with correct styling for high severity', () => {
    const highSeverityEpisode: Episode = {
      ...mockEpisode,
      severity: 10,
    };

    render(<EpisodeCard episode={highSeverityEpisode} />);

    const severityText = screen.getByText('10/10');
    expect(severityText).toHaveClass('text-red-600');
  });

  it('should render severity with correct styling for low severity', () => {
    const lowSeverityEpisode: Episode = {
      ...mockEpisode,
      severity: 3,
    };

    render(<EpisodeCard episode={lowSeverityEpisode} />);

    const severityText = screen.getByText('3/10');
    expect(severityText).toHaveClass('text-red-600');
  });

  it('should render trigger badges with correct styling', () => {
    render(<EpisodeCard episode={mockEpisode} />);

    const stressBadge = screen.getByText('stress');
    expect(stressBadge).toHaveClass('bg-orange-100', 'text-orange-700');
  });
});
