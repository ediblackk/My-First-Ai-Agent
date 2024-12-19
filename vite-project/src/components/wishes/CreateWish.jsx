import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../utils/axios';

const CreateWish = ({ onSuccess, onClose }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [step, setStep] = useState('input'); // input, preview, processing

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Vă rugăm introduceți dorința');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      setStep('processing');

      const response = await api.post('/api/wishes', { content });
      
      if (response.data.success) {
        onSuccess?.(response.data.wish);
        onClose?.();
      }
    } catch (err) {
      console.error('Error creating wish:', err);
      setError(err.response?.data?.error || 'Eroare la crearea dorinței');
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Complexitate
          </h3>
          <div className="mt-1 flex items-center">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(analysis.complexity / 10) * 100}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {analysis.complexity}/10
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Categorii
          </h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {analysis.categories.map((category, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Provocări Potențiale
          </h3>
          <ul className="mt-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
            {analysis.challenges.map((challenge, index) => (
              <li key={index}>{challenge}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Resurse Necesare
          </h3>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            <p>Timp estimat: {analysis.resources.timeEstimate}</p>
            <div className="mt-2">
              <p className="font-medium">Abilități necesare:</p>
              <ul className="list-disc list-inside">
                {analysis.resources.skillsRequired.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="content" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Dorința Ta
              </label>
              <div className="mt-1">
                <textarea
                  id="content"
                  rows={4}
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descrie dorința ta aici..."
                  disabled={isLoading}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Minim 10 caractere, maxim 1000
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300"
              >
                Anulare
              </button>
              <button
                type="button"
                onClick={() => setStep('preview')}
                disabled={content.length < 10 || isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Continuare
              </button>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Previzualizare Dorință
              </h3>
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-gray-700 dark:text-gray-300">{content}</p>
              </div>
            </div>

            {renderAnalysis()}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300"
              >
                Înapoi
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? 'Se procesează...' : 'Creează Dorința'}
              </button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Se procesează dorința ta...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md p-4">
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

      {renderStep()}
    </div>
  );
};

CreateWish.propTypes = {
  onSuccess: PropTypes.func,
  onClose: PropTypes.func
};

export default CreateWish;
