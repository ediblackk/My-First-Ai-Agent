import React from 'react';
import {
  render,
  expectLoadingState,
  expectEmptyState
} from '../../../tests/testUtils';
import UserStats from '../UserStats';

describe('UserStats', () => {
  const mockStats = {
    credits: 100,
    activeWishes: 5,
    totalWishes: 10
  };

  it('should render user stats correctly', () => {
    const { getByText } = render(
      <UserStats
        isLoading={false}
        error={null}
        stats={mockStats}
      />
    );

    // Verificare valori
    expect(getByText('100')).toBeInTheDocument();
    expect(getByText('5')).toBeInTheDocument();
    expect(getByText('10')).toBeInTheDocument();

    // Verificare labels
    expect(getByText('Credite:')).toBeInTheDocument();
    expect(getByText('Dorințe Active:')).toBeInTheDocument();
    expect(getByText('Total Dorințe:')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const { container } = render(
      <UserStats
        isLoading={true}
        error={null}
        stats={mockStats}
      />
    );

    expectLoadingState(container);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('should show error state', () => {
    const errorMessage = 'Failed to load stats';
    const { getByText } = render(
      <UserStats
        isLoading={false}
        error={errorMessage}
        stats={mockStats}
      />
    );

    expect(getByText(errorMessage)).toBeInTheDocument();
    expect(getByText(errorMessage)).toHaveClass('text-red-500', 'dark:text-red-400');
  });

  it('should use correct color classes for each stat', () => {
    const { container } = render(
      <UserStats
        isLoading={false}
        error={null}
        stats={mockStats}
      />
    );

    // Credits - blue
    const creditsValue = container.querySelector('.text-blue-600');
    expect(creditsValue).toHaveTextContent('100');
    expect(creditsValue).toHaveClass('dark:text-blue-400');

    // Active Wishes - green
    const activeWishesValue = container.querySelector('.text-green-600');
    expect(activeWishesValue).toHaveTextContent('5');
    expect(activeWishesValue).toHaveClass('dark:text-green-400');

    // Total Wishes - purple
    const totalWishesValue = container.querySelector('.text-purple-600');
    expect(totalWishesValue).toHaveTextContent('10');
    expect(totalWishesValue).toHaveClass('dark:text-purple-400');
  });

  it('should handle zero values', () => {
    const zeroStats = {
      credits: 0,
      activeWishes: 0,
      totalWishes: 0
    };

    const { getAllByText } = render(
      <UserStats
        isLoading={false}
        error={null}
        stats={zeroStats}
      />
    );

    const zeros = getAllByText('0');
    expect(zeros).toHaveLength(3);
    zeros.forEach(zero => {
      expect(zero).toBeVisible();
    });
  });

  it('should handle large numbers', () => {
    const largeStats = {
      credits: 1000000,
      activeWishes: 99999,
      totalWishes: 888888
    };

    const { getByText } = render(
      <UserStats
        isLoading={false}
        error={null}
        stats={largeStats}
      />
    );

    expect(getByText('1000000')).toBeInTheDocument();
    expect(getByText('99999')).toBeInTheDocument();
    expect(getByText('888888')).toBeInTheDocument();
  });

  it('should maintain layout with different number lengths', () => {
    const { rerender, container } = render(
      <UserStats
        isLoading={false}
        error={null}
        stats={{ credits: 1, activeWishes: 1, totalWishes: 1 }}
      />
    );

    const initialHeight = container.firstChild.clientHeight;

    rerender(
      <UserStats
        isLoading={false}
        error={null}
        stats={{ credits: 1000000, activeWishes: 99999, totalWishes: 888888 }}
      />
    );

    expect(container.firstChild.clientHeight).toBe(initialHeight);
  });

  it('should be accessible', () => {
    const { container } = render(
      <UserStats
        isLoading={false}
        error={null}
        stats={mockStats}
      />
    );

    // Verificare contrast text pentru labels
    const labels = container.querySelectorAll('.text-gray-600');
    labels.forEach(label => {
      expect(label).toHaveClass('dark:text-gray-400');
    });

    // Verificare contrast text pentru valori
    const values = container.querySelectorAll('.font-bold');
    values.forEach(value => {
      expect(value).toHaveClass(/text-.*-600/);
      expect(value).toHaveClass(/dark:text-.*-400/);
    });
  });

  it('should handle missing stats gracefully', () => {
    const { container } = render(
      <UserStats
        isLoading={false}
        error={null}
        stats={{}}
      />
    );

    const values = container.querySelectorAll('.font-bold');
    values.forEach(value => {
      expect(value).toHaveTextContent('0');
    });
  });

  it('should handle null stats gracefully', () => {
    const { container } = render(
      <UserStats
        isLoading={false}
        error={null}
        stats={null}
      />
    );

    const values = container.querySelectorAll('.font-bold');
    values.forEach(value => {
      expect(value).toHaveTextContent('0');
    });
  });

  it('should use flex layout for responsive design', () => {
    const { container } = render(
      <UserStats
        isLoading={false}
        error={null}
        stats={mockStats}
      />
    );

    expect(container.firstChild).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-6');
  });
});
