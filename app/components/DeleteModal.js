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
    <>
      <div className="fixed inset-0 bg-black/10 backdrop-blur-lg z-40"></div>
      <div className="fixed inset-0 flex items-center justify-center z-40">
        <div className="bg-white p-5 rounded-lg shadow-lg m-4">
          <p className="text-base">{message}</p>
          {requireTextMatch && (
            <div className="mt-4">
              <label className="block text-raisin-black">
                {t('enterConfirm')} <strong>{expectedText}</strong>
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="input w-full"
                placeholder={t('enterName')}
              />
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button className="button-base button-secondary" onClick={onCancel}>
              {defaultCancelText}
            </button>

            {showKeepButton && (
              <button className="button-base button-danger ml-2" onClick={onKeep}>
                {defaultKeepText}
              </button>
            )}

            <button
              className={`button-base button-danger ml-2 disabled:cursor-not-allowed`}
              onClick={onConfirm}
              disabled={requireTextMatch && !isTextMatch()}
            >
              {defaultConfirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeleteModal
