import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { WalletProvider } from '../WalletProviderWrapper';
import api from '../utils/axios';

// Wrapper pentru toate provider-ele necesare
const AllProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <WalletProvider>
        {children}
      </WalletProvider>
    </BrowserRouter>
  );
};

// Custom render cu provideri
const customRender = (ui, options = {}) => {
  return render(ui, {
    wrapper: AllProviders,
    ...options,
  });
};

// Helper pentru simulare click
const clickElement = async (element) => {
  await userEvent.click(element);
};

// Helper pentru simulare input text
const typeIntoInput = async (input, text) => {
  await userEvent.type(input, text);
};

// Helper pentru simulare submit form
const submitForm = async (form) => {
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    await clickElement(submitButton);
  } else {
    await form.submit();
  }
};

// Helper pentru așteptare loading
const waitForLoading = async () => {
  await waitFor(() => {
    const loadingElement = screen.queryByRole('progressbar');
    expect(loadingElement).not.toBeInTheDocument();
  });
};

// Helper pentru verificare error message
const findErrorMessage = () => {
  return screen.queryByText(/error|failed|invalid/i);
};

// Helper pentru mock API responses
const mockApiSuccess = (method, path, response) => {
  api[method].mockImplementationOnce(() => 
    Promise.resolve({ data: { success: true, ...response } })
  );
};

const mockApiError = (method, path, error) => {
  api[method].mockImplementationOnce(() => 
    Promise.reject({
      response: {
        data: { success: false, error }
      }
    })
  );
};

// Helper pentru simulare wallet conectat
const mockConnectedWallet = (publicKey = 'test-wallet') => {
  vi.mocked(useWallet).mockImplementation(() => ({
    publicKey: { toString: () => publicKey },
    connected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    signMessage: vi.fn(),
    signTransaction: vi.fn()
  }));
};

// Helper pentru simulare wallet deconectat
const mockDisconnectedWallet = () => {
  vi.mocked(useWallet).mockImplementation(() => ({
    publicKey: null,
    connected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    signMessage: vi.fn(),
    signTransaction: vi.fn()
  }));
};

// Helper pentru verificare componente UI
const expectComponentToBeVisible = (component) => {
  expect(component).toBeVisible();
  expect(component).not.toHaveAttribute('aria-hidden', 'true');
};

const expectComponentToBeHidden = (component) => {
  expect(component).not.toBeVisible();
  expect(component).toHaveAttribute('aria-hidden', 'true');
};

// Helper pentru verificare text trunchiat
const expectTruncatedText = (element, fullText) => {
  expect(element).toHaveClass('truncate');
  expect(element).toHaveAttribute('title', fullText);
};

// Helper pentru verificare loading state
const expectLoadingState = (container) => {
  const skeleton = container.querySelector('.animate-pulse');
  expect(skeleton).toBeInTheDocument();
};

// Helper pentru verificare empty state
const expectEmptyState = (container, message) => {
  const emptyMessage = container.querySelector('.text-gray-500');
  expect(emptyMessage).toBeInTheDocument();
  if (message) {
    expect(emptyMessage).toHaveTextContent(message);
  }
};

// Export toate utilitarele
export {
  customRender as render,
  clickElement,
  typeIntoInput,
  submitForm,
  waitForLoading,
  findErrorMessage,
  mockApiSuccess,
  mockApiError,
  mockConnectedWallet,
  mockDisconnectedWallet,
  expectComponentToBeVisible,
  expectComponentToBeHidden,
  expectTruncatedText,
  expectLoadingState,
  expectEmptyState
};
