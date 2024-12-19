import React from 'react';
import PropTypes from 'prop-types';

const UserStats = ({ 
  isLoading = false, 
  error = null, 
  stats = { credits: 0, activeWishes: 0, totalWishes: 0 } 
}) => {
  const StatItem = ({ label, value, colorClass }) => (
    <div className="flex items-center gap-2">
      <span className="text-gray-600 dark:text-gray-400">{label}:</span>
      <span className={`font-bold ${colorClass}`}>
        {value}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="animate-pulse flex gap-6">
        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-6">
      <StatItem 
        label="Credite" 
        value={stats.credits} 
        colorClass="text-blue-600 dark:text-blue-400" 
      />
      <StatItem 
        label="Dorințe Active" 
        value={stats.activeWishes} 
        colorClass="text-green-600 dark:text-green-400" 
      />
      <StatItem 
        label="Total Dorințe" 
        value={stats.totalWishes} 
        colorClass="text-purple-600 dark:text-purple-400" 
      />
    </div>
  );
};

UserStats.propTypes = {
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  stats: PropTypes.shape({
    credits: PropTypes.number,
    activeWishes: PropTypes.number,
    totalWishes: PropTypes.number
  })
};

export default UserStats;
