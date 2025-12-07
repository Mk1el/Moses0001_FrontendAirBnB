import React from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: string; 
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  width = "max-w-md",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center z-50">
      <div className={`bg-white p-6 rounded-2xl w-full ${width} shadow-lg`}>
        {title && (
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            {title}
          </h2>
        )}

        {/* Dynamic Content */}
        <div>{children}</div>

        {/* Close */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
