import React from 'react';
import {
  render,
  clickElement,
  mockApiSuccess,
  mockApiError,
  expectLoadingState,
  expectError
} from '../../../tests/testUtils';
import StatsSection from '../StatsSection';

// Mock pentru Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn(),
  registerables: []
}));

describe('StatsSection', () => {
  const mockStats = {
    users: 100,
    activeUsers: 50,
    totalCredits: [{ _id: null, total: 1000 }],
    wishStats: {
      total: 200,
      pending: 30,
      completed: 150,
      cancelled: 20
    },
    dailyStats: {
      users: [
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 }
      ],
      wishes: [
        { date: '2024-01-01', count: 20 },
        { date: '2024-01-02', count: 25 }
      ]
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should show loading state initially', () => {
      const { container } = render(<StatsSection />);
      expectLoadingState(container);
    });

    it('should load stats on mount', async () => {
      mockApiSuccess('get', '/api/admin/stats/overview', { stats: mockStats });
      
      const { getByText } = render(<StatsSection />);
      
      await waitFor(() => {
        expect(getByText('100')).toBeInTheDocument(); // Total users
        expect(getByText('50')).toBeInTheDocument(); // Active users
        expect(getByText('1000')).toBeInTheDocument(); // Total credits
      });
    });
  });

  describe('Stats Display', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/stats/overview', { stats: mockStats });
    });

    it('should render stat cards', async () => {
      const { getByText } = render(<StatsSection />);
      
      await waitFor(() => {
        expect(getByText('Total Utilizatori')).toBeInTheDocument();
        expect(getByText('Utilizatori Activi')).toBeInTheDocument();
        expect(getByText('Total Credite')).toBeInTheDocument();
      });
    });

    it('should render wish distribution', async () => {
      const { getByText } = render(<StatsSection />);
      
      await waitFor(() => {
        expect(getByText('Distribuție Dorințe')).toBeInTheDocument();
        expect(getByText('30')).toBeInTheDocument(); // Pending
        expect(getByText('150')).toBeInTheDocument(); // Completed
      });
    });

    it('should render trend charts', async () => {
      const { container } = render(<StatsSection />);
      
      await waitFor(() => {
        const charts = container.querySelectorAll('canvas');
        expect(charts).toHaveLength(2); // Users and Wishes trends
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should have refresh button', async () => {
      mockApiSuccess('get', '/api/admin/stats/overview', { stats: mockStats });
      
      const { getByText } = render(<StatsSection />);
      
      await waitFor(() => {
        expect(getByText('Reîmprospătare')).toBeInTheDocument();
      });
    });

    it('should refresh stats on button click', async () => {
      mockApiSuccess('get', '/api/admin/stats/overview', { stats: mockStats });
      
      const { getByText } = render(<StatsSection />);
      
      await waitFor(() => {
        expect(getByText('Reîmprospătare')).toBeInTheDocument();
      });

      // Mock updated stats
      const updatedStats = {
        ...mockStats,
        users: 110
      };
      mockApiSuccess('get', '/api/admin/stats/overview', { stats: updatedStats });

      await clickElement(getByText('Reîmprospătare'));
      
      await waitFor(() => {
        expect(getByText('110')).toBeInTheDocument();
      });
    });

    it('should handle auto-refresh interval', async () => {
      vi.useFakeTimers();
      mockApiSuccess('get', '/api/admin/stats/overview', { stats: mockStats });
      
      const { getByRole } = render(<StatsSection />);
      
      await waitFor(() => {
        const select = getByRole('combobox');
        expect(select).toBeInTheDocument();
      });

      // Change interval
      const select = getByRole('combobox');
      await userEvent.selectOptions(select, '10');

      // Fast-forward time
      vi.advanceTimersByTime(10000);

      expect(api.get).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should show error message on load failure', async () => {
      mockApiError('get', '/api/admin/stats/overview', 'Failed to load stats');
      
      const { container } = render(<StatsSection />);
      
      await waitFor(() => {
        expectError(container, 'Failed to load stats');
      });
    });

    it('should show retry button on error', async () => {
      mockApiError('get', '/api/admin/stats/overview', 'Failed to load stats');
      
      const { getByText } = render(<StatsSection />);
      
      await waitFor(() => {
        expect(getByText('Reîncearcă')).toBeInTheDocument();
      });
    });

    it('should handle partial data errors', async () => {
      const partialStats = {
        ...mockStats,
        dailyStats: null // Missing trend data
      };
      mockApiSuccess('get', '/api/admin/stats/overview', { stats: partialStats });
      
      const { getByText } = render(<StatsSection />);
      
      await waitFor(() => {
        expect(getByText('Date indisponibile')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/stats/overview', { stats: mockStats });
    });

    it('should adjust layout for mobile', async () => {
      window.innerWidth = 375;
      const { container } = render(<StatsSection />);
      
      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('grid-cols-1');
      });
    });

    it('should adjust layout for desktop', async () => {
      window.innerWidth = 1024;
      const { container } = render(<StatsSection />);
      
      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('lg:grid-cols-3');
      });
    });

    it('should resize charts on window resize', async () => {
      const { container } = render(<StatsSection />);
      
      await waitFor(() => {
        const charts = container.querySelectorAll('canvas');
        expect(charts).toHaveLength(2);
      });

      // Trigger resize
      window.innerWidth = 375;
      fireEvent(window, new Event('resize'));

      // Charts should maintain aspect ratio
      const charts = container.querySelectorAll('canvas');
      charts.forEach(chart => {
        expect(chart).toHaveStyle({ width: '100%' });
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/stats/overview', { stats: mockStats });
    });

    it('should have proper headings structure', async () => {
      const { getAllByRole } = render(<StatsSection />);
      
      await waitFor(() => {
        const headings = getAllByRole('heading');
        expect(headings[0]).toHaveAttribute('aria-level', '2');
      });
    });

    it('should have accessible charts', async () => {
      const { container } = render(<StatsSection />);
      
      await waitFor(() => {
        const charts = container.querySelectorAll('canvas');
        charts.forEach(chart => {
          expect(chart).toHaveAttribute('role', 'img');
          expect(chart).toHaveAttribute('aria-label');
        });
      });
    });

    it('should handle keyboard navigation', async () => {
      const { getByText, getByRole } = render(<StatsSection />);
      
      await waitFor(() => {
        const refreshButton = getByText('Reîmprospătare');
        const intervalSelect = getByRole('combobox');
        
        refreshButton.focus();
        expect(document.activeElement).toBe(refreshButton);
        
        userEvent.tab();
        expect(document.activeElement).toBe(intervalSelect);
      });
    });
  });
});
