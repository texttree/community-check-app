import { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Modal from './Modal'

const CheckModal = ({ isOpen, onClose, onSubmit, lng }) => {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date()
    const isoString = currentDate.toISOString()
    const [date, time] = isoString.split('T')
    const formattedTime = time.substring(0, 5)
    return `${date}T${formattedTime}`
  })
  const { t } = useTranslation(lng, 'common')

  const handleSubmit = () => {
    if (!name || !url || !startDate) {
      return setError(t('allFieldsRequired'))
    }
    if (
      !/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(
        url
      )
    ) {
      return setError(t('enterCorrectLink'))
    }
    setLoading(true)
    onSubmit({ name, url, startDate })
      .then((res) => (res.error ? setError(res.error) : onClose()))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
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
        {t('materialLink')}:
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
        <button
          onClick={onClose}
          disabled={loading}
          className="button-base button-secondary mr-2"
        >
          {t('cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="button-base button-primary"
        >
          {t('create')}
        </button>
      </div>
      {error && <p className="mt-6 text-center text-xs text-red-600">{error}</p>}
    </Modal>
  )
}

export default CheckModal
