import React, { createContext, useContext, useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Render Node */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none w-full max-w-sm">
        {toasts.map(toast => (
          <ToastCard 
            key={toast.id} 
            toast={toast} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

interface ToastCardProps {
  toast: ToastMessage;
  onClose: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-3
        px-5 py-4 rounded-2xl
        shadow-xl backdrop-blur-xl border
        animate-slide-up
        ${toast.type === 'success' && 'bg-emerald-ai/10 dark:bg-emerald-ai/5 border-emerald-ai/30 text-emerald-ai'}
        ${toast.type === 'error' && 'bg-error/10 dark:bg-error/5 border-error/30 text-error'}
        ${toast.type === 'info' && 'bg-primary/10 dark:bg-primary/5 border-primary/30 text-primary'}
      `}
    >
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {toast.type === 'success' && 'check_circle'}
        {toast.type === 'error' && 'error'}
        {toast.type === 'info' && 'info'}
      </span>
      <p className="font-body-sm font-semibold text-on-surface flex-1 leading-snug">{toast.message}</p>
      <button 
        onClick={onClose}
        className="text-on-surface opacity-50 hover:opacity-100 transition-opacity active:scale-90"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
