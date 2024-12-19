import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from './WalletProviderWrapper';
import SubHeader from './components/SubHeader';

const Header = () => {
    const { isAdmin } = useAuth();
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <header>
            <div className="bg-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo și titlu */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center">
                                <img src="/public/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
                                <span className="text-xl font-bold">Make-A-Wish</span>
                            </Link>
                        </div>

                        {/* Navigare */}
                        <nav className="hidden md:flex items-center space-x-4">
                            <Link 
                                to="/" 
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    location.pathname === '/' 
                                        ? 'bg-gray-900 text-white' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                Acasă
                            </Link>
                            {isAdmin && (
                                <Link 
                                    to="/admin" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        isAdminPage
                                            ? 'bg-gray-900 text-white' 
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    Admin
                                </Link>
                            )}
                            <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
                        </nav>
                    </div>
                </div>
            </div>
            {!isAdminPage && <SubHeader />}
        </header>
    );
};

export default Header;
