import React, { useMemo, useCallback, createContext, useContext, useState } from 'react';
import {
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { 
  ConnectionProvider, 
  WalletProvider,
  useWallet 
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import api from './utils/axios';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Create auth context
const AuthContext = createContext({
  isAuthenticated: false,
  isAuthenticating: false,
  authError: null
});

export const useAuth = () => useContext(AuthContext);

// Create AuthProvider component
const AuthProvider = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  const authenticate = useCallback(async () => {
    if (!connected || !publicKey) {
      setIsAuthenticated(false);
      setAuthError(null);
      localStorage.removeItem('token');
      return;
    }

    try {
      setIsAuthenticating(true);
      setAuthError(null);
      
      const walletAddress = publicKey.toString();
      console.log('Attempting authentication with publicKey:', walletAddress);
      
      // Remove any existing token
      localStorage.removeItem('token');

      const response = await api.post('/api/users/authenticate', {
        publicKey: walletAddress
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        console.log('Authentication successful');
        setIsAuthenticated(true);
      } else {
        console.error('Authentication failed:', response.data.error);
        setAuthError(response.data.error || 'Authentication failed');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Authentication error:', {
        message: error.message,
        response: error.response?.data,
        publicKey: publicKey?.toString()
      });
      setAuthError(error.response?.data?.error || error.message);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, connected]);

  // Effect to handle authentication when wallet connects
  React.useEffect(() => {
    if (connected && publicKey) {
      authenticate();
    } else {
      setIsAuthenticated(false);
      setAuthError(null);
      localStorage.removeItem('token');
    }
  }, [connected, publicKey, authenticate]);

  // Effect to handle wallet disconnection
  React.useEffect(() => {
    if (!connected) {
      setIsAuthenticated(false);
      setAuthError(null);
      localStorage.removeItem('token');
    }
  }, [connected]);

  const value = {
    isAuthenticated,
    isAuthenticating,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const WalletProviderWrapper = ({ children }) => {
  // You can specify additional network options if needed
  const network = import.meta.env.VITE_SOLANA_NETWORK || "devnet";
  
  // Get the endpoint based on network
  const endpoint = useMemo(() => {
    if (network === "mainnet-beta") {
      return "https://api.mainnet-beta.solana.com";
    } else if (network === "testnet") {
      return "https://api.testnet.solana.com";
    } else {
      return "https://api.devnet.solana.com";
    }
  }, [network]);

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter()
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets}
        autoConnect={true}
      >
        <WalletModalProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProviderWrapper;
