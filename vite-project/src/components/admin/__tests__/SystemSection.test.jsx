import React from 'react';
import {
  render,
  clickElement,
  mockApiSuccess,
  mockApiError,
  expectLoadingState,
  expectError
} from '../../../tests/testUtils';
import SystemSection from '../SystemSection';

describe('SystemSection', () => {
  const mockSystemLogs = [
    {
      _id: 'log-1',
      action: 'SERVER_START',
      details: { version: '1.0.0' },
      timestamp: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: 'log-2',
      action: 'CONFIG_CHANGE',
      details: { key: 'AI_MODEL', value: 'gpt-4' },
      adminPublicKey: 'admin-wallet',
      timestamp: '2024-01-01T00:01:00.000Z'
    }
  ];

  const mockAuditLogs = [
    {
      _id: 'audit-1',
      action: 'USER_CREDIT_MODIFY',
      details: {
        userId: 'user-1',
        amount: 100,
        reason: 'Bonus'
      },
      adminPublicKey: 'admin-wallet',
      timestamp: '2024-01-01T00:02:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should show loading state initially', () => {
      const { container } = render(<SystemSection />);
      expectLoadingState(container);
    });

    it('should load system logs on mount', async () => {
      mockApiSuccess('get', '/api/admin/logs', {
        logs: mockSystemLogs,
        pagination: { total: 2, pages: 1 }
      });
      
      const { getByText } = render(<SystemSection />);
      
      await waitFor(() => {
        expect(getByText('SERVER_START')).toBeInTheDocument();
        expect(getByText('CONFIG_CHANGE')).toBeInTheDocument();
      });
    });
  });

  describe('Log Display', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/logs', {
        logs: mockSystemLogs,
        pagination: { total: 2, pages: 1 }
      });
    });

    it('should format timestamps correctly', async () => {
      const { getByText } = render(<SystemSection />);
      
      await waitFor(() => {
        expect(getByText('01/01/2024 00:00:00')).toBeInTheDocument();
      });
    });

    it('should display log details', async () => {
      const { getByText } = render(<SystemSection />);
      
      await waitFor(() => {
        expect(getByText('version: 1.0.0')).toBeInTheDocument();
        expect(getByText('AI_MODEL: gpt-4')).toBeInTheDocument();
      });
    });

    it('should show admin info when available', async () => {
      const { getByText } = render(<SystemSection />);
      
      await waitFor(() => {
        expect(getByText('admin-wallet')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/logs', {
        logs: mockSystemLogs,
        pagination: { total: 2, pages: 1 }
      });
    });

    it('should switch between system and audit logs', async () => {
      const { getByText } = render(<SystemSection />);
      
      await waitFor(() => {
        expect(getByText('Loguri Sistem')).toBeInTheDocument();
        expect(getByText('Audit Trail')).toBeInTheDocument();
      });

      // Switch to audit logs
      mockApiSuccess('get', '/api/admin/logs/audit', {
        logs: mockAuditLogs,
        pagination: { total: 1, pages: 1 }
      });

      await clickElement(getByText('Audit Trail'));
      
      await waitFor(() => {
        expect(getByText('USER_CREDIT_MODIFY')).toBeInTheDocument();
      });
    });

    it('should highlight active tab', async () => {
      const { getByText } = render(<SystemSection />);
      
      await waitFor(() => {
        const systemTab = getByText('Loguri Sistem');
        expect(systemTab).toHaveClass('border-blue-500', 'text-blue-600');
      });
    });
  });

  describe('Auto Refresh', () => {
    it('should handle auto refresh toggle', async () => {
      vi.useFakeTimers();
      mockApiSuccess('get', '/api/admin/logs', {
        logs: mockSystemLogs,
        pagination: { total: 2, pages: 1 }
      });

      const { getByRole } = render(<SystemSection />);
      
      await waitFor(() => {
        const checkbox = getByRole('checkbox', { name: 'Auto Refresh' });
        expect(checkbox).toBeInTheDocument();
      });

      const checkbox = getByRole('checkbox', { name: 'Auto Refresh' });
      await clickElement(checkbox);
      
      // Fast-forward refresh interval
      vi.advanceTimersByTime(30000);
      
      expect(api.get).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });

    it('should update refresh interval', async () => {
      vi.useFakeTimers();
      mockApiSuccess('get', '/api/admin/logs', {
        logs: mockSystemLogs,
        pagination: { total: 2, pages: 1 }
      });

      const { getByRole } = render(<SystemSection />);
      
      await waitFor(() => {
        const checkbox = getByRole('checkbox', { name: 'Auto Refresh' });
        expect(checkbox).toBeInTheDocument();
      });

      // Enable auto refresh
      const checkbox = getByRole('checkbox', { name: 'Auto Refresh' });
      await clickElement(checkbox);
      
      // Change interval
      const select = getByRole('combobox');
      await userEvent.selectOptions(select, '10');
      
      // Fast-forward new interval
      vi.advanceTimersByTime(10000);
      
      expect(api.get).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });
  });

  describe('Manual Refresh', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/logs', {
        logs: mockSystemLogs,
        pagination: { total: 2, pages: 1 }
      });
    });

    it('should refresh logs on button click', async () => {
      const { getByText } = render(<SystemSection />);
      
      await waitFor(() => {
        expect(getByText('Reîmprospătare')).toBeInTheDocument();
      });

      // Mock updated logs
      const updatedLogs = [
        ...mockSystemLogs,
        {
          _id: 'log-3',
          action: 'NEW_LOG',
          timestamp: '2024-01-01T00:03:00.000Z'
        }
      ];

      mockApiSuccess('get', '/api/admin/logs', {
        logs: updatedLogs,
        pagination: { total: 3, pages: 1 }
      });

      await clickElement(getByText('Reîmprospătare'));
      
      await waitFor(() => {
        expect(getByText('NEW_LOG')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error on load failure', async () => {
      mockApiError('get', '/api/admin/logs', 'Failed to load logs');
      
      const { container } = render(<SystemSection />);
      
      await waitFor(() => {
        expectError(container, 'Failed to load logs');
      });
    });

    it('should handle refresh error', async () => {
      mockApiSuccess('get', '/api/admin/logs', {
        logs: mockSystemLogs,
        pagination: { total: 2, pages: 1 }
      });

      const { getByText, container } = render(<SystemSection />);
      
      await waitFor(() => {
        expect(getByText('Reîmprospătare')).toBeInTheDocument();
      });

      mockApiError('get', '/api/admin/logs', 'Refresh failed');
      await clickElement(getByText('Reîmprospătare'));
      
      await waitFor(() => {
        expectError(container, 'Refresh failed');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/logs', {
        logs: mockSystemLogs,
        pagination: { total: 2, pages: 1 }
      });
    });

    it('should have proper ARIA labels', async () => {
      const { getByRole } = render(<SystemSection />);
      
      await waitFor(() => {
        expect(getByRole('tablist')).toBeInTheDocument();
        expect(getByRole('tab', { name: 'Loguri Sistem' })).toBeInTheDocument();
        expect(getByRole('tab', { name: 'Audit Trail' })).toBeInTheDocument();
      });
    });

    it('should handle keyboard navigation', async () => {
      const { getByRole } = render(<SystemSection />);
      
      await waitFor(() => {
        const systemTab = getByRole('tab', { name: 'Loguri Sistem' });
        systemTab.focus();
        expect(document.activeElement).toBe(systemTab);
        
        userEvent.tab();
        expect(document.activeElement).toBe(
          getByRole('tab', { name: 'Audit Trail' })
        );
      });
    });
  });
});
