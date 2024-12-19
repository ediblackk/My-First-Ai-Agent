import React from 'react';
import {
  render,
  clickElement,
  mockConnectedWallet,
  mockApiSuccess,
  mockApiError,
  expectLoadingState,
  expectError
} from '../../../tests/testUtils';
import WishDetails from '../WishDetails';

describe('WishDetails', () => {
  const mockWish = {
    _id: 'test-wish-id',
    content: 'Test wish content',
    status: 'pending',
    analysis: {
      complexity: 5,
      categories: ['Test Category'],
      challenges: ['Test Challenge'],
      suggestions: ['Test Suggestion'],
      resources: {
        timeEstimate: '1 day',
        skillsRequired: ['Test Skill'],
        toolsNeeded: ['Test Tool']
      }
    },
    solution: {
      steps: [{
        order: 1,
        description: 'Test Step',
        timeEstimate: '1 hour',
        dependencies: []
      }],
      timeline: '1 day',
      resources: ['Test Resource'],
      risks: [{
        description: 'Test Risk',
        mitigation: 'Test Mitigation'
      }],
      successCriteria: ['Test Criteria']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockOnUpdateStatus = vi.fn();
  const defaultProps = {
    wish: mockWish,
    onUpdateStatus: mockOnUpdateStatus
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectedWallet();
  });

  describe('Basic Rendering', () => {
    it('should render wish content', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      expect(getByText(mockWish.content)).toBeInTheDocument();
    });

    it('should render status badge', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      const statusBadge = getByText('În Așteptare');
      expect(statusBadge).toHaveClass(/bg-yellow-/);
    });

    it('should render timestamps', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      expect(getByText(/Creată la:/)).toBeInTheDocument();
    });
  });

  describe('Analysis Section', () => {
    it('should render complexity meter', () => {
      const { container } = render(<WishDetails {...defaultProps} />);
      const complexityBar = container.querySelector('.bg-blue-600');
      expect(complexityBar).toHaveStyle({ width: '50%' }); // 5/10 * 100
    });

    it('should render categories', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      expect(getByText('Test Category')).toBeInTheDocument();
    });

    it('should render challenges', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      expect(getByText('Test Challenge')).toBeInTheDocument();
    });

    it('should render resources', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      expect(getByText('Test Skill')).toBeInTheDocument();
      expect(getByText('1 day')).toBeInTheDocument();
    });
  });

  describe('Solution Section', () => {
    it('should render implementation steps', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      expect(getByText('Test Step')).toBeInTheDocument();
      expect(getByText('1 hour')).toBeInTheDocument();
    });

    it('should render timeline', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      expect(getByText('1 day')).toBeInTheDocument();
    });

    it('should render risks and mitigation', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      expect(getByText('Test Risk')).toBeInTheDocument();
      expect(getByText('Test Mitigation')).toBeInTheDocument();
    });

    it('should render success criteria', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      expect(getByText('Test Criteria')).toBeInTheDocument();
    });
  });

  describe('Status Updates', () => {
    it('should show status update buttons for pending wishes', () => {
      const { getByText } = render(<WishDetails {...defaultProps} />);
      expect(getByText('Marchează Completată')).toBeInTheDocument();
      expect(getByText('Anulează')).toBeInTheDocument();
    });

    it('should not show status buttons for completed wishes', () => {
      const completedWish = {
        ...mockWish,
        status: 'completed'
      };
      
      const { queryByText } = render(
        <WishDetails wish={completedWish} onUpdateStatus={mockOnUpdateStatus} />
      );
      
      expect(queryByText('Marchează Completată')).not.toBeInTheDocument();
      expect(queryByText('Anulează')).not.toBeInTheDocument();
    });

    it('should handle status update success', async () => {
      mockApiSuccess('put', `/api/wishes/${mockWish._id}/status`, {
        wish: { ...mockWish, status: 'completed' }
      });

      const { getByText } = render(<WishDetails {...defaultProps} />);
      await clickElement(getByText('Marchează Completată'));

      expect(mockOnUpdateStatus).toHaveBeenCalledWith('completed');
    });

    it('should handle status update error', async () => {
      mockApiError('put', `/api/wishes/${mockWish._id}/status`, 'Update failed');

      const { getByText, container } = render(<WishDetails {...defaultProps} />);
      await clickElement(getByText('Marchează Completată'));

      expectError(container, 'Update failed');
      expect(mockOnUpdateStatus).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('should adjust layout for mobile', () => {
      window.innerWidth = 375;
      const { container } = render(<WishDetails {...defaultProps} />);
      expect(container.firstChild).toHaveClass('space-y-4');
    });

    it('should adjust layout for desktop', () => {
      window.innerWidth = 1024;
      const { container } = render(<WishDetails {...defaultProps} />);
      expect(container.firstChild).toHaveClass('space-y-6');
    });
  });

  describe('Accessibility', () => {
    it('should have proper headings structure', () => {
      const { getAllByRole } = render(<WishDetails {...defaultProps} />);
      const headings = getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      expect(headings[0]).toHaveAttribute('aria-level', '2');
    });

    it('should have proper button labels', () => {
      const { getByRole } = render(<WishDetails {...defaultProps} />);
      expect(getByRole('button', { name: 'Marchează Completată' })).toBeInTheDocument();
    });

    it('should handle keyboard navigation', () => {
      const { getAllByRole } = render(<WishDetails {...defaultProps} />);
      const buttons = getAllByRole('button');
      
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);
      
      userEvent.tab();
      expect(document.activeElement).toBe(buttons[1]);
    });
  });

  describe('Error States', () => {
    it('should handle missing analysis data', () => {
      const wishWithoutAnalysis = {
        ...mockWish,
        analysis: null
      };
      
      const { getByText } = render(
        <WishDetails wish={wishWithoutAnalysis} onUpdateStatus={mockOnUpdateStatus} />
      );
      
      expect(getByText('Nu există date de analiză disponibile')).toBeInTheDocument();
    });

    it('should handle missing solution data', () => {
      const wishWithoutSolution = {
        ...mockWish,
        solution: null
      };
      
      const { getByText } = render(
        <WishDetails wish={wishWithoutSolution} onUpdateStatus={mockOnUpdateStatus} />
      );
      
      expect(getByText('Nu există soluție disponibilă')).toBeInTheDocument();
    });
  });
});
