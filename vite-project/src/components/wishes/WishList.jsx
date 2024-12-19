import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import api from '../../utils/axios';
import Modal from '../Modal';
import CreateWish from './CreateWish';
import WishDetails from './WishDetails';

const WishCard = ({ wish, onClick }) => {
  const getStatusColor = () => {
    switch (wish.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-500';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-500';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-500';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {wish.status}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(wish.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-gray-900 dark:text-white line-clamp-2">
          {wish.content}
        </p>
      </div>

      <div className="mt-4">
        <div className="flex items-center">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${(wish.analysis.complexity / 10) * 100}%` }}
            ></div>
          </div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {wish.analysis.complexity}/10
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {wish.analysis.categories.slice(0, 3).map((category, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-500"
          >
            {category}
          </span>
        ))}
        {wish.analysis.categories.length > 3 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-500">
            +{wish.analysis.categories.length - 3}
          </span>
        )}
      </div>
    </div>
  );
};

const WishList = () => {
  const { connected } = useWallet();
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWish, setSelectedWish] = useState(null);

  const fetchWishes = async () => {
    if (!connected) return;

    try {
      setError(null);
      setLoading(true);

      const params = {
        page,
        limit: 9
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/api/wishes', { params });
      
      if (response.data.success) {
        setWishes(response.data.wishes);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      console.error('Error fetching wishes:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea dorințelor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, [connected, page, statusFilter]);

  const handleCreateSuccess = (wish) => {
    setWishes([wish, ...wishes]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateStatus = async (wishId, newStatus) => {
    try {
      const response = await api.put(`/api/wishes/${wishId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        setWishes(wishes.map(w => 
          w._id === wishId 
            ? { ...w, status: newStatus }
            : w
        ));
        setSelectedWish(null);
      }
    } catch (error) {
      console.error('Error updating wish status:', error);
    }
  };

  if (!connected) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Conectează-te pentru a vedea dorințele tale
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dorințele Tale
          </h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Toate</option>
            <option value="pending">În Așteptare</option>
            <option value="in_progress">În Progres</option>
            <option value="completed">Completate</option>
            <option value="cancelled">Anulate</option>
          </select>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Dorință Nouă
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : wishes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Nu ai nicio dorință încă
          </p>
        </div>
      ) : (
        <>
          {/* Grid de dorințe */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishes.map(wish => (
              <WishCard
                key={wish._id}
                wish={wish}
                onClick={() => setSelectedWish(wish)}
              />
            ))}
          </div>

          {/* Paginare */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300`}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Pagina {page} din {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300`}
            >
              Următor
            </button>
          </div>
        </>
      )}

      {/* Modal creare dorință */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Dorință Nouă"
      >
        <CreateWish
          onSuccess={handleCreateSuccess}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal detalii dorință */}
      <Modal
        isOpen={!!selectedWish}
        onClose={() => setSelectedWish(null)}
        title="Detalii Dorință"
      >
        {selectedWish && (
          <WishDetails
            wish={selectedWish}
            onUpdateStatus={(newStatus) => handleUpdateStatus(selectedWish._id, newStatus)}
          />
        )}
      </Modal>
    </div>
  );
};

export default WishList;
