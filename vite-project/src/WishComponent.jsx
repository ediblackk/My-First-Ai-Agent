import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

const WishComponent = () => {
  // Make wallet optional for viewing
  const wallet = useWallet();
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [extraCharacters, setExtraCharacters] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [roundInfo, setRoundInfo] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Only fetch user credits if wallet is connected
  useEffect(() => {
    if (wallet?.publicKey) {
      fetchUserCredits();
    }
  }, [wallet?.publicKey]);

  // Always fetch round info
  useEffect(() => {
    fetchRoundInfo();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/credits`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserCredits(response.data.credits);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const fetchRoundInfo = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/wishes/current-round`);
      setRoundInfo(response.data);
    } catch (error) {
      console.error('Error fetching round info:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet?.publicKey) {
      setError('Te rugăm să te conectezi folosind butonul din header');
      return;
    }

    if (userCredits < tokensUsed) {
      setError('Credite insuficiente. Încarcă mai multe tokenuri folosind butonul din bara de sus');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSubmitStatus(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/wishes/create`,
        { content: message },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );

      setSubmitStatus('Dorința a fost trimisă cu succes!');
      setMessage('');
      setCharCount(0);
      setTokensUsed(0);
      
      // Update credits and round info
      setUserCredits(response.data.remainingCredits);
      if (response.data.round) {
        setRoundInfo(prev => ({
          ...prev,
          ...response.data.round
        }));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Eroare la trimiterea dorinței');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtraCharacters = (e) => {
    setExtraCharacters(e.target.checked);
  };

  useEffect(() => {
    let newCharCount = message.length;
    setCharCount(newCharCount);

    let tokens = 0;
    if (newCharCount <= 50) {
      tokens = Math.floor(newCharCount / 10);
    } else if (newCharCount <= 100) {
      tokens = 5 + Math.floor((newCharCount - 50) / 10) * 2;
    } else if (newCharCount <= 200) {
      tokens = 15 + Math.floor((newCharCount - 100) / 10) * 3;
    } else {
      if (extraCharacters) {
        tokens = 45 + Math.floor((newCharCount - 200) / 10) * 5;
      } else {
        newCharCount = 200;
        tokens = 45;
      }
    }
    setTokensUsed(tokens);

    if (!extraCharacters && message.length > 200) {
      setMessage(message.slice(0, 200));
    }
  }, [message, extraCharacters]);
 
  return (
    <div className="w-full h-full"> 
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        {/* Logo animation */}
        <div className="flex justify-center">
          <div className="w-full md:max-w-md lg:max-w-md">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-auto max-h-48 object-cover" 
            >
              <source src="./src/assets/video.mp4" type="video/mp4"/>
              Your Browser Does not support the video tag.
            </video>
          </div>
        </div>
        
        {/* Round Info */}
        {roundInfo && (
          <div className="text-center py-2 px-4">
            <p className="text-sm text-gray-600">
              Runda Curentă: {roundInfo.status}
              {roundInfo.status === 'pending' && (
                <span> ({roundInfo.currentWishes}/{roundInfo.requiredWishes} dorințe necesare)</span>
              )}
            </p>
          </div>
        )}

        {/* Wallet Connection Status */}
        {!wallet?.publicKey && (
          <div className="mx-4 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-center">
            Conectează-ți portofelul din header pentru a trimite dorințe
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mx-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {submitStatus && (
          <div className="mx-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
            {submitStatus}
          </div>
        )}
        
        {/* Wish Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 px-4 pb-4">
          <div>
            <label htmlFor="message" className="sr-only">Mesaj</label>
            <textarea 
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={wallet?.publicKey ? "Scrie-ți dorința..." : "Conectează portofelul pentru a face o dorință"}
              className="w-full h-40 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm overflow-y-auto resize-none"
              maxLength={extraCharacters ? 400 : 200}
              disabled={isSubmitting || !wallet?.publicKey}
            />
            <p className="text-sm text-gray-600 mt-1">
              Caractere: {charCount}{extraCharacters ? '/400' : '/200'} - 
              Credite Necesare: {tokensUsed} 
              (Cost per 10 caractere: {charCount <= 50 ? '1' : charCount <= 100 ? '2' : charCount <= 200 ? '3' : '5'} credite)
            </p>
          </div>
          
          <div className="flex items-center mb-2 relative">
            <input 
              type="checkbox" 
              id="extraChars" 
              checked={extraCharacters} 
              onChange={handleExtraCharacters}
              disabled={true}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <label htmlFor="extraChars" className="ml-2 text-sm text-gray-700 relative group">
              Adaugă 200 de caractere extra (5 credite / 10 caractere)
              <span className="absolute left-0 top-full w-max mt-1 z-10 bg-gray-700 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Indisponibil momentan
              </span>
            </label>
          </div>
  
          <button 
            type="submit"
            disabled={isSubmitting || !wallet?.publicKey || userCredits < tokensUsed}
            className={`w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white 
              ${isSubmitting || !wallet?.publicKey || userCredits < tokensUsed 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
          >
            {!wallet?.publicKey 
              ? 'Conectează Portofelul pentru a Trimite' 
              : isSubmitting 
                ? 'Se trimite...' 
                : 'Trimite Dorința'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WishComponent;
