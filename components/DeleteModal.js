import { useTranslation } from 'next-i18next'

const DeleteModal = ({ onCancel, onConfirm, confirmationText }) => {
  const { t } = useTranslation()

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded p-4">
        <p className="text-lg font-medium">{confirmationText}</p>{' '}
        <div className="flex justify-end mt-4">
          <button
            className="text-gray-500 hover:text-gray-700 px-3 py-1"
            onClick={onCancel}
          >
            {t('cancel')}
          </button>
          <button
            className="text-red-600 hover:text-red-800 px-3 py-1 ml-2"
            onClick={onConfirm}
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
