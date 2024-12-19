import React from 'react';
import {
  render,
  clickElement,
  typeIntoInput,
  mockApiSuccess,
  mockApiError,
  expectLoadingState,
  expectError,
  expectEmptyState
} from '../../../tests/testUtils';
import UsersSection from '../UsersSection';

describe('UsersSection', () => {
  const mockUsers = [
    {
      _id: 'user-1',
      publicKey: 'wallet-1',
      credits: 100,
      activeWishes: 2,
      totalWishes: 5,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: 'user-2',
      publicKey: 'wallet-2',
      credits: 50,
      activeWishes: 1,
      totalWishes: 3,
      createdAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  const mockPagination = {
    page: 1,
    limit: 10,
    total: 2,
    pages: 1
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should show loading state initially', () => {
      const { container } = render(<UsersSection />);
      expectLoadingState(container);
    });

    it('should load users on mount', async () => {
      mockApiSuccess('get', '/api/admin/users', {
        users: mockUsers,
        pagination: mockPagination
      });
      
      const { getByText } = render(<UsersSection />);
      
      await waitFor(() => {
        expect(getByText('wallet-1')).toBeInTheDocument();
        expect(getByText('wallet-2')).toBeInTheDocument();
      });
    });

    it('should show empty state when no users', async () => {
      mockApiSuccess('get', '/api/admin/users', {
        users: [],
        pagination: { ...mockPagination, total: 0, pages: 0 }
      });
      
      const { container } = render(<UsersSection />);
      
      await waitFor(() => {
        expectEmptyState(container, 'Nu există utilizatori');
      });
    });
  });

  describe('User List Display', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/users', {
        users: mockUsers,
        pagination: mockPagination
      });
    });

    it('should display user information', async () => {
      const { getByText } = render(<UsersSection />);
      
      await waitFor(() => {
        // Wallet
        expect(getByText('wallet-1')).toBeInTheDocument();
        // Credits
        expect(getByText('100')).toBeInTheDocument();
        // Active Wishes
        expect(getByText('2')).toBeInTheDocument();
        // Total Wishes
        expect(getByText('5')).toBeInTheDocument();
      });
    });

    it('should format dates correctly', async () => {
      const { getByText } = render(<UsersSection />);
      
      await waitFor(() => {
        expect(getByText('01/01/2024')).toBeInTheDocument();
        expect(getByText('02/01/2024')).toBeInTheDocument();
      });
    });

    it('should have modify credits button for each user', async () => {
      const { getAllByText } = render(<UsersSection />);
      
      await waitFor(() => {
        const modifyButtons = getAllByText('Modifică Credite');
        expect(modifyButtons).toHaveLength(mockUsers.length);
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter users by wallet', async () => {
      mockApiSuccess('get', '/api/admin/users', {
        users: mockUsers,
        pagination: mockPagination
      });

      const { getByPlaceholderText, getByText } = render(<UsersSection />);
      
      await waitFor(() => {
        const searchInput = getByPlaceholderText('Caută după wallet...');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = getByPlaceholderText('Caută după wallet...');
      await typeIntoInput(searchInput, 'wallet-1');
      
      // Mock filtered results
      mockApiSuccess('get', '/api/admin/users', {
        users: [mockUsers[0]],
        pagination: { ...mockPagination, total: 1 }
      });

      await waitFor(() => {
        expect(getByText('wallet-1')).toBeInTheDocument();
        expect(queryByText('wallet-2')).not.toBeInTheDocument();
      });
    });

    it('should debounce search input', async () => {
      vi.useFakeTimers();
      
      const { getByPlaceholderText } = render(<UsersSection />);
      
      await waitFor(() => {
        const searchInput = getByPlaceholderText('Caută după wallet...');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = getByPlaceholderText('Caută după wallet...');
      await typeIntoInput(searchInput, 'wall');
      await typeIntoInput(searchInput, 'walle');
      await typeIntoInput(searchInput, 'wallet');
      
      // Fast-forward debounce time
      vi.advanceTimersByTime(300);
      
      expect(api.get).toHaveBeenCalledTimes(2); // Initial load + final search
      
      vi.useRealTimers();
    });
  });

  describe('Credit Modification', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/users', {
        users: mockUsers,
        pagination: mockPagination
      });
    });

    it('should open credit modification modal', async () => {
      const { getByText, getAllByText } = render(<UsersSection />);
      
      await waitFor(() => {
        const modifyButtons = getAllByText('Modifică Credite');
        expect(modifyButtons[0]).toBeInTheDocument();
      });

      await clickElement(getAllByText('Modifică Credite')[0]);
      
      expect(getByText('Modificare Credite')).toBeInTheDocument();
      expect(getByText('wallet-1')).toBeInTheDocument();
    });

    it('should handle credit modification success', async () => {
      mockApiSuccess('post', '/api/admin/users/user-1/credits', {
        credits: 150
      });

      const { getByText, getAllByText, getByLabelText } = render(<UsersSection />);
      
      await waitFor(() => {
        const modifyButtons = getAllByText('Modifică Credite');
        expect(modifyButtons[0]).toBeInTheDocument();
      });

      // Open modal
      await clickElement(getAllByText('Modifică Credite')[0]);
      
      // Enter amount
      const amountInput = getByLabelText('Sumă');
      await typeIntoInput(amountInput, '50');
      
      // Enter reason
      const reasonInput = getByLabelText('Motiv');
      await typeIntoInput(reasonInput, 'Test credit modification');
      
      // Submit
      await clickElement(getByText('Salvare'));
      
      await waitFor(() => {
        expect(getByText('150')).toBeInTheDocument(); // Updated credits
      });
    });

    it('should handle credit modification error', async () => {
      mockApiError('post', '/api/admin/users/user-1/credits', 'Modification failed');

      const { getByText, getAllByText, getByLabelText, container } = render(<UsersSection />);
      
      await waitFor(() => {
        const modifyButtons = getAllByText('Modifică Credite');
        expect(modifyButtons[0]).toBeInTheDocument();
      });

      // Open modal
      await clickElement(getAllByText('Modifică Credite')[0]);
      
      // Enter amount
      const amountInput = getByLabelText('Sumă');
      await typeIntoInput(amountInput, '50');
      
      // Submit
      await clickElement(getByText('Salvare'));
      
      expectError(container, 'Modification failed');
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/users', {
        users: mockUsers,
        pagination: { ...mockPagination, pages: 3, total: 25 }
      });
    });

    it('should render pagination controls', async () => {
      const { getByText } = render(<UsersSection />);
      
      await waitFor(() => {
        expect(getByText('Anterior')).toBeInTheDocument();
        expect(getByText('Următor')).toBeInTheDocument();
        expect(getByText('Pagina 1 din 3')).toBeInTheDocument();
      });
    });

    it('should handle page changes', async () => {
      const { getByText } = render(<UsersSection />);
      
      await waitFor(() => {
        expect(getByText('Următor')).toBeInTheDocument();
      });

      // Mock next page data
      mockApiSuccess('get', '/api/admin/users', {
        users: mockUsers,
        pagination: { ...mockPagination, page: 2 }
      });

      await clickElement(getByText('Următor'));
      
      await waitFor(() => {
        expect(getByText('Pagina 2 din 3')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error on load failure', async () => {
      mockApiError('get', '/api/admin/users', 'Failed to load users');
      
      const { container } = render(<UsersSection />);
      
      await waitFor(() => {
        expectError(container, 'Failed to load users');
      });
    });

    it('should show refresh button on error', async () => {
      mockApiError('get', '/api/admin/users', 'Failed to load users');
      
      const { getByText } = render(<UsersSection />);
      
      await waitFor(() => {
        expect(getByText('Reîncearcă')).toBeInTheDocument();
      });

      // Mock successful retry
      mockApiSuccess('get', '/api/admin/users', {
        users: mockUsers,
        pagination: mockPagination
      });

      await clickElement(getByText('Reîncearcă'));
      
      await waitFor(() => {
        expect(getByText('wallet-1')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/users', {
        users: mockUsers,
        pagination: mockPagination
      });
    });

    it('should have accessible table structure', async () => {
      const { container } = render(<UsersSection />);
      
      await waitFor(() => {
        const table = container.querySelector('table');
        expect(table).toHaveAttribute('role', 'table');
        expect(table.querySelector('th')).toHaveAttribute('scope', 'col');
      });
    });

    it('should have proper button labels', async () => {
      const { getAllByText } = render(<UsersSection />);
      
      await waitFor(() => {
        const modifyButtons = getAllByText('Modifică Credite');
        modifyButtons.forEach(button => {
          expect(button).toHaveAttribute('aria-label');
        });
      });
    });
  });
});
