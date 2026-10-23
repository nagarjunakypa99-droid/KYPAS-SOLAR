import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCRM();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        const getToastStyles = () => {
          switch (toast.type) {
            case 'success':
              return {
                border: 'border-emerald-300 dark:border-emerald-800',
                bg: 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100',
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
              };
            case 'error':
              return {
                border: 'border-rose-300 dark:border-rose-800',
                bg: 'bg-rose-50 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100',
                icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
              };
            case 'warning':
              return {
                border: 'border-amber-300 dark:border-amber-800',
                bg: 'bg-amber-50 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100',
                icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
              };
            default:
              return {
                border: 'border-blue-300 dark:border-blue-800',
                bg: 'bg-blue-50 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100',
                icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
              };
          }
        };

        const style = getToastStyles();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 ${style.bg} ${style.border}`}
          >
            {style.icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              <p className="mt-0.5 text-xs opacity-90 break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
