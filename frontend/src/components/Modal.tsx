import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullScreen?: boolean;
}

const Modal = ({ isOpen, onClose, title, children, fullScreen = false }: ModalProps) => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className={`relative bg-white rounded-lg shadow-xl transition-all ${
          fullScreen ? 'w-full h-[90vh] max-w-7xl' : 'w-full max-w-4xl'
        }`}>
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className={`${fullScreen ? 'h-[calc(90vh-73px)] overflow-auto' : 'max-h-[70vh] overflow-auto'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;