import React, { useState, useEffect } from 'react';
import AdminService from '../../services/adminService';

const StatCard = ({ title, value, description, loading, error }) => (
  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
            {loading ? (
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            ) : error ? (
              <span className="text-red-500 text-sm">Eroare la încărcare</span>
            ) : (
              value
            )}
          </p>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const StatsSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // secunde

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await AdminService.getStatsOverview();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleRefreshIntervalChange = (e) => {
    const value = parseInt(e.target.value);
    setRefreshInterval(value);
  };

  return (
    <div className="space-y-6">
      {/* Header cu refresh control */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Statistici Sistem
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={refreshInterval}
            onChange={handleRefreshIntervalChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value={10}>10 secunde</option>
            <option value={30}>30 secunde</option>
            <option value={60}>1 minut</option>
            <option value={300}>5 minute</option>
          </select>
          <button
            onClick={fetchStats}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reîmprospătare
          </button>
        </div>
      </div>

      {/* Grid de statistici */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Utilizatori"
          value={stats?.users || 0}
          loading={loading}
          error={error}
        />
        <StatCard
          title="Utilizatori Activi (24h)"
          value={stats?.activeUsers || 0}
          loading={loading}
          error={error}
        />
        <StatCard
          title="Total Credite în Sistem"
          value={stats?.totalCredits?.[0]?.total || 0}
          loading={loading}
          error={error}
        />
      </div>

      {/* Mesaj eroare global */}
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Eroare la încărcarea statisticilor
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsSection;
