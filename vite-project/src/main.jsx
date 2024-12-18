import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './app.css';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Create a wrapper component to handle any global providers or context
const MainApp = () => {
  return (
    <React.StrictMode>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <App />
      </div>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<MainApp />);
