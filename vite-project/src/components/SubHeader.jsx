import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Modal from './Modal';
import TokenLoader from './TokenLoader';
import api from '../utils/axios';
import { useAuth } from '../WalletProviderWrapper';

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
      // Don't show error if it's just a connection issue
      if (err.response) {
        setError('Nu s-au putut încărca statisticile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats when authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthenticating) {
      fetchUserStats();
    }
  }, [isAuthenticated, isAuthenticating]);

  // Refresh stats periodically only if authenticated
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
    return (
      <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                👋 Conectează-ți portofelul Solana pentru a începe să faci dorințe!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticating) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Se autentifică...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 dark:text-red-400">
                Eroare de autentificare: {authError}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* User Stats */}
          <div className="flex flex-wrap items-center gap-6">
            {isLoading ? (
              <div className="animate-pulse flex gap-6">
                <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 dark:text-red-400">{error}</div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Credite:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {userStats.credits}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Dorințe Active:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {userStats.activeWishes}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">Total Dorințe:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {userStats.totalWishes}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Load Tokens Button */}
          <button
            onClick={() => setIsTokenLoaderOpen(true)}
            className="px-4 py-2 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition-colors"
          >
            Încarcă Tokenuri
          </button>
        </div>
      </div>

      {/* Token Loader Modal */}
      <Modal
        isOpen={isTokenLoaderOpen}
        onClose={() => setIsTokenLoaderOpen(false)}
        title="Încarcă Tokenuri"
      >
        <TokenLoader 
          onSuccess={handleTokenLoadSuccess} 
          onClose={() => setIsTokenLoaderOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default SubHeader;
