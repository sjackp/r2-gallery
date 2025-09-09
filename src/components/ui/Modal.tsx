'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ open, title, onClose, children, footer, className }: ModalProps) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative z-10 w-[min(92vw,720px)] max-h-[90vh] flex flex-col rounded-2xl bg-white/80 backdrop-blur-2xl border border-black/10 shadow-xl',
              className
            )}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              {title && (
                <h3 className="text-base font-semibold text-gray-800">{title}</h3>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-2 hover:bg-black/5 transition"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            <div className="px-5 pb-4 text-gray-800 flex-1 overflow-auto">{children}</div>
            {footer && <div className="px-5 pt-3 pb-5 border-t border-black/5">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}

export default Modal;
