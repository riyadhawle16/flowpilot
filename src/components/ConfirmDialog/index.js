import React, { useEffect, useRef } from 'react';
import './ConfirmDialog.css';

/**
 * ConfirmDialog — reusable confirmation modal.
 *
 * Props:
 *   isOpen       {boolean}
 *   title        {string}
 *   message      {string}
 *   confirmLabel {string}   default "Confirm"
 *   cancelLabel  {string}   default "Cancel"
 *   isDangerous  {boolean}  — red confirm button
 *   isLoading    {boolean}
 *   onConfirm    {() => void}
 *   onCancel     {() => void}
 */
function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const cancelBtnRef = useRef(null);

  // Focus cancel button on open (safer default)
  useEffect(() => {
    if (isOpen) cancelBtnRef.current?.focus();
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-msg"
    >
      <div className="confirm-dialog">
        {/* Icon */}
        <div className={`confirm-dialog__icon ${isDangerous ? 'confirm-dialog__icon--danger' : ''}`}>
          {isDangerous ? '🗑️' : '❓'}
        </div>

        <h2 id="confirm-dialog-title" className="confirm-dialog__title">
          {title}
        </h2>
        <p id="confirm-dialog-msg" className="confirm-dialog__message">
          {message}
        </p>

        <div className="confirm-dialog__actions">
          <button
            ref={cancelBtnRef}
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            onClick={onCancel}
            disabled={isLoading}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`confirm-dialog__btn ${
              isDangerous
                ? 'confirm-dialog__btn--danger'
                : 'confirm-dialog__btn--confirm'
            }`}
            onClick={onConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
            type="button"
          >
            {isLoading ? (
              <span className="confirm-dialog__spinner" aria-hidden="true" />
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
