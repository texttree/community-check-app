import { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'

const AddProjectModal = ({ isOpen, onClose, onAddProject, lng }) => {
  const [projectName, setProjectName] = useState('')
  const [book, setBook] = useState('')
  const [check, setCheck] = useState('')
  const { t } = useTranslation(lng, 'common')

  const handleAddProject = () => {
    if (projectName.trim() !== '' && book.trim() !== '' && check.trim() !== '') {
      onAddProject(projectName, book, check)
      setProjectName('')
      setBook('')
      setCheck('')
      onClose()
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4"> {t('quickCreateCheck')}</h2>
            <input
              type="text"
              placeholder={t('titleProject')}
              className="border border-gray-300 rounded-md px-4 py-2 mb-4"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <input
              type="text"
              placeholder={t('titleBook')}
              className="border border-gray-300 rounded-md px-4 py-2 mb-4"
              value={book}
              onChange={(e) => setBook(e.target.value)}
            />
            <input
              type="text"
              placeholder={t('titleCheck')}
              className="border border-gray-300 rounded-md px-4 py-2 mb-4"
              value={check}
              onChange={(e) => setCheck(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mr-2"
                onClick={handleAddProject}
              >
                {t('create')}
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
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

export default AddProjectModal
