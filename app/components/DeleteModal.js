'use client'

import { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'

const DeleteModal = ({
  lng,
  isVisible,
  onConfirm,
  onCancel,
  onKeep,
  message,
  confirmText,
  cancelText,
  requireTextMatch = false,
  expectedText = '',
  showKeepButton = false,
}) => {
  const { t } = useTranslation(lng, 'common')
  const defaultConfirmText = confirmText || t('delete')
  const defaultCancelText = cancelText || t('cancel')
  const defaultKeepText = t('keep')

  const [inputText, setInputText] = useState('')

  const isTextMatch = () => {
    return inputText === expectedText
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded p-4">
        <p className="text-lg font-medium">{message}</p>

        {requireTextMatch && (
          <div className="mt-4">
            <label className="block text-raisin-black">
              {t('enterConfirm')} <strong>{expectedText}</strong>
            </label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
              placeholder={t('enterName')}
            />
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            className="text-gray-500 hover:text-raisin-black px-3 py-1"
            onClick={onCancel}
          >
            {defaultCancelText}
          </button>

          {showKeepButton && (
            <button
              className="text-orange-600 hover:text-orange-800 px-3 py-1 ml-2"
              onClick={onKeep}
            >
              {defaultKeepText}
            </button>
          )}

          <button
            className={`text-red-600 hover:text-red-800 px-3 py-1 ml-2 ${
              requireTextMatch && !isTextMatch() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={onConfirm}
            disabled={requireTextMatch && !isTextMatch()}
          >
            {defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
