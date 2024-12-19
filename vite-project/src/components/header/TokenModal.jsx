import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal';
import TokenLoader from '../TokenLoader';

const TokenModal = ({ isOpen, onClose, onSuccess }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Încarcă Tokenuri"
    >
      <TokenLoader 
        onSuccess={onSuccess}
        onClose={onClose}
      />
    </Modal>
  );
};

TokenModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default TokenModal;
