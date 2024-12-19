import React from 'react';
import PropTypes from 'prop-types';

const ConnectPrompt = ({ message = '👋 Conectează-ți portofelul Solana pentru a începe să faci dorințe!' }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

ConnectPrompt.propTypes = {
  message: PropTypes.string
};

export default ConnectPrompt;
