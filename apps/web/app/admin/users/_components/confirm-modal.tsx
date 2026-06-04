'use client';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDangerous ? 'bg-red-50' : 'bg-slate-50'}`}>
            <h2 className={`text-lg font-bold ${isDangerous ? 'text-red-900' : 'text-slate-900'}`}>
              {title}
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {typeof description === 'string' ? (
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {description}
              </p>
            ) : (
              description
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t bg-slate-50 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
