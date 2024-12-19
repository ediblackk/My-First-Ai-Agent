import React from 'react';
import {
  render,
  clickElement,
  mockConnectedWallet
} from '../../../tests/testUtils';
import TokenButton from '../TokenButton';

describe('TokenButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render button with correct text', () => {
    const { getByText } = render(
      <TokenButton onClick={mockOnClick} />
    );
    
    expect(getByText('Încarcă Tokenuri')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const { getByText } = render(
      <TokenButton onClick={mockOnClick} />
    );
    
    await clickElement(getByText('Încarcă Tokenuri'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct base styling', () => {
    const { container } = render(
      <TokenButton onClick={mockOnClick} />
    );
    
    const button = container.firstChild;
    expect(button).toHaveClass(
      'px-4',
      'py-2',
      'rounded-lg',
      'text-white',
      'font-medium',
      'bg-green-600'
    );
  });

  it('should have hover state styling', () => {
    const { container } = render(
      <TokenButton onClick={mockOnClick} />
    );
    
    const button = container.firstChild;
    expect(button).toHaveClass('hover:bg-green-700');
  });

  it('should have transition effect', () => {
    const { container } = render(
      <TokenButton onClick={mockOnClick} />
    );
    
    const button = container.firstChild;
    expect(button).toHaveClass('transition-colors');
  });

  it('should be disabled when loading', () => {
    const { container } = render(
      <TokenButton onClick={mockOnClick} disabled={true} />
    );
    
    const button = container.firstChild;
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should not trigger onClick when disabled', async () => {
    const { getByText } = render(
      <TokenButton onClick={mockOnClick} disabled={true} />
    );
    
    await clickElement(getByText('Încarcă Tokenuri'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should show loading text when loading', () => {
    const { getByText } = render(
      <TokenButton 
        onClick={mockOnClick} 
        loading={true}
        loadingText="Se încarcă..."
      />
    );
    
    expect(getByText('Se încarcă...')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    const { container } = render(
      <TokenButton onClick={mockOnClick} />
    );
    
    const button = container.firstChild;
    
    // Verificare rol
    expect(button).toHaveAttribute('role', 'button');
    
    // Verificare contrast text
    expect(button).toHaveClass('text-white');
    
    // Verificare focus outline
    expect(button).toHaveClass(
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-green-500'
    );
  });

  it('should handle long text without breaking layout', () => {
    const longText = 'A'.repeat(30);
    const { container } = render(
      <TokenButton onClick={mockOnClick} text={longText} />
    );
    
    const button = container.firstChild;
    const computedStyle = window.getComputedStyle(button);
    expect(computedStyle.whiteSpace).toBe('nowrap');
  });

  it('should maintain consistent height with different text', () => {
    const { rerender, container } = render(
      <TokenButton onClick={mockOnClick} text="Short" />
    );
    
    const initialHeight = container.firstChild.clientHeight;
    
    rerender(
      <TokenButton onClick={mockOnClick} text="Much longer text here" />
    );
    
    expect(container.firstChild.clientHeight).toBe(initialHeight);
  });

  it('should handle rapid clicks correctly', async () => {
    const { getByText } = render(
      <TokenButton onClick={mockOnClick} />
    );
    
    const button = getByText('Încarcă Tokenuri');
    
    // Simulate multiple rapid clicks
    await clickElement(button);
    await clickElement(button);
    await clickElement(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });
});
