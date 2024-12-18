import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import api from '../utils/axios';

const TokenLoader = ({ onSuccess, onClose }) => {
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLoading, setIsRateLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [splits, setSplits] = useState({ prizePool: 0, admin: 0 });
  const [rates, setRates] = useState(null);
  const [expectedCredits, setExpectedCredits] = useState(0);
  const [lastRateUpdate, setLastRateUpdate] = useState(null);

  // Fetch current rates when component mounts and periodically
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setError(''); // Clear any previous errors
        setIsRateLoading(true);
        
        const response = await api.get('/api/rates/current');
        
        if (response.data.success) {
          setRates(response.data.rates);
          setLastRateUpdate(new Date());
          console.log('Rates updated:', response.data.rates);
        } else {
          throw new Error(response.data.error || 'Failed to fetch rates');
        }
      } catch (error) {
        console.error('Error fetching rates:', error);
        // Check if it's an authentication error
        if (error.response?.status === 401) {
          setError('Vă rugăm să vă reconectați portofelul');
        } else {
          setError('Nu s-au putut încărca ratele curente. Vă rugăm încercați din nou.');
        }
        setRates(null);
      } finally {
        setIsRateLoading(false);
      }
    };

    // Initial fetch
    fetchRates();

    // Refresh rates every 10 seconds
    const interval = setInterval(fetchRates, 10000);
    return () => clearInterval(interval);
  }, []);

  // Get transaction from backend to get accurate credit estimate
  const getTransactionEstimate = async (amount) => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;

    try {
      const response = await api.post('/api/transactions/create', {
        amount: parseFloat(amount),
        publicKey: publicKey.toString()
      });

      if (response.data.success) {
        setSplits(response.data.splits);
        setExpectedCredits(response.data.expectedCredits);
      }
    } catch (error) {
      console.error('Error getting estimate:', error);
      if (error.response?.status === 401) {
        setError('Vă rugăm să vă reconectați portofelul');
      }
    }
  };

  // Update estimates when amount changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (amount) {
        getTransactionEstimate(amount);
      } else {
        setSplits({ prizePool: 0, admin: 0 });
        setExpectedCredits(0);
      }
    }, 500); // Delay by 500ms to avoid too many requests

    return () => clearTimeout(delayDebounceFn);
  }, [amount, publicKey]);

  const checkTransactionStatus = async (signature) => {
    try {
      const response = await api.get(`/api/transactions/status/${signature}`);
      return response.data.status === 'confirmed';
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return false;
    }
  };

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

      // Update split information and expected credits from server response
      setSplits(createResponse.data.splits);
      setExpectedCredits(createResponse.data.expectedCredits);

      // Deserialize the transaction
      const transaction = Transaction.from(
        Buffer.from(createResponse.data.transaction, 'base64')
      );

      setStatus('Se solicită semnătura...');

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent, signature:', signature);
      
      setStatus('Se confirmă tranzacția...');

      // Wait for confirmation
      let confirmed = false;
      for (let i = 0; i < 30 && !confirmed; i++) {
        confirmed = await checkTransactionStatus(signature);
        if (!confirmed) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!confirmed) {
        throw new Error('Timpul de confirmare a tranzacției a expirat');
      }

      setStatus('Se validează tranzacția...');

      // Validate transaction with backend
      console.log('Validating transaction:', signature);
      const validateResponse = await api.post('/api/transactions/validate', {
        publicKey: publicKey.toString(),
        signature
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
      if (err.response?.status === 401) {
        setError('Vă rugăm să vă reconectați portofelul');
      } else {
        setError(err.response?.data?.error || err.message || 'Eroare la încărcarea tokenurilor');
      }
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
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Suma introdusă va fi împărțită: {rates?.splits.prizePool}% fond premii, {rates?.splits.admin}% administrare
          </p>
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

        {rates && (
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">Rata Curentă:</p>
              {lastRateUpdate && (
                <span className="text-xs text-gray-500">
                  Actualizat: {lastRateUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
            <p>1 SOL = {Number(rates.solToCredits)} Credite</p>
            {amount && !isNaN(amount) && (
              <p className="mt-1">
                Credite Estimate: {expectedCredits}
                {isRateLoading && <span className="ml-2 text-xs">(se actualizează...)</span>}
              </p>
            )}
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Distribuție:</p>
          <ul className="list-disc list-inside">
            <li>Fond de Premii ({rates?.splits.prizePool}%): {splits.prizePool} SOL</li>
            <li>Administrare ({rates?.splits.admin}%): {splits.admin} SOL</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            * Suma totală ce va fi dedusă: {amount ? Number(amount).toFixed(2) : '0'} SOL
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !rates}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            isLoading || !rates
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Se procesează...' : rates ? 'Încarcă Tokenuri' : 'Se încarcă ratele...'}
        </button>
      </form>
    </div>
  );
};

export default TokenLoader;
