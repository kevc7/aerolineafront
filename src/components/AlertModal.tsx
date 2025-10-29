interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
  onClose: () => void;
}

export default function AlertModal({
  isOpen,
  title,
  message,
  type = 'info',
  buttonText = 'Aceptar',
  onClose
}: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <div className="text-5xl mb-4">✅</div>;
      case 'error':
        return <div className="text-5xl mb-4">❌</div>;
      case 'warning':
        return <div className="text-5xl mb-4">⚠️</div>;
      default:
        return <div className="text-5xl mb-4">ℹ️</div>;
    }
  };

  const getHeaderClass = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-b border-green-200';
      case 'error':
        return 'bg-red-50 border-b border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-b border-yellow-200';
      default:
        return 'bg-blue-50 border-b border-blue-200';
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-primary hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className={`px-6 py-4 ${getHeaderClass()}`}>
          <div className="flex items-center justify-center">
            {getIcon()}
          </div>
          <h3 className="text-xl font-bold text-gray-800 text-center">{title}</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-600 text-base leading-relaxed text-center">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${getButtonClass()}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

