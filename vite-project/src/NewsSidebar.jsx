import React, { useState, useEffect } from 'react';
import api from './utils/axios';  // Modificat path-ul

const NewsSidebar = () => {
  const [latestWishes, setLatestWishes] = useState([]);
  const [topRewards, setTopRewards] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [wishesRes, rewardsRes, statsRes] = await Promise.all([
        api.get('/api/stats/latest-wishes'),
        api.get('/api/stats/top-rewards'),
        api.get('/api/stats/round-stats')
      ]);

      if (wishesRes.data.success) {
        setLatestWishes(wishesRes.data.wishes || []);
      }

      if (rewardsRes.data.success) {
        setTopRewards(rewardsRes.data.wishes || []);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

    } catch (err) {
      console.error('Error fetching news data:', err);
      // Nu mai setăm eroare, doar logăm pentru debugging
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSOL = (amount) => {
    if (!amount) return '0 SOL';
    return `${Number(amount).toFixed(2)} SOL`;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full p-4 sm:p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full p-4 sm:p-6 space-y-8">
      {/* Latest Fulfilled Wishes */}
      <div>
        <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
          Ultimele Dorințe Îndeplinite
        </h2>
        <div className="space-y-4">
          {latestWishes.length > 0 ? (
            latestWishes.map(wish => (
              <div key={wish.id} className="border-l-4 border-green-500 pl-3 py-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {wish.content}
                </p>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Wallet: {wish.walletAddress}</span>
                  <span>{formatDate(wish.fulfilledAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400 py-4">
              Nicio dorință îndeplinită încă. Fii primul care își îndeplinește dorința!
            </div>
          )}
        </div>
      </div>

      {/* Top Rewards */}
      <div>
        <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
          Cele Mai Mari Recompense
        </h2>
        <div className="space-y-4">
          {topRewards.length > 0 ? (
            topRewards.map((wish, index) => (
              <div 
                key={wish.id} 
                className={`border-l-4 pl-3 py-2 ${
                  index === 0 ? 'border-yellow-500' :
                  index === 1 ? 'border-gray-400' :
                  'border-orange-500'
                }`}
              >
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {wish.content}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatSOL(wish.rewardAmount)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(wish.fulfilledAt)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400 py-4">
              Nicio recompensă încă. Fii primul care câștigă o recompensă mare!
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {stats ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">
            Statistici Joc
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalRounds || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Runde
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.totalWishesFulfilled || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dorințe Îndeplinite
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center text-gray-600 dark:text-gray-400">
          Statisticile vor fi disponibile după prima rundă completă!
        </div>
      )}
    </div>
  );
};

export default NewsSidebar;
