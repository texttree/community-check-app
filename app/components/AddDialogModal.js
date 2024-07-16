import { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'

const AddDialogModal = ({
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

  return (
    <>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/10 backdrop-blur-lg z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-40">
            <div className="bg-white p-5 rounded-lg shadow-lg w-96 m-4">
              <h2 className="text-lg font-bold mb-5">{t(windowTitle)}</h2>
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
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default AddDialogModal
