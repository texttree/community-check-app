import { useTranslation } from '@/app/i18n/client'

const DeleteModal = ({
  lng,
  isVisible,
  onConfirm,
  onCancel,
  message,
  confirmText,
  cancelText,
}) => {
  const { t } = useTranslation(lng, 'common')
  const defaultConfirmText = confirmText || t('delete')
  const defaultCancelText = cancelText || t('cancel')
  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded p-4">
        <p className="text-lg font-medium">{message}</p>
        <div className="flex justify-end mt-4">
          <button
            className="text-gray-500 hover:text-gray-700 px-3 py-1"
            onClick={onCancel}
          >
            {defaultCancelText}
          </button>
          <button
            className="text-red-600 hover:text-red-800 px-3 py-1 ml-2"
            onClick={onConfirm}
          >
            {defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
