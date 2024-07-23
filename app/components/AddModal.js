import { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import Modal from './Modal'

const AddModal = ({
  isOpen,
  onClose,
  onAddProject,
  lng,
  showProject,
  showBook,
  showCheck,
  windowTitle,
}) => {
  const [project, setProject] = useState('')
  const [book, setBook] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [check, setCheck] = useState('')
  const { t } = useTranslation(lng, 'common')

  const handleAddProject = async () => {
    try {
      setLoading(true)
      const result = await onAddProject({ project, book, check })
      if (result.error) {
        setError(result.error)
      } else {
        setProject('')
        setBook('')
        setCheck('')
        setError(null)
        onClose()
      }
      console.log(result)
    } catch (err) {
      console.log(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Modal title={t(windowTitle)}>
      {showProject && (
        <>
          <input
            type="text"
            placeholder={t('titleProject')}
            className="input mb-2.5 w-full"
            value={project}
            autoFocus
            onChange={(e) => setProject(e.target.value)}
          />
        </>
      )}
      {showBook && (
        <>
          <input
            type="text"
            placeholder={t('titleBook')}
            className="input mb-2.5 w-full"
            value={book}
            autoFocus={!showProject}
            onChange={(e) => setBook(e.target.value)}
          />
        </>
      )}
      {showCheck && (
        <>
          <input
            type="text"
            placeholder={t('titleCheck')}
            className="input mb-2.5 w-full"
            value={check}
            onChange={(e) => setCheck(e.target.value)}
          />
        </>
      )}
      <div className="flex mt-2.5 justify-end gap-2.5">
        <button
          className="button-primary button-base"
          onClick={handleAddProject}
          disabled={loading}
        >
          {t('create')}
        </button>
        <button
          className="button-secondary button-base"
          onClick={onClose}
          disabled={loading}
        >
          {t('cancel')}
        </button>
      </div>
      {error && <p className="mt-6 text-center text-xs text-red-600">{error}</p>}
    </Modal>
  )
}

export default AddModal
