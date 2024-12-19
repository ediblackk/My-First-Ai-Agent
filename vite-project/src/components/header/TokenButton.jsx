import React from 'react';
import PropTypes from 'prop-types';

const TokenButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition-colors"
    >
      Încarcă Tokenuri
    </button>
  );
};

TokenButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default TokenButton;
