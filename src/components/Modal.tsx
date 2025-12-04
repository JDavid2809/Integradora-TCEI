import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 min-w-[350px] max-w-lg w-full relative border border-gray-100 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
