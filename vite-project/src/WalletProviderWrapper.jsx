import React, { useMemo, useCallback, createContext, useContext, useState } from 'react';
import {
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { 
  ConnectionProvider, 
  WalletProvider as SolanaWalletProvider,
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
  authError: null,
  isAdmin: false
});

export const useAuth = () => useContext(AuthContext);

// Create AuthProvider component
const AuthProvider = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const authenticate = useCallback(async () => {
    if (!connected || !publicKey) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAuthError(null);
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      return;
    }

    try {
      setIsAuthenticating(true);
      setAuthError(null);
      
      const walletAddress = publicKey.toString();
      console.log('Attempting authentication with publicKey:', walletAddress);
      
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');

      const response = await api.post('/api/users/authenticate', {
        publicKey: walletAddress
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAdmin', response.data.user.isAdmin);
        console.log('Authentication successful');
        setIsAuthenticated(true);
        setIsAdmin(response.data.user.isAdmin);
      } else {
        console.error('Authentication failed:', response.data.error);
        setAuthError(response.data.error || 'Authentication failed');
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError(error.response?.data?.error || error.message);
      setIsAuthenticated(false);
      setIsAdmin(false);
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, connected]);

  React.useEffect(() => {
    if (connected && publicKey) {
      authenticate();
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAuthError(null);
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
    }
  }, [connected, publicKey, authenticate]);

  React.useEffect(() => {
    if (!connected) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAuthError(null);
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
    }
  }, [connected]);

  const value = {
    isAuthenticated,
    isAuthenticating,
    authError,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const WalletProvider = ({ children }) => {
  const network = import.meta.env.VITE_SOLANA_NETWORK || "devnet";
  
  const endpoint = useMemo(() => {
    if (network === "mainnet-beta") {
      return "https://api.mainnet-beta.solana.com";
    } else if (network === "testnet") {
      return "https://api.testnet.solana.com";
    } else {
      return "https://api.devnet.solana.com";
    }
  }, [network]);

  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter()
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider 
        wallets={wallets}
        autoConnect={true}
      >
        <WalletModalProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProvider;
