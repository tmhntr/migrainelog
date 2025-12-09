import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Total Episodes" value={42} />);

    expect(screen.getByText('Total Episodes')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render string value', () => {
    render(<StatCard title="Average Duration" value="3.5 hours" />);

    expect(screen.getByText('Average Duration')).toBeInTheDocument();
    expect(screen.getByText('3.5 hours')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <StatCard
        title="Total Episodes"
        value={42}
        subtitle="Last 30 days"
      />
    );

    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('should render description as alternative to subtitle', () => {
    render(
      <StatCard
        title="Total Episodes"
        value={42}
        description="This month's total"
      />
    );

    expect(screen.getByText("This month's total")).toBeInTheDocument();
  });

  it('should prefer subtitle over description when both provided', () => {
    render(
      <StatCard
        title="Total Episodes"
        value={42}
        subtitle="Last 30 days"
        description="This should not show"
      />
    );

    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.queryByText('This should not show')).not.toBeInTheDocument();
  });

  it('should render positive trend', () => {
    render(
      <StatCard
        title="Total Episodes"
        value={42}
        trend={{ value: 15, positive: true }}
      />
    );

    const trendElement = screen.getByText(/15%/);
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveClass('text-green-600');
    expect(trendElement.textContent).toContain('↑');
  });

  it('should render negative trend', () => {
    render(
      <StatCard
        title="Total Episodes"
        value={42}
        trend={{ value: -20, positive: false }}
      />
    );

    const trendElement = screen.getByText(/20%/);
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveClass('text-red-600');
    expect(trendElement.textContent).toContain('↓');
  });

  it('should handle negative trend value with absolute value', () => {
    render(
      <StatCard
        title="Episodes"
        value={30}
        trend={{ value: -10, positive: false }}
      />
    );

    // Should display absolute value (10) not -10
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });

  it('should render without optional props', () => {
    render(<StatCard title="Simple Stat" value={100} />);

    expect(screen.getByText('Simple Stat')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('should apply correct styling classes', () => {
    const { container } = render(
      <StatCard title="Test" value={1} />
    );

    const card = container.querySelector('.p-6');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white', 'border', 'rounded-lg', 'shadow-sm');
  });

  it('should render zero as value', () => {
    render(<StatCard title="Episodes Today" value={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle large numbers', () => {
    render(<StatCard title="Total Data Points" value={1000000} />);

    expect(screen.getByText('1000000')).toBeInTheDocument();
  });

  it('should render complete card with all props', () => {
    render(
      <StatCard
        title="Monthly Episodes"
        value={42}
        subtitle="Last 30 days"
        trend={{ value: 12.5, positive: true }}
      />
    );

    expect(screen.getByText('Monthly Episodes')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText(/12.5%/)).toBeInTheDocument();
  });
});
