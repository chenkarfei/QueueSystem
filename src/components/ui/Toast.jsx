import { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from './Button';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900",
    error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900",
    warning: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900",
    info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900",
  };

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-4 shadow-md backdrop-blur-sm transition-all", bgColors[toast.type])}>
      {icons[toast.type]}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{toast.message}</p>
      <button onClick={onRemove} className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
