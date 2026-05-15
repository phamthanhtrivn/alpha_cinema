import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-sm',
  showCloseButton = true,
}) => {
  // Ngăn chặn cuộn trang khi modal đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-y-auto bg-black/60">
      {/* Overlay: Lớp nền mờ */}
      <div
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-sm transform transition-all duration-300 ease-out 
          animate-in fade-in zoom-in duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng (X) */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute hover:cursor-pointer right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-[2001]"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* Nội dung Modal */}
        <div className="p-5">
          {title && (
            <div className="mb-8">
              {typeof title === 'string' ? (
                <h2 className="text-lg font-semibold text-slate-700 text-center">
                  {title}
                </h2>
              ) : (
                title
              )}
            </div>
          )}

          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
