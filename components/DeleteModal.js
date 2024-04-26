import { useState } from 'react'
import { useTranslation } from 'next-i18next'

const DeleteModal = ({ onCancel, onConfirm, confirmationText, safety, nameDelete }) => {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState(false)

  const handleConfirm = () => {
    if (safety && inputValue.toLowerCase() === nameDelete) {
      onConfirm()
    } else if (!safety) {
      onConfirm()
    } else {
      setInputError(true)
    }
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded p-4">
        <p className="text-lg font-medium">{confirmationText}</p>
        {safety && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setInputError(false)
            }}
            className={`border rounded px-3 py-1 mt-2 ${
              inputError ? 'border-red-600' : 'border-gray-300'
            }`}
            placeholder={t('enterName')}
          />
        )}
        <div className="flex justify-end mt-4">
          <button
            className="text-gray-500 hover:text-gray-700 px-3 py-1"
            onClick={onCancel}
          >
            {t('cancel')}
          </button>
          <button
            className="text-red-600 hover:text-red-800 px-3 py-1 ml-2"
            onClick={handleConfirm}
          >
            {t('delete')}
          </button>
        </div>
        {inputError && <p className="text-red-600 mt-2">{t('incorrectName')}</p>}
      </div>
    </div>
  )
}

export default DeleteModal
