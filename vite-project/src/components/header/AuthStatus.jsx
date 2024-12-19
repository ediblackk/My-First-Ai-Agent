import React from 'react';
import PropTypes from 'prop-types';

const AuthStatus = ({ isAuthenticating, authError }) => {
  const containerClasses = "bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600";
  const textContainerClasses = "container mx-auto px-4 py-3";
  const centerClasses = "flex items-center justify-center";
  
  if (isAuthenticating) {
    return (
      <div className={containerClasses}>
        <div className={textContainerClasses}>
          <div className={centerClasses}>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Se autentifică...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className={containerClasses}>
        <div className={textContainerClasses}>
          <div className={centerClasses}>
            <div className="text-center">
              <p className="text-red-500 dark:text-red-400">
                Eroare de autentificare: {authError}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

AuthStatus.propTypes = {
  isAuthenticating: PropTypes.bool,
  authError: PropTypes.string
};

export default AuthStatus;
