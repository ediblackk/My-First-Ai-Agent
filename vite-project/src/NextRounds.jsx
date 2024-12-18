import React, { useState, useEffect } from 'react';
import api from './utils/axios';  // Corectat path-ul

const NextRounds = () => {
  const [rounds, setRounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRounds = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/api/wishes/current-round');

      if (response.data) {
        const currentRound = response.data;
        const formattedRounds = [{
          id: currentRound._id || 'current',
          name: `${currentRound.type === 'fast' ? 'Fast' : 'Daily'} Round`,
          current: currentRound.currentWishes || 0,
          target: currentRound.requiredWishes || 50,
          status: currentRound.status || 'pending'
        }];

        if (currentRound.status === 'active' && currentRound.nextRoundRequiredWishes) {
          formattedRounds.push({
            id: 'next-round',
            name: 'Next Round',
            current: 0,
            target: currentRound.nextRoundRequiredWishes,
            status: 'upcoming'
          });
        }

        setRounds(formattedRounds);
      }
    } catch (err) {
      console.error('Error fetching rounds:', err);
      // Mesaj mai prietenos pentru lipsa datelor
      setError('Nicio rundă activă momentan. Fii primul care începe o rundă!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
    const interval = setInterval(fetchRounds, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'upcoming':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full p-4 sm:p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full p-4 sm:p-6">
        <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
          Next Rounds
        </h2>
        <div className="text-gray-600 dark:text-gray-400 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full p-4 sm:p-6">
      <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
        Next Rounds
      </h2>

      <div className="space-y-6">
        {rounds.map(round => (
          <div key={round.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {round.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {round.current}/{round.target} wishes
              </p>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`${getStatusColor(round.status)} h-2.5 rounded-full transition-all duration-500 ease-in-out`}
                style={{ width: `${Math.min((round.current / round.target) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="capitalize">{round.status}</span>
              <span>{Math.min(Math.round((round.current / round.target) * 100), 100)}%</span>
            </div>
          </div>
        ))}

        {rounds.length === 0 && (
          <div className="text-gray-600 dark:text-gray-400 text-center py-4">
            Nicio rundă activă momentan. Fii primul care începe o rundă!
          </div>
        )}
      </div>
    </div>
  );
};

export default NextRounds;
