import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../WalletProviderWrapper';

// Import componente admin
import ConfigSection from '../components/admin/ConfigSection';
import StatsSection from '../components/admin/StatsSection';
import UsersSection from '../components/admin/UsersSection';
import SystemSection from '../components/admin/SystemSection';

const AdminDashboard = () => {
  const { publicKey, connected } = useWallet();
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('stats');

  // Render unauthorized state
  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Acces interzis! </strong>
            <span className="block sm:inline">
              Conectați-vă cu un portofel de administrator.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render unauthorized state
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Acces interzis! </strong>
            <span className="block sm:inline">
              Nu aveți permisiuni de administrator.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render admin dashboard
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panou Administrare
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <button
                  onClick={() => setActiveSection('stats')}
                  className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                    activeSection === 'stats'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Statistici
                </button>
                <button
                  onClick={() => setActiveSection('users')}
                  className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                    activeSection === 'users'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Utilizatori
                </button>
                <button
                  onClick={() => setActiveSection('config')}
                  className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                    activeSection === 'config'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Configurări
                </button>
                <button
                  onClick={() => setActiveSection('system')}
                  className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                    activeSection === 'system'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Sistem
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-6">
            {activeSection === 'stats' && <StatsSection />}
            {activeSection === 'users' && <UsersSection />}
            {activeSection === 'config' && <ConfigSection />}
            {activeSection === 'system' && <SystemSection />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
