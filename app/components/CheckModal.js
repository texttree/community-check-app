import { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'

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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-md shadow-md w-1/3">
        <h2 className="text-2xl mb-4">{t('newCheck')}</h2>
        <label className="block mb-2">
          {t('checkName')}:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </label>
        <label className="block mb-2">
          {t('materialUrl')}:
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </label>
        <label className="block mb-2">
          {t('startingDate')}
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </label>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md mr-2"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
          >
            {t('create')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckModal
