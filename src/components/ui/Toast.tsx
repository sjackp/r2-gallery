'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  show: boolean;
}

export function Toast({ message, show }: ToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-lg text-white px-4 py-2 rounded-full shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
