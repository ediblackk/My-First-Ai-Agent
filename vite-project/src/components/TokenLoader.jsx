import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import api from '../utils/axios';

const TokenLoader = ({ onSuccess, onClose }) => {
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Vă rugăm introduceți o sumă validă');
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus('Se pregătește tranzacția...');

    try {
      const connection = new Connection(import.meta.env.VITE_SOLANA_RPC_URL, 'confirmed');

      // Get transaction from backend
      console.log('Creating transaction with amount:', amount);
      const createResponse = await api.post('/api/transactions/create', {
        amount: parseFloat(amount),
        publicKey: publicKey.toString()
      });

      if (!createResponse.data.success) {
        throw new Error(createResponse.data.error || 'Eroare la crearea tranzacției');
      }

      setStatus('Se solicită semnătura...');

      // Deserialize and send transaction
      const transaction = Transaction.from(
        Buffer.from(createResponse.data.transaction, 'base64')
      );

      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent, signature:', signature);
      
      setStatus('Se confirmă tranzacția...');

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);
      if (confirmation.value.err) {
        throw new Error('Tranzacția a eșuat');
      }

      setStatus('Se validează tranzacția...');

      // Validate transaction with backend
      const validateResponse = await api.post('/api/transactions/validate', {
        signature,
        publicKey: publicKey.toString()
      });

      if (validateResponse.data.success) {
        setStatus('Tranzacție reușită!');
        onSuccess?.(validateResponse.data.credits);
        onClose?.();
      } else {
        throw new Error(validateResponse.data.error || 'Validarea tranzacției a eșuat');
      }

    } catch (err) {
      console.error('Token loading error:', err);
      setError(err.message || 'Eroare la încărcarea tokenurilor');
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sumă (SOL)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Introduceți suma în SOL"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/10 p-2 rounded">
            {error}
          </div>
        )}

        {status && (
          <div className="text-blue-600 text-sm bg-blue-50 dark:bg-blue-900/10 p-2 rounded">
            {status}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Se procesează...' : 'Încarcă SOL'}
        </button>
      </form>
    </div>
  );
};

export default TokenLoader;
