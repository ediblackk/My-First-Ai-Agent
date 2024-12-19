import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../WalletProviderWrapper';
import api from '../utils/axios';

// Import componente noi
import ConnectPrompt from './header/ConnectPrompt';
import AuthStatus from './header/AuthStatus';
import UserStats from './header/UserStats';
import TokenButton from './header/TokenButton';
import TokenModal from './header/TokenModal';

const SubHeader = () => {
  const { publicKey, connected } = useWallet();
  const { isAuthenticated, isAuthenticating, authError } = useAuth();
  const [isTokenLoaderOpen, setIsTokenLoaderOpen] = useState(false);
  const [userStats, setUserStats] = useState({
    credits: 0,
    activeWishes: 0,
    totalWishes: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserStats = async () => {
    if (!connected || !publicKey || !isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/api/users/stats');
      
      if (response.data.success) {
        setUserStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      if (err.response) {
        setError('Nu s-au putut încărca statisticile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isAuthenticating) {
      fetchUserStats();
    }
  }, [isAuthenticated, isAuthenticating]);

  useEffect(() => {
    if (isAuthenticated && !isAuthenticating) {
      const interval = setInterval(fetchUserStats, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isAuthenticating]);

  const handleTokenLoadSuccess = (newCredits) => {
    setIsTokenLoaderOpen(false);
    setUserStats(prev => ({
      ...prev,
      credits: newCredits
    }));
  };

  if (!connected) {
    return <ConnectPrompt />;
  }

  if (isAuthenticating || authError) {
    return <AuthStatus isAuthenticating={isAuthenticating} authError={authError} />;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <UserStats 
            isLoading={isLoading}
            error={error}
            stats={userStats}
          />
          
          <TokenButton onClick={() => setIsTokenLoaderOpen(true)} />
        </div>
      </div>

      <TokenModal 
        isOpen={isTokenLoaderOpen}
        onClose={() => setIsTokenLoaderOpen(false)}
        onSuccess={handleTokenLoadSuccess}
      />
    </div>
  );
};

export default SubHeader;
