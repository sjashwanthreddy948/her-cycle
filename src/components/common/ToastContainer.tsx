import React from 'react';
import { useCycle } from '../../context/CycleContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCycle();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-white text-gray-800 border-rose-200';
        let icon = <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />;

        if (toast.type === 'error') {
          bg = 'bg-red-50 text-red-900 border-red-200';
          icon = <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
        } else if (toast.type === 'info') {
          bg = 'bg-pink-50 text-pink-900 border-pink-200';
          icon = <Info className="w-5 h-5 text-pink-500 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-float border ${bg} animate-fade-in transition-all`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/5 rounded-full text-gray-400 hover:text-gray-700 transition"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
