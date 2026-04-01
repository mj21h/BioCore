import React, { useEffect } from 'react';
import { Undo2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UndoToastProps {
  isVisible: boolean;
  message: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number;
}

export default function UndoToast({ isVisible, message, onUndo, onClose, duration = 5000 }: UndoToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 z-[100] flex justify-center pointer-events-none"
        >
          <div className="bg-surface-container-highest border border-yellow-400/30 shadow-2xl rounded-xl p-4 flex items-center justify-between gap-4 w-full max-w-md pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                <Undo2 size={18} />
              </div>
              <p className="text-sm font-medium text-on-surface">{message}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onUndo();
                  onClose();
                }}
                className="text-xs font-bold uppercase tracking-wider text-yellow-400 px-3 py-2 hover:bg-yellow-400/10 rounded-lg transition-colors"
              >
                Rückgängig
              </button>
              <button
                onClick={onClose}
                className="p-2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
