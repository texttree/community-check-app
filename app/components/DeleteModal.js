'use client'

import { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Modal from './Modal'

const DeleteModal = ({
  lng,
  isOpen,
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

  const isTextMatch = () => inputText === expectedText

  if (!isOpen) {
    return null
  }

  return (
    <Modal title={t('delete')}>
      <p className="text-base">{message}</p>
      {requireTextMatch && (
        <div className="mt-4">
          <label className="block mb-2">
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
    </Modal>
  )
}

export default DeleteModal
