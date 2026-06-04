import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import './ToastContainer.css';

let toastId = 0;

const ToastContext = createContext(null);

// ─── Types: 'success' | 'error' | 'warning' | 'info' ─────────────────────────

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Trigger enter animation
    const enter = setTimeout(() => setVisible(true), 10);

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 4000);

    return () => {
      clearTimeout(enter);
      clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleDismiss = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`toast toast--${toast.type} ${visible ? 'toast--visible' : ''}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <span className="toast__icon" aria-hidden="true">
        {ICONS[toast.type] || ICONS.info}
      </span>
      <div className="toast__content">
        {toast.title && <div className="toast__title">{toast.title}</div>}
        <div className="toast__message">{toast.message}</div>
      </div>
      <button
        className="toast__close"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        type="button"
      >
        ✕
      </button>
      {/* Progress bar */}
      <div
        className="toast__progress"
        style={{ animationDuration: `${toast.duration || 4000}ms` }}
        aria-hidden="true"
      />
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message, type = 'info', options = {}) => {
    const id = ++toastId;
    setToasts((prev) => [
      ...prev.slice(-4), // keep max 5
      { id, message, type, ...options },
    ]);
    return id;
  }, []);

  const toast = useMemo(() => ({
    success: (msg, opts) => add(msg, 'success', opts),
    error:   (msg, opts) => add(msg, 'error',   opts),
    warning: (msg, opts) => add(msg, 'warning', opts),
    info:    (msg, opts) => add(msg, 'info',    opts),
    remove,
  }), [add, remove]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
