import React, { useState, useEffect } from 'react';
import AdminService from '../../services/adminService';

const ConfigItem = ({ 
  configKey, 
  value, 
  category, 
  description, 
  onUpdate,
  loading,
  disabled 
}) => {
  const [editValue, setEditValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleUpdate = async () => {
    try {
      setError(null);
      await onUpdate(configKey, editValue);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderEditControl = () => {
    if (typeof value === 'boolean') {
      return (
        <select
          value={editValue.toString()}
          onChange={(e) => setEditValue(e.target.value === 'true')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
          disabled={disabled}
        >
          <option value="true">Da</option>
          <option value="false">Nu</option>
        </select>
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          disabled={disabled}
        />
      );
    }

    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
        disabled={disabled}
      />
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-4">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {configKey}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Categorie: {category}
            </p>
          </div>
          <div className="ml-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                disabled={disabled}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:text-blue-400 dark:bg-blue-900/50"
              >
                Editare
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdate}
                  disabled={disabled}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:text-green-400 dark:bg-green-900/50"
                >
                  Salvare
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditValue(value);
                    setError(null);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:text-gray-400 dark:bg-gray-900/50"
                >
                  Anulare
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-4">
            {renderEditControl()}
          </div>
        )}

        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!isEditing && (
          <div className="mt-2">
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {loading ? (
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              ) : (
                typeof value === 'boolean' ? (value ? 'Da' : 'Nu') : value
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ConfigSection = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const fetchConfigs = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await AdminService.getConfig();
      if (response.success) {
        setConfigs(response.configs);
      }
    } catch (err) {
      console.error('Error fetching configs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleUpdateConfig = async (key, value) => {
    try {
      const response = await AdminService.updateConfig(key, value);
      if (response.success) {
        // Actualizare locală
        setConfigs(configs.map(config => 
          config.key === key ? { ...config, value } : config
        ));
      }
    } catch (err) {
      console.error('Error updating config:', err);
      throw err;
    }
  };

  const categories = ['ALL', 'SYSTEM', 'AI', 'GAME', 'SECURITY'];
  const filteredConfigs = activeCategory === 'ALL' 
    ? configs 
    : configs.filter(config => config.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configurări Sistem
        </h2>
        <button
          onClick={fetchConfigs}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reîmprospătare
        </button>
      </div>

      {/* Filtre categorii */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Eroare la încărcarea configurărilor
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          filteredConfigs.map(config => (
            <ConfigItem
              key={config.key}
              configKey={config.key}
              value={config.value}
              category={config.category}
              description={config.description}
              onUpdate={handleUpdateConfig}
              loading={loading}
              disabled={loading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConfigSection;
