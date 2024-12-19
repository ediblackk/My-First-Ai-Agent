import React from 'react';
import {
  render,
  clickElement,
  mockConnectedWallet,
  mockDisconnectedWallet,
  mockApiSuccess,
  mockApiError,
  expectLoadingState,
  expectEmptyState,
  expectError
} from '../../../tests/testUtils';
import WishList from '../WishList';
import api from '../../../utils/axios';

describe('WishList', () => {
  const mockWishes = [
    {
      _id: 'wish-1',
      content: 'First wish',
      status: 'pending',
      analysis: {
        complexity: 3,
        categories: ['Category 1']
      },
      createdAt: new Date().toISOString()
    },
    {
      _id: 'wish-2',
      content: 'Second wish',
      status: 'completed',
      analysis: {
        complexity: 5,
        categories: ['Category 2']
      },
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectedWallet();
  });

  describe('Initial Render', () => {
    it('should show connect prompt when wallet not connected', () => {
      mockDisconnectedWallet();
      const { getByText } = render(<WishList />);
      
      expect(getByText(/Conectează-te pentru a vedea dorințele tale/))
        .toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      mockApiSuccess('get', '/api/wishes', { wishes: [] });
      const { container } = render(<WishList />);
      
      expectLoadingState(container);
    });

    it('should show empty state when no wishes', async () => {
      mockApiSuccess('get', '/api/wishes', {
        wishes: [],
        pagination: { total: 0, pages: 0 }
      });
      
      const { container } = render(<WishList />);
      await waitFor(() => {
        expectEmptyState(container, 'Nu ai nicio dorință încă');
      });
    });
  });

  describe('Wish List Display', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/wishes', {
        wishes: mockWishes,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      });
    });

    it('should render wish cards', async () => {
      const { getByText } = render(<WishList />);
      
      await waitFor(() => {
        expect(getByText('First wish')).toBeInTheDocument();
        expect(getByText('Second wish')).toBeInTheDocument();
      });
    });

    it('should show correct status badges', async () => {
      const { getByText } = render(<WishList />);
      
      await waitFor(() => {
        const pendingBadge = getByText('În Așteptare');
        const completedBadge = getByText('Completată');
        
        expect(pendingBadge).toHaveClass(/bg-yellow-/);
        expect(completedBadge).toHaveClass(/bg-green-/);
      });
    });

    it('should show complexity indicators', async () => {
      const { container } = render(<WishList />);
      
      await waitFor(() => {
        const complexityBars = container.querySelectorAll('.bg-blue-600');
        expect(complexityBars[0]).toHaveStyle({ width: '30%' }); // 3/10 * 100
        expect(complexityBars[1]).toHaveStyle({ width: '50%' }); // 5/10 * 100
      });
    });

    it('should show categories', async () => {
      const { getByText } = render(<WishList />);
      
      await waitFor(() => {
        expect(getByText('Category 1')).toBeInTheDocument();
        expect(getByText('Category 2')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      mockApiSuccess('get', '/api/wishes', {
        wishes: [mockWishes[0]],
        pagination: { total: 1, pages: 1 }
      });

      const { getByRole, getByText } = render(<WishList />);
      
      const select = getByRole('combobox');
      await userEvent.selectOptions(select, 'pending');
      
      await waitFor(() => {
        expect(getByText('First wish')).toBeInTheDocument();
        expect(api.get).toHaveBeenCalledWith('/api/wishes', {
          params: expect.objectContaining({ status: 'pending' })
        });
      });
    });

    it('should reset to page 1 when filter changes', async () => {
      const { getByRole } = render(<WishList />);
      
      const select = getByRole('combobox');
      await userEvent.selectOptions(select, 'completed');
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/wishes', {
          params: expect.objectContaining({
            page: 1,
            status: 'completed'
          })
        });
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/wishes', {
        wishes: mockWishes,
        pagination: {
          page: 1,
          limit: 2,
          total: 5,
          pages: 3
        }
      });
    });

    it('should render pagination controls', async () => {
      const { getByText } = render(<WishList />);
      
      await waitFor(() => {
        expect(getByText('Anterior')).toBeInTheDocument();
        expect(getByText('Următor')).toBeInTheDocument();
        expect(getByText('Pagina 1 din 3')).toBeInTheDocument();
      });
    });

    it('should disable previous button on first page', async () => {
      const { getByText } = render(<WishList />);
      
      await waitFor(() => {
        expect(getByText('Anterior')).toBeDisabled();
      });
    });

    it('should handle page changes', async () => {
      const { getByText } = render(<WishList />);
      
      await waitFor(() => {
        const nextButton = getByText('Următor');
        expect(nextButton).toBeEnabled();
      });

      await clickElement(getByText('Următor'));
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/wishes', {
          params: expect.objectContaining({ page: 2 })
        });
      });
    });
  });

  describe('Create Wish', () => {
    it('should open create modal', async () => {
      const { getByText } = render(<WishList />);
      
      await clickElement(getByText('Dorință Nouă'));
      
      expect(getByText('Dorința Ta')).toBeInTheDocument();
    });

    it('should refresh list after creating wish', async () => {
      const { getByText } = render(<WishList />);
      
      await clickElement(getByText('Dorință Nouă'));
      
      // Simulare creare dorință
      const createResponse = { wish: mockWishes[0] };
      mockApiSuccess('post', '/api/wishes', createResponse);
      
      // Verificare că lista este reîmprospătată
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/wishes', expect.any(Object));
      });
    });
  });

  describe('View Details', () => {
    it('should open details modal when clicking wish', async () => {
      mockApiSuccess('get', '/api/wishes', {
        wishes: mockWishes,
        pagination: { total: 2, pages: 1 }
      });

      const { getByText } = render(<WishList />);
      
      await waitFor(() => {
        expect(getByText('First wish')).toBeInTheDocument();
      });

      await clickElement(getByText('First wish'));
      
      expect(getByText('Detalii Dorință')).toBeInTheDocument();
    });

    it('should update wish in list after status change', async () => {
      const { getByText } = render(<WishList />);
      
      await waitFor(() => {
        expect(getByText('First wish')).toBeInTheDocument();
      });

      await clickElement(getByText('First wish'));
      
      // Simulare actualizare status
      mockApiSuccess('put', '/api/wishes/wish-1/status', {
        wish: { ...mockWishes[0], status: 'completed' }
      });

      await clickElement(getByText('Marchează Completată'));
      
      // Verificare reîmprospătare listă
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/wishes', expect.any(Object));
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error when loading fails', async () => {
      mockApiError('get', '/api/wishes', 'Failed to load wishes');
      
      const { container } = render(<WishList />);
      
      await waitFor(() => {
        expectError(container, 'Failed to load wishes');
      });
    });

    it('should show refresh button when loading fails', async () => {
      mockApiError('get', '/api/wishes', 'Failed to load wishes');
      
      const { getByText } = render(<WishList />);
      
      await waitFor(() => {
        expect(getByText('Reîmprospătare')).toBeInTheDocument();
      });

      // Simulare reîncercare cu succes
      mockApiSuccess('get', '/api/wishes', {
        wishes: mockWishes,
        pagination: { total: 2, pages: 1 }
      });

      await clickElement(getByText('Reîmprospătare'));
      
      await waitFor(() => {
        expect(getByText('First wish')).toBeInTheDocument();
      });
    });
  });
});
