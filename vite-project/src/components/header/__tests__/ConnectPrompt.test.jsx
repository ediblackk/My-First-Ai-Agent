import React from 'react';
import {
  render,
  mockConnectedWallet,
  mockDisconnectedWallet
} from '../../../tests/testUtils';
import ConnectPrompt from '../ConnectPrompt';

describe('ConnectPrompt', () => {
  it('should render connect message when wallet is not connected', () => {
    mockDisconnectedWallet();
    const { getByText } = render(<ConnectPrompt />);
    
    expect(
      getByText('👋 Conectează-ți portofelul Solana pentru a începe să faci dorințe!')
    ).toBeInTheDocument();
  });

  it('should render custom message when provided', () => {
    mockDisconnectedWallet();
    const customMessage = 'Test custom message';
    const { getByText } = render(<ConnectPrompt message={customMessage} />);
    
    expect(getByText(customMessage)).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    mockDisconnectedWallet();
    const { container } = render(<ConnectPrompt />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(
      'bg-gray-100',
      'dark:bg-gray-700',
      'border-b',
      'border-gray-200',
      'dark:border-gray-600'
    );

    const messageContainer = wrapper.querySelector('.text-gray-600');
    expect(messageContainer).toHaveClass(
      'text-gray-600',
      'dark:text-gray-300'
    );
  });

  it('should be centered in container', () => {
    mockDisconnectedWallet();
    const { container } = render(<ConnectPrompt />);
    
    const centerContainer = container.querySelector('.flex.items-center.justify-center');
    expect(centerContainer).toBeInTheDocument();
  });

  it('should use container class for responsive width', () => {
    mockDisconnectedWallet();
    const { container } = render(<ConnectPrompt />);
    
    expect(container.querySelector('.container')).toBeInTheDocument();
    expect(container.querySelector('.mx-auto')).toBeInTheDocument();
  });

  it('should have consistent padding', () => {
    mockDisconnectedWallet();
    const { container } = render(<ConnectPrompt />);
    
    const paddingContainer = container.querySelector('.px-4.py-3');
    expect(paddingContainer).toBeInTheDocument();
  });

  it('should handle long messages without breaking layout', () => {
    mockDisconnectedWallet();
    const longMessage = 'A'.repeat(100);
    const { container } = render(<ConnectPrompt message={longMessage} />);
    
    const messageElement = container.querySelector('.text-center');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement.textContent).toHaveLength(100);
  });

  it('should not render when wallet is connected', () => {
    mockConnectedWallet();
    const { container } = render(<ConnectPrompt />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should be accessible', () => {
    mockDisconnectedWallet();
    const { container } = render(<ConnectPrompt />);
    
    // Verificare contrast text
    const textElement = container.querySelector('.text-gray-600');
    expect(textElement).toHaveClass('dark:text-gray-300');

    // Verificare că textul nu e prea mic
    const computedStyle = window.getComputedStyle(textElement);
    expect(parseInt(computedStyle.fontSize)).toBeGreaterThanOrEqual(12);
  });

  it('should handle emoji without breaking layout', () => {
    mockDisconnectedWallet();
    const messageWithEmoji = '🎉 Test message';
    const { container } = render(<ConnectPrompt message={messageWithEmoji} />);
    
    const messageElement = container.querySelector('.text-center');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement.textContent).toContain('🎉');
  });
});
