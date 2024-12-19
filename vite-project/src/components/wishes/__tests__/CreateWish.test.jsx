import React from 'react';
import {
  render,
  clickElement,
  typeIntoInput,
  mockConnectedWallet,
  mockApiSuccess,
  mockApiError,
  expectLoadingState,
  expectError
} from '../../../tests/testUtils';
import CreateWish from '../CreateWish';
import api from '../../../utils/axios';

describe('CreateWish', () => {
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();
  const defaultProps = {
    onSuccess: mockOnSuccess,
    onClose: mockOnClose
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectedWallet();
  });

  describe('Form Input', () => {
    it('should render form with textarea', () => {
      const { getByPlaceholderText } = render(
        <CreateWish {...defaultProps} />
      );
      
      expect(getByPlaceholderText('Descrie dorința ta aici...')).toBeInTheDocument();
    });

    it('should update content on input', async () => {
      const { getByPlaceholderText } = render(
        <CreateWish {...defaultProps} />
      );
      
      const input = getByPlaceholderText('Descrie dorința ta aici...');
      await typeIntoInput(input, 'Test wish content');
      
      expect(input.value).toBe('Test wish content');
    });

    it('should show character count', async () => {
      const { getByText, getByPlaceholderText } = render(
        <CreateWish {...defaultProps} />
      );
      
      const input = getByPlaceholderText('Descrie dorința ta aici...');
      await typeIntoInput(input, 'Test');
      
      expect(getByText('4/1000')).toBeInTheDocument();
    });

    it('should disable submit when content is too short', () => {
      const { getByText } = render(
        <CreateWish {...defaultProps} />
      );
      
      const submitButton = getByText('Continuare');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    const validWishContent = 'This is a valid wish content that is long enough';

    it('should handle successful submission', async () => {
      const mockWish = {
        id: 'test-id',
        content: validWishContent,
        status: 'pending'
      };
      
      mockApiSuccess('post', '/api/wishes', { wish: mockWish });
      
      const { getByText, getByPlaceholderText } = render(
        <CreateWish {...defaultProps} />
      );
      
      // Enter wish content
      const input = getByPlaceholderText('Descrie dorința ta aici...');
      await typeIntoInput(input, validWishContent);
      
      // Submit form
      await clickElement(getByText('Continuare'));
      
      expect(api.post).toHaveBeenCalledWith('/api/wishes', {
        content: validWishContent
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(mockWish);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      mockApiSuccess('post', '/api/wishes', { wish: {} });
      
      const { getByText, getByPlaceholderText, container } = render(
        <CreateWish {...defaultProps} />
      );
      
      // Enter wish content
      const input = getByPlaceholderText('Descrie dorința ta aici...');
      await typeIntoInput(input, validWishContent);
      
      // Submit form
      await clickElement(getByText('Continuare'));
      
      expectLoadingState(container);
    });

    it('should handle submission error', async () => {
      mockApiError('post', '/api/wishes', 'Failed to create wish');
      
      const { getByText, getByPlaceholderText } = render(
        <CreateWish {...defaultProps} />
      );
      
      // Enter wish content
      const input = getByPlaceholderText('Descrie dorința ta aici...');
      await typeIntoInput(input, validWishContent);
      
      // Submit form
      await clickElement(getByText('Continuare'));
      
      expectError(container, 'Failed to create wish');
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('AI Analysis Preview', () => {
    const validWishContent = 'This is a valid wish content that is long enough';

    it('should show analysis preview before final submission', async () => {
      const mockAnalysis = {
        complexity: 5,
        categories: ['Test Category'],
        challenges: ['Test Challenge'],
        suggestions: ['Test Suggestion']
      };
      
      mockApiSuccess('post', '/api/wishes/analyze', { analysis: mockAnalysis });
      
      const { getByText, getByPlaceholderText } = render(
        <CreateWish {...defaultProps} />
      );
      
      // Enter wish content
      const input = getByPlaceholderText('Descrie dorința ta aici...');
      await typeIntoInput(input, validWishContent);
      
      // Go to preview
      await clickElement(getByText('Continuare'));
      
      // Check analysis display
      expect(getByText('Complexitate')).toBeInTheDocument();
      expect(getByText('Test Category')).toBeInTheDocument();
      expect(getByText('Test Challenge')).toBeInTheDocument();
    });

    it('should allow going back to edit', async () => {
      const { getByText, getByPlaceholderText } = render(
        <CreateWish {...defaultProps} />
      );
      
      // Enter wish content
      const input = getByPlaceholderText('Descrie dorința ta aici...');
      await typeIntoInput(input, validWishContent);
      
      // Go to preview
      await clickElement(getByText('Continuare'));
      
      // Go back
      await clickElement(getByText('Înapoi'));
      
      // Check we're back to input
      expect(input).toBeInTheDocument();
      expect(input.value).toBe(validWishContent);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const { getByRole } = render(
        <CreateWish {...defaultProps} />
      );
      
      expect(getByRole('textbox')).toHaveAttribute('aria-label', 'Dorința ta');
    });

    it('should handle keyboard navigation', async () => {
      const { getByText, getByPlaceholderText } = render(
        <CreateWish {...defaultProps} />
      );
      
      const input = getByPlaceholderText('Descrie dorința ta aici...');
      input.focus();
      expect(document.activeElement).toBe(input);
      
      // Tab to button
      userEvent.tab();
      expect(document.activeElement).toBe(getByText('Continuare'));
    });
  });

  describe('Responsive Design', () => {
    it('should maintain layout on different screen sizes', () => {
      const { container } = render(
        <CreateWish {...defaultProps} />
      );
      
      // Test mobile
      window.innerWidth = 375;
      fireEvent(window, new Event('resize'));
      expect(container.firstChild).toHaveClass('p-4');
      
      // Test desktop
      window.innerWidth = 1024;
      fireEvent(window, new Event('resize'));
      expect(container.firstChild).toHaveClass('p-6');
    });
  });
});
