interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'danger' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'primary',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    const baseClass = 'flex-1 px-6 py-2 rounded-lg font-semibold transition-colors';
    switch (confirmColor) {
      case 'danger':
        return `${baseClass} bg-red-600 hover:bg-red-700 text-white`;
      case 'success':
        return `${baseClass} bg-green-600 hover:bg-green-700 text-white`;
      default:
        return `${baseClass} bg-primary hover:bg-blue-700 text-white`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-600 text-base leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-gray-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={getConfirmButtonClass()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

