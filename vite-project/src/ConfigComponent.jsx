import React from 'react';
import WalletConnector from './WalletConnector';

const ConfigComponent = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4 text-center">Conectare Portofel Solana</h2>
        <WalletConnector />
      </div>
    </div>
  );
};

export default ConfigComponent;
