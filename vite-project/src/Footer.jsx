import React from 'react';
import Logo from './assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-10 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-between">
                    {/* Logo */}
                    <div className="w-full md:w-1/3 mb-6 md:mb-0">
                        <a href="/" className="flex items-center">
                            <img
                                src={Logo}
                                alt="Make a wish"
                                className="h-12 w-auto mr-3"
                            />
                            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                                Make-A-Wish
                            </span>
                        </a>
                    </div>
                    
                    {/* Links */}
                    <div className="w-full md:w-2/3 flex flex-wrap justify-end">
                        <div className="w-full sm:w-1/2 md:w-1/4 mb-4 md:mb-0">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
                                Resurse
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="/despre" className="hover:text-blue-600 transition-colors">
                                        Despre
                                    </a>
                                </li>
                                <li>
                                    <a href="/blog" className="hover:text-blue-600 transition-colors">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="/support" className="hover:text-blue-600 transition-colors">
                                        Suport
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="w-full sm:w-1/2 md:w-1/4 mb-4 md:mb-0">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
                                Legal
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="/politica-de-confidentialitate" className="hover:text-blue-600 transition-colors">
                                        Politica de Confidențialitate
                                    </a>
                                </li>
                                <li>
                                    <a href="/termeni-si-conditii" className="hover:text-blue-600 transition-colors">
                                        Termeni și Condiții
                                    </a>
                                </li>
                                <li>
                                    <a href="/cookies" className="hover:text-blue-600 transition-colors">
                                        Politica de Cookies
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="w-full sm:w-1/2 md:w-1/4 mb-4 md:mb-0">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">
                                Contact
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <a 
                                        href="mailto:contact@wishhub.ro" 
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        contact@wishhub.ro
                                    </a>
                                </li>
                                <li>
                                    <span className="opacity-50">
                                        Telefon în curând
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm">
                    <p>
                        &copy; {new Date().getFullYear()} Make-A-Wish. Toate drepturile rezervate.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
