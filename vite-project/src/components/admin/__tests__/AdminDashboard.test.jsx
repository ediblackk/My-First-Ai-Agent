import React from 'react';
import {
  render,
  clickElement,
  mockConnectedWallet,
  mockDisconnectedWallet,
  mockApiSuccess,
  mockApiError,
  expectLoadingState,
  expectError
} from '../../../tests/testUtils';
import AdminDashboard from '../../../pages/AdminDashboard';
import { adminConfig } from '../../../config/adminConfig';

describe('AdminDashboard', () => {
  const mockAdmin = {
    publicKey: process.env.ADMIN_WALLET_ADDRESS,
    role: 'SUPER_ADMIN',
    permissions: adminConfig.roles.SUPER_ADMIN.permissions
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should show connect prompt when wallet not connected', () => {
      mockDisconnectedWallet();
      const { getByText } = render(<AdminDashboard />);
      
      expect(getByText(/Conectează-ți portofelul pentru a accesa panoul admin/))
        .toBeInTheDocument();
    });

    it('should show loading state during auth check', () => {
      mockConnectedWallet();
      mockApiSuccess('post', '/api/admin/auth/verify', { success: true });
      
      const { container } = render(<AdminDashboard />);
      expectLoadingState(container);
    });

    it('should show error for non-admin wallet', async () => {
      mockConnectedWallet('non-admin-wallet');
      mockApiError('post', '/api/admin/auth/verify', 'Acces interzis');
      
      const { container } = render(<AdminDashboard />);
      
      await waitFor(() => {
        expectError(container, 'Nu aveți permisiuni de administrator');
      });
    });
  });

  describe('Layout', () => {
    beforeEach(() => {
      mockConnectedWallet(mockAdmin.publicKey);
      mockApiSuccess('post', '/api/admin/auth/verify', {
        success: true,
        role: mockAdmin.role,
        permissions: mockAdmin.permissions
      });
    });

    it('should render header with title', async () => {
      const { getByText } = render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(getByText('Panou Administrare')).toBeInTheDocument();
      });
    });

    it('should render navigation tabs', async () => {
      const { getByText } = render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(getByText('Statistici')).toBeInTheDocument();
        expect(getByText('Utilizatori')).toBeInTheDocument();
        expect(getByText('Configurări')).toBeInTheDocument();
        expect(getByText('Sistem')).toBeInTheDocument();
      });
    });

    it('should highlight active tab', async () => {
      const { getByText } = render(<AdminDashboard />);
      
      await waitFor(() => {
        const activeTab = getByText('Statistici');
        expect(activeTab).toHaveClass('border-blue-500', 'text-blue-600');
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockConnectedWallet(mockAdmin.publicKey);
      mockApiSuccess('post', '/api/admin/auth/verify', {
        success: true,
        role: mockAdmin.role,
        permissions: mockAdmin.permissions
      });
    });

    it('should switch sections when clicking tabs', async () => {
      const { getByText } = render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(getByText('Statistici')).toBeInTheDocument();
      });

      await clickElement(getByText('Utilizatori'));
      expect(getByText('Gestionare Utilizatori')).toBeInTheDocument();

      await clickElement(getByText('Configurări'));
      expect(getByText('Configurări Sistem')).toBeInTheDocument();
    });

    it('should preserve section state when switching', async () => {
      const { getByText, getByRole } = render(<AdminDashboard />);
      
      // Switch to Users and apply filter
      await clickElement(getByText('Utilizatori'));
      const searchInput = getByRole('textbox');
      await typeIntoInput(searchInput, 'test');
      
      // Switch to another section and back
      await clickElement(getByText('Configurări'));
      await clickElement(getByText('Utilizatori'));
      
      // Check if filter is preserved
      expect(searchInput.value).toBe('test');
    });
  });

  describe('Permissions', () => {
    it('should hide sections based on permissions', async () => {
      mockConnectedWallet(mockAdmin.publicKey);
      mockApiSuccess('post', '/api/admin/auth/verify', {
        success: true,
        role: 'SUPPORT_ADMIN',
        permissions: adminConfig.roles.SUPPORT_ADMIN.permissions
      });
      
      const { queryByText } = render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(queryByText('Configurări')).not.toBeInTheDocument();
      });
    });

    it('should disable actions based on permissions', async () => {
      mockConnectedWallet(mockAdmin.publicKey);
      mockApiSuccess('post', '/api/admin/auth/verify', {
        success: true,
        role: 'SUPPORT_ADMIN',
        permissions: adminConfig.roles.SUPPORT_ADMIN.permissions
      });
      
      const { getByText } = render(<AdminDashboard />);
      
      await clickElement(getByText('Utilizatori'));
      
      // Verificare că butonul de modificare credite este dezactivat
      const modifyButton = getByText('Modifică Credite');
      expect(modifyButton).toBeDisabled();
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockConnectedWallet(mockAdmin.publicKey);
      mockApiSuccess('post', '/api/admin/auth/verify', {
        success: true,
        role: mockAdmin.role,
        permissions: mockAdmin.permissions
      });
    });

    it('should adjust layout for mobile', async () => {
      window.innerWidth = 375;
      const { container } = render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(container.firstChild).toHaveClass('px-4');
      });
    });

    it('should adjust layout for desktop', async () => {
      window.innerWidth = 1024;
      const { container } = render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(container.firstChild).toHaveClass('px-8');
      });
    });

    it('should handle navigation on mobile', async () => {
      window.innerWidth = 375;
      const { getByText, getByRole } = render(<AdminDashboard />);
      
      await waitFor(() => {
        const nav = getByRole('navigation');
        expect(nav).toHaveClass('overflow-x-auto');
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockConnectedWallet(mockAdmin.publicKey);
      mockApiSuccess('post', '/api/admin/auth/verify', {
        success: true,
        role: mockAdmin.role,
        permissions: mockAdmin.permissions
      });
    });

    it('should handle section load errors', async () => {
      mockApiError('get', '/api/admin/stats/overview', 'Failed to load stats');
      
      const { container } = render(<AdminDashboard />);
      
      await waitFor(() => {
        expectError(container, 'Failed to load stats');
      });
    });

    it('should show refresh button on error', async () => {
      mockApiError('get', '/api/admin/stats/overview', 'Failed to load stats');
      
      const { getByText } = render(<AdminDashboard />);
      
      await waitFor(() => {
        expect(getByText('Reîmprospătare')).toBeInTheDocument();
      });
    });
  });
});
