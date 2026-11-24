import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-[96vw]'
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs transition-all overflow-y-auto">
      {/* Full screen backdrop click handler */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className={`relative bg-[#1F2937] text-[#F3F4F6] rounded-xl shadow-2xl border border-[#303B4D] w-full ${widthClasses[maxWidth]} overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-2 sm:my-8 z-10`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#303B4D] bg-[#243244]">
          <h3 className="text-sm sm:text-base font-semibold text-[#F3F4F6] leading-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 text-[#9CA3AF] hover:text-[#F3F4F6] rounded-md transition-colors hover:bg-[#1F2937] ml-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto text-[#F3F4F6]">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
