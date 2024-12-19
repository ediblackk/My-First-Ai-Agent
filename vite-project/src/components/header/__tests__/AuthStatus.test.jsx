import React from 'react';
import {
  render,
  mockConnectedWallet,
  mockDisconnectedWallet,
  expectLoadingState
} from '../../../tests/testUtils';
import AuthStatus from '../AuthStatus';

describe('AuthStatus', () => {
  const defaultProps = {
    isAuthenticating: false,
    authError: null
  };

  it('should render loading state when authenticating', () => {
    mockConnectedWallet();
    const props = {
      ...defaultProps,
      isAuthenticating: true
    };
    
    const { getByText, container } = render(<AuthStatus {...props} />);
    
    expect(getByText('Se autentifică...')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(
      'bg-gray-100',
      'dark:bg-gray-700'
    );
  });

  it('should render error state when auth error occurs', () => {
    mockConnectedWallet();
    const errorMessage = 'Test error message';
    const props = {
      ...defaultProps,
      authError: errorMessage
    };
    
    const { getByText, container } = render(<AuthStatus {...props} />);
    
    const errorElement = getByText((content) => 
      content.includes('Eroare de autentificare') && 
      content.includes(errorMessage)
    );
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass('text-red-500', 'dark:text-red-400');
  });

  it('should not render anything when not authenticating and no error', () => {
    mockConnectedWallet();
    const { container } = render(<AuthStatus {...defaultProps} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should not render when wallet is not connected', () => {
    mockDisconnectedWallet();
    const props = {
      ...defaultProps,
      isAuthenticating: true
    };
    
    const { container } = render(<AuthStatus {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it('should have consistent container styling', () => {
    mockConnectedWallet();
    const props = {
      ...defaultProps,
      isAuthenticating: true
    };
    
    const { container } = render(<AuthStatus {...props} />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(
      'bg-gray-100',
      'dark:bg-gray-700',
      'border-b',
      'border-gray-200',
      'dark:border-gray-600'
    );
  });

  it('should center content in container', () => {
    mockConnectedWallet();
    const props = {
      ...defaultProps,
      isAuthenticating: true
    };
    
    const { container } = render(<AuthStatus {...props} />);
    
    expect(container.querySelector('.flex.items-center.justify-center'))
      .toBeInTheDocument();
  });

  it('should handle long error messages', () => {
    mockConnectedWallet();
    const longError = 'A'.repeat(100);
    const props = {
      ...defaultProps,
      authError: longError
    };
    
    const { container } = render(<AuthStatus {...props} />);
    
    const errorContainer = container.querySelector('.text-center');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer.textContent).toContain(longError);
  });

  it('should be accessible in all states', () => {
    mockConnectedWallet();
    
    // Test loading state
    const { rerender, container } = render(
      <AuthStatus {...defaultProps} isAuthenticating={true} />
    );
    
    let messageElement = container.querySelector('.text-gray-600');
    expect(messageElement).toHaveClass('dark:text-gray-300');
    
    // Test error state
    rerender(
      <AuthStatus {...defaultProps} authError="Test error" />
    );
    
    messageElement = container.querySelector('.text-red-500');
    expect(messageElement).toHaveClass('dark:text-red-400');
  });

  it('should maintain layout with different content lengths', () => {
    mockConnectedWallet();
    
    // Short error
    const { rerender, container } = render(
      <AuthStatus {...defaultProps} authError="Error" />
    );
    
    let contentContainer = container.querySelector('.container');
    expect(contentContainer).toHaveClass('mx-auto', 'px-4', 'py-3');
    
    // Long error
    rerender(
      <AuthStatus {...defaultProps} authError={'A'.repeat(200)} />
    );
    
    contentContainer = container.querySelector('.container');
    expect(contentContainer).toHaveClass('mx-auto', 'px-4', 'py-3');
  });

  it('should handle rapid state changes', () => {
    mockConnectedWallet();
    const { rerender, container } = render(
      <AuthStatus {...defaultProps} isAuthenticating={true} />
    );
    
    expect(container.textContent).toContain('Se autentifică');
    
    rerender(
      <AuthStatus {...defaultProps} authError="Error occurred" />
    );
    
    expect(container.textContent).toContain('Error occurred');
    
    rerender(
      <AuthStatus {...defaultProps} />
    );
    
    expect(container.firstChild).toBeNull();
  });
});
