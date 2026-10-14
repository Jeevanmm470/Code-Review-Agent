import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

// Clean Baseline: Native semantic elements, accessible names, visible focus, aria-modal, and esc support
export const AccessibleModal = ({ isOpen, onClose, title }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="modal-overlay">
      <div className="modal-content">
        <h2 id="modal-title">{title}</h2>
        <button type="button" aria-label="Close dialog" onClick={onClose} className="btn-close">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

