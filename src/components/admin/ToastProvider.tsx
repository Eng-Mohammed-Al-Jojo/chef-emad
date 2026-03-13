import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle, FiX } from "react-icons/fi";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: <FiCheckCircle className="text-green-500" />,
    error: <FiXCircle className="text-red-500" />,
    info: <FiInfo className="text-blue-500" />,
    warning: <FiAlertCircle className="text-orange-500" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10000 flex flex-col gap-3 items-center pointer-events-none w-full max-w-md px-4" dir="rtl">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="pointer-events-auto w-full glass-morphic border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 bg-luxury-black/80 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl shrink-0">
                    {icons[toast.type]}
                  </div>
                  <p className="text-white font-bold text-sm leading-relaxed">
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-white/20 hover:text-white transition-colors p-1"
                >
                  <FiX size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
