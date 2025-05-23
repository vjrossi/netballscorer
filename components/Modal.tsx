import React from 'react';
import { CloseIcon } from '../icons.tsx'; // Renamed from icons.jsx

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className={`bg-slate-800 p-6 rounded-lg shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-appear`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-sky-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-sky-400 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="text-slate-300">{children}</div>
      </div>
      <style>
        {`
          @keyframes modal-appear {
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-modal-appear {
            animation: modal-appear 0.3s forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Modal;