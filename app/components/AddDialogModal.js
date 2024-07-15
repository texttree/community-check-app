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
  const [projectName, setProjectName] = useState('')
  const [book, setBook] = useState('')
  const [check, setCheck] = useState('')
  const { t } = useTranslation(lng, 'common')

  const handleAddProject = () => {
    onAddProject({ projectName, book, check })
    setProjectName('')
    setBook('')
    setCheck('')
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-center">{t(windowTitle)}</h2>
            {showProject && (
              <>
                <input
                  type="text"
                  placeholder={t('titleProject')}
                  className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </>
            )}
            {showBook && (
              <>
                <input
                  type="text"
                  placeholder={t('titleBook')}
                  className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
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
                  className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full"
                  value={check}
                  onChange={(e) => setCheck(e.target.value)}
                />
              </>
            )}
            <div className="flex justify-end">
              <button
                className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md mr-2"
                onClick={handleAddProject}
              >
                {t('create')}
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-raisin-black px-4 py-2 rounded-md"
                onClick={onClose}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AddDialogModal
