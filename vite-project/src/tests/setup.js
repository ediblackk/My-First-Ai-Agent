import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup automat după fiecare test
afterEach(() => {
  cleanup();
});

// Mock pentru localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock pentru matchMedia
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn()
  };
};

// Mock pentru Solana Wallet Adapter
vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: vi.fn(() => ({
    publicKey: null,
    connected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    signMessage: vi.fn(),
    signTransaction: vi.fn()
  })),
  useConnection: vi.fn(() => ({
    connection: {
      getBalance: vi.fn(),
      getRecentBlockhash: vi.fn(),
      sendRawTransaction: vi.fn()
    }
  }))
}));

// Mock pentru axios
vi.mock('../utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

// Custom render pentru teste
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WalletProvider } from '../WalletProviderWrapper';

const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <WalletProvider>
        {children}
      </WalletProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Export
export * from '@testing-library/react';
export { customRender as render };

// Mock data
export const mockUser = {
  publicKey: 'test-wallet-address',
  credits: 100,
  activeWishes: 2,
  totalWishes: 5
};

export const mockWish = {
  _id: 'test-wish-id',
  content: 'Test wish content',
  status: 'pending',
  credits: 1,
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
  aiModel: 'test-model',
  tokensUsed: {
    analysis: 100,
    solution: 200
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const mockAdmin = {
  publicKey: process.env.ADMIN_WALLET_ADDRESS,
  role: 'SUPER_ADMIN',
  permissions: [
    'manage_users',
    'manage_credits',
    'manage_config',
    'view_stats',
    'manage_ai'
  ]
};

// Helper pentru simulare autentificare
export const mockAuthenticated = (isAdmin = false) => {
  const user = isAdmin ? mockAdmin : mockUser;
  
  vi.mocked(useWallet).mockImplementation(() => ({
    publicKey: { toString: () => user.publicKey },
    connected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    signMessage: vi.fn(),
    signTransaction: vi.fn()
  }));

  return user;
};

// Helper pentru simulare response API
export const mockApiResponse = (data, error = null) => {
  if (error) {
    return Promise.reject({
      response: {
        data: { success: false, error }
      }
    });
  }
  return Promise.resolve({
    data: { success: true, ...data }
  });
};

// Helper pentru verificare loading states
export const expectLoading = (container) => {
  expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
};

// Helper pentru verificare error states
export const expectError = (container, message) => {
  const error = container.querySelector('.text-red-500, .text-red-600');
  expect(error).toBeInTheDocument();
  if (message) {
    expect(error).toHaveTextContent(message);
  }
};
