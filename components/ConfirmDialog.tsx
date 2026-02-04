'use client'

type ConfirmDialogProps = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean
  loading?: boolean
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-3 sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto border-2 border-slate-300">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-base font-semibold text-gray-700 mb-6 break-words">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded border-2 border-slate-400 bg-white px-4 py-3 text-base font-bold text-gray-800 hover:bg-slate-50 disabled:opacity-50 touch-manipulation w-full sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              isDestructive
                ? 'rounded px-4 py-3 text-base font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 touch-manipulation w-full sm:w-auto'
                : 'btn-primary px-4 py-3 w-full sm:w-auto'
            }
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
