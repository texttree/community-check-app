import { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Modal from './Modal'

const CheckModal = ({ isOpen, onClose, onSubmit, lng }) => {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date()
    const isoString = currentDate.toISOString()
    const [date, time] = isoString.split('T')
    const formattedTime = time.substring(0, 5)
    return `${date}T${formattedTime}`
  })
  const { t } = useTranslation(lng, 'common')

  const handleSubmit = () => {
    onSubmit({ name, url, startDate })
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal title={t('newCheck')}>
      <label className="block mb-2">
        {t('checkName')}:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full input"
        />
      </label>
      <label className="block mb-2">
        {t('materialUrl')}:
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full input"
        />
      </label>
      <label className="block mb-2">
        {t('startingDate')}
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full input"
        />
      </label>
      <div className="flex justify-end mt-4">
        <button onClick={onClose} className="button-base button-secondary mr-2">
          {t('cancel')}
        </button>
        <button onClick={handleSubmit} className="button-base button-primary">
          {t('create')}
        </button>
      </div>
    </Modal>
  )
}

export default CheckModal
