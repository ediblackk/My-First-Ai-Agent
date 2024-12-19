import React, { useState, useEffect } from 'react';
import AdminService from '../../services/adminService';

const LogViewer = ({ logs, loading, error }) => (
  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
    {loading ? (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    ) : error ? (
      <div className="text-red-600 dark:text-red-400">{error}</div>
    ) : logs.length === 0 ? (
      <div className="text-gray-500 dark:text-gray-400">Nu există loguri</div>
    ) : (
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div 
            key={index}
            className="text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{new Date(log.timestamp).toLocaleString()}</span>
              <span>{log.action}</span>
            </div>
            <div className="text-gray-900 dark:text-gray-100">
              {typeof log.details === 'string' 
                ? log.details 
                : JSON.stringify(log.details, null, 2)}
            </div>
            {log.adminPublicKey && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Admin: {log.adminPublicKey}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const SystemSection = () => {
  const [systemLogs, setSystemLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState({
    system: true,
    audit: true
  });
  const [error, setError] = useState({
    system: null,
    audit: null
  });
  const [activeTab, setActiveTab] = useState('system');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const fetchLogs = async () => {
    if (activeTab === 'system') {
      try {
        setLoading(prev => ({ ...prev, system: true }));
        setError(prev => ({ ...prev, system: null }));
        const response = await AdminService.getLogs();
        if (response.success) {
          setSystemLogs(response.logs);
        }
      } catch (err) {
        console.error('Error fetching system logs:', err);
        setError(prev => ({ ...prev, system: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, system: false }));
      }
    } else {
      try {
        setLoading(prev => ({ ...prev, audit: true }));
        setError(prev => ({ ...prev, audit: null }));
        const response = await AdminService.getAuditLogs();
        if (response.success) {
          setAuditLogs(response.logs);
        }
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError(prev => ({ ...prev, audit: err.message }));
      } finally {
        setLoading(prev => ({ ...prev, audit: false }));
      }
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Status Sistem
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label 
              htmlFor="autoRefresh" 
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Auto Refresh
            </label>
          </div>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            disabled={!autoRefresh}
            className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value={10}>10 secunde</option>
            <option value={30}>30 secunde</option>
            <option value={60}>1 minut</option>
            <option value={300}>5 minute</option>
          </select>
          <button
            onClick={fetchLogs}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reîmprospătare
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('system')}
            className={`${
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Loguri Sistem
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Audit Trail
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'system' ? (
        <LogViewer
          logs={systemLogs}
          loading={loading.system}
          error={error.system}
        />
      ) : (
        <LogViewer
          logs={auditLogs}
          loading={loading.audit}
          error={error.audit}
        />
      )}
    </div>
  );
};

export default SystemSection;
