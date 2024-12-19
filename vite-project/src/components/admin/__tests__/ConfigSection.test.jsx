import React from 'react';
import {
  render,
  clickElement,
  typeIntoInput,
  mockApiSuccess,
  mockApiError,
  expectLoadingState,
  expectError
} from '../../../tests/testUtils';
import ConfigSection from '../ConfigSection';

describe('ConfigSection', () => {
  const mockConfigs = [
    {
      key: 'AI_MODEL',
      value: 'gpt-4',
      category: 'AI',
      description: 'Modelul AI folosit'
    },
    {
      key: 'GAME_CREDITS_RATE',
      value: 6,
      category: 'GAME',
      description: 'Rate de conversie SOL la credite'
    },
    {
      key: 'SECURITY_MAX_WISHES',
      value: 10,
      category: 'SECURITY',
      description: 'Număr maxim de dorințe active'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should show loading state initially', () => {
      const { container } = render(<ConfigSection />);
      expectLoadingState(container);
    });

    it('should load configs on mount', async () => {
      mockApiSuccess('get', '/api/admin/config', { configs: mockConfigs });
      
      const { getByText } = render(<ConfigSection />);
      
      await waitFor(() => {
        expect(getByText('AI_MODEL')).toBeInTheDocument();
        expect(getByText('gpt-4')).toBeInTheDocument();
      });
    });
  });

  describe('Config Display', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/config', { configs: mockConfigs });
    });

    it('should render config items', async () => {
      const { getByText } = render(<ConfigSection />);
      
      await waitFor(() => {
        mockConfigs.forEach(config => {
          expect(getByText(config.key)).toBeInTheDocument();
          expect(getByText(config.description)).toBeInTheDocument();
          expect(getByText(config.value.toString())).toBeInTheDocument();
        });
      });
    });

    it('should group configs by category', async () => {
      const { getByText } = render(<ConfigSection />);
      
      await waitFor(() => {
        expect(getByText('AI')).toBeInTheDocument();
        expect(getByText('GAME')).toBeInTheDocument();
        expect(getByText('SECURITY')).toBeInTheDocument();
      });
    });

    it('should show edit buttons for each config', async () => {
      const { getAllByText } = render(<ConfigSection />);
      
      await waitFor(() => {
        const editButtons = getAllByText('Editare');
        expect(editButtons).toHaveLength(mockConfigs.length);
      });
    });
  });

  describe('Config Editing', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/config', { configs: mockConfigs });
    });

    it('should enter edit mode on edit click', async () => {
      const { getByText, getByDisplayValue } = render(<ConfigSection />);
      
      await waitFor(() => {
        expect(getByText('AI_MODEL')).toBeInTheDocument();
      });

      await clickElement(getByText('Editare'));
      
      expect(getByDisplayValue('gpt-4')).toBeInTheDocument();
      expect(getByText('Salvare')).toBeInTheDocument();
      expect(getByText('Anulare')).toBeInTheDocument();
    });

    it('should update config value', async () => {
      mockApiSuccess('put', '/api/admin/config', {
        config: { ...mockConfigs[0], value: 'gpt-3.5-turbo' }
      });

      const { getByText, getByDisplayValue } = render(<ConfigSection />);
      
      await waitFor(() => {
        expect(getByText('AI_MODEL')).toBeInTheDocument();
      });

      // Enter edit mode
      await clickElement(getByText('Editare'));
      
      // Change value
      const input = getByDisplayValue('gpt-4');
      await typeIntoInput(input, 'gpt-3.5-turbo');
      
      // Save changes
      await clickElement(getByText('Salvare'));
      
      await waitFor(() => {
        expect(getByText('gpt-3.5-turbo')).toBeInTheDocument();
      });
    });

    it('should cancel edit', async () => {
      const { getByText, getByDisplayValue } = render(<ConfigSection />);
      
      await waitFor(() => {
        expect(getByText('AI_MODEL')).toBeInTheDocument();
      });

      // Enter edit mode
      await clickElement(getByText('Editare'));
      
      // Change value
      const input = getByDisplayValue('gpt-4');
      await typeIntoInput(input, 'new-value');
      
      // Cancel edit
      await clickElement(getByText('Anulare'));
      
      // Original value should be preserved
      expect(getByText('gpt-4')).toBeInTheDocument();
    });

    it('should validate number inputs', async () => {
      const { getByText, getByDisplayValue } = render(<ConfigSection />);
      
      await waitFor(() => {
        expect(getByText('GAME_CREDITS_RATE')).toBeInTheDocument();
      });

      // Enter edit mode
      await clickElement(getByText('Editare'));
      
      // Try invalid input
      const input = getByDisplayValue('6');
      await typeIntoInput(input, 'invalid');
      
      await clickElement(getByText('Salvare'));
      
      expectError(container, 'Valoare invalidă');
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/config', { configs: mockConfigs });
    });

    it('should filter by category', async () => {
      const { getByText, queryByText } = render(<ConfigSection />);
      
      await waitFor(() => {
        expect(getByText('AI_MODEL')).toBeInTheDocument();
      });

      // Filter by AI
      await clickElement(getByText('AI'));
      
      expect(getByText('AI_MODEL')).toBeInTheDocument();
      expect(queryByText('GAME_CREDITS_RATE')).not.toBeInTheDocument();
    });

    it('should show all configs when selecting ALL', async () => {
      const { getByText } = render(<ConfigSection />);
      
      await waitFor(() => {
        expect(getByText('AI_MODEL')).toBeInTheDocument();
      });

      // Filter by AI first
      await clickElement(getByText('AI'));
      
      // Then show all
      await clickElement(getByText('ALL'));
      
      mockConfigs.forEach(config => {
        expect(getByText(config.key)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error on load failure', async () => {
      mockApiError('get', '/api/admin/config', 'Failed to load configs');
      
      const { container } = render(<ConfigSection />);
      
      await waitFor(() => {
        expectError(container, 'Failed to load configs');
      });
    });

    it('should show error on update failure', async () => {
      mockApiSuccess('get', '/api/admin/config', { configs: mockConfigs });
      mockApiError('put', '/api/admin/config', 'Update failed');

      const { getByText, getByDisplayValue } = render(<ConfigSection />);
      
      await waitFor(() => {
        expect(getByText('AI_MODEL')).toBeInTheDocument();
      });

      // Enter edit mode
      await clickElement(getByText('Editare'));
      
      // Try to save
      await clickElement(getByText('Salvare'));
      
      expectError(container, 'Update failed');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockApiSuccess('get', '/api/admin/config', { configs: mockConfigs });
    });

    it('should have proper form labels', async () => {
      const { getByText, getByLabelText } = render(<ConfigSection />);
      
      await waitFor(() => {
        expect(getByText('AI_MODEL')).toBeInTheDocument();
      });

      await clickElement(getByText('Editare'));
      
      expect(getByLabelText('AI_MODEL')).toBeInTheDocument();
    });

    it('should handle keyboard navigation', async () => {
      const { getByText, getAllByText } = render(<ConfigSection />);
      
      await waitFor(() => {
        const editButtons = getAllByText('Editare');
        editButtons[0].focus();
        expect(document.activeElement).toBe(editButtons[0]);
        
        userEvent.tab();
        expect(document.activeElement).toBe(editButtons[1]);
      });
    });
  });
});
