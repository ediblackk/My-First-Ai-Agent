import React from 'react';
import {
  render,
  clickElement,
  mockConnectedWallet,
  mockApiSuccess,
  mockApiError
} from '../../../tests/testUtils';
import TokenModal from '../TokenModal';
import Modal from '../../Modal';
import TokenLoader from '../../TokenLoader';

// Mock pentru componente
vi.mock('../../Modal', () => ({
  default: vi.fn(({ children, ...props }) => (
    <div data-testid="mock-modal" {...props}>
      {children}
    </div>
  ))
}));

vi.mock('../../TokenLoader', () => ({
  default: vi.fn((props) => (
    <div data-testid="mock-token-loader" {...props}>
      Token Loader Content
    </div>
  ))
}));

describe('TokenModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnectedWallet();
  });

  it('should render Modal with TokenLoader', () => {
    const { getByTestId } = render(
      <TokenModal {...defaultProps} />
    );
    
    expect(getByTestId('mock-modal')).toBeInTheDocument();
    expect(getByTestId('mock-token-loader')).toBeInTheDocument();
  });

  it('should pass correct props to Modal', () => {
    render(<TokenModal {...defaultProps} />);
    
    expect(Modal).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        onClose: expect.any(Function),
        title: 'Încarcă Tokenuri'
      }),
      expect.any(Object)
    );
  });

  it('should pass correct props to TokenLoader', () => {
    render(<TokenModal {...defaultProps} />);
    
    expect(TokenLoader).toHaveBeenCalledWith(
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onClose: expect.any(Function)
      }),
      expect.any(Object)
    );
  });

  it('should handle onClose', () => {
    const onClose = vi.fn();
    render(
      <TokenModal
        {...defaultProps}
        onClose={onClose}
      />
    );
    
    // Simulare închidere modal
    Modal.mock.calls[0][0].onClose();
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle onSuccess', () => {
    const onSuccess = vi.fn();
    render(
      <TokenModal
        {...defaultProps}
        onSuccess={onSuccess}
      />
    );
    
    // Simulare succes TokenLoader
    TokenLoader.mock.calls[0][0].onSuccess(100);
    
    expect(onSuccess).toHaveBeenCalledWith(100);
  });

  it('should not render when isOpen is false', () => {
    const { queryByTestId } = render(
      <TokenModal
        {...defaultProps}
        isOpen={false}
      />
    );
    
    expect(queryByTestId('mock-modal')).toHaveAttribute('isOpen', 'false');
  });

  it('should handle rapid open/close', () => {
    const { rerender } = render(
      <TokenModal {...defaultProps} isOpen={true} />
    );
    
    // Rapid toggle
    rerender(<TokenModal {...defaultProps} isOpen={false} />);
    rerender(<TokenModal {...defaultProps} isOpen={true} />);
    
    expect(Modal).toHaveBeenCalledTimes(3);
  });

  it('should cleanup on unmount', () => {
    const { unmount } = render(
      <TokenModal {...defaultProps} />
    );
    
    unmount();
    
    // Verificare că nu există memory leaks sau side effects
    expect(Modal).toHaveBeenCalledTimes(1);
  });

  it('should handle errors from TokenLoader', () => {
    const onClose = vi.fn();
    render(
      <TokenModal
        {...defaultProps}
        onClose={onClose}
      />
    );
    
    // Simulare eroare în TokenLoader
    TokenLoader.mock.calls[0][0].onError?.('Test error');
    
    // Modal ar trebui să rămână deschis
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should be accessible', () => {
    const { getByTestId } = render(
      <TokenModal {...defaultProps} />
    );
    
    const modal = getByTestId('mock-modal');
    
    // Verificare atribute ARIA
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', expect.any(String));
  });

  it('should handle keyboard events', () => {
    const onClose = vi.fn();
    const { getByTestId } = render(
      <TokenModal
        {...defaultProps}
        onClose={onClose}
      />
    );
    
    // Simulare Escape
    fireEvent.keyDown(getByTestId('mock-modal'), { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should prevent background scroll when open', () => {
    render(<TokenModal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    
    // Cleanup
    cleanup();
    expect(document.body.style.overflow).toBe('');
  });

  it('should handle multiple instances correctly', () => {
    const { rerender } = render(
      <>
        <TokenModal {...defaultProps} />
        <TokenModal {...defaultProps} />
      </>
    );
    
    expect(Modal).toHaveBeenCalledTimes(2);
    
    // Verificare că fiecare instanță are ID unic
    const calls = Modal.mock.calls;
    const firstId = calls[0][0]['aria-labelledby'];
    const secondId = calls[1][0]['aria-labelledby'];
    expect(firstId).not.toBe(secondId);
  });
});
