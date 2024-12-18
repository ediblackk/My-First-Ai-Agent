import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import logoImage from "./assets/logo.png";

const Header = () => {
  const { connected } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logoImage}
              alt="Logo"
              className="h-20 w-auto max-w-xs transition-all duration-300 ease-in-out transform hover:scale-105"
            />
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors duration-300">Home</a>
            <a href="#" className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors duration-300">Features</a>
            <a href="#" className="text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors duration-300">Contact</a>
          </nav>

          {/* Wallet Button */}
          <div className="flex items-center">
            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 transition-colors" />
          </div>
        
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="p-2">
              <svg 
                className="fill-current h-8 w-8 text-blue-600 dark:text-blue-400"
                viewBox="0 0 24 24"
              >
                <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex flex-col space-y-4">
              <a href="#" className="block text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors duration-300">Home</a>
              <a href="#" className="block text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors duration-300">Features</a>
              <a href="#" className="block text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors duration-300">Contact</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
