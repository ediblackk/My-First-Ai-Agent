import React, { useState } from 'react';
import WalletProviderWrapper from './WalletProviderWrapper.jsx';
import Header from './Header.jsx';
import SubHeader from './components/SubHeader.jsx';
import MainComponent from './MainComponent.jsx';
import Footer from './Footer.jsx';
import LegalPrompt from './components/LegalPrompt.jsx';
import './app.css';

const App = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    return localStorage.getItem('hasAcceptedTerms') === 'true';
  });

  const handleAccept = () => {
    localStorage.setItem('hasAcceptedTerms', 'true');
    setHasAcceptedTerms(true);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <WalletProviderWrapper>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Fixed Headers - Never Blurred */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-md">
          <Header />
          <SubHeader />
        </div>

        {/* Legal Prompt */}
        {!hasAcceptedTerms && (
          <div className="fixed inset-0 z-50">
            <LegalPrompt 
              onAccept={handleAccept} 
              onDecline={handleDecline}
            />
          </div>
        )}
        
        {/* Main Content Container */}
        <div className="flex-grow">
          {/* Spacer for fixed headers */}
          <div className="h-40"></div>
          
          {/* Main Content */}
          <div className={`container mx-auto px-4 ${!hasAcceptedTerms ? 'pointer-events-none opacity-50' : ''}`}>
            <MainComponent />
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </WalletProviderWrapper>
  );
};

export default App;
