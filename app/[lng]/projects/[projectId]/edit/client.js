'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import axios from 'axios'
import { fetcher } from '@/helpers/fetcher'
import LeftArrow from '@/public/left.svg'
import Loader from '@/app/components/Loader'
import DeleteModal from '@/app/components/DeleteModal'
import { useTranslation } from '@/app/i18n/client'

const ProjectEditPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [projectName, setProjectName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()
  const { projectId } = useParams()

  const { data: project, error } = useSWR(
    projectId && '/api/projects/' + projectId,
    fetcher
  )

  useEffect(() => {
    if (project?.name) {
      setProjectName(project.name)
    }
  }, [project?.name])

  const editProject = () => {
    setErrorMessage('')
    const name = projectName.trim()
    if (name) {
      axios
        .post('/api/projects/' + projectId, { name })
        .then((res) => {
          if (res.status === 200) {
            router.push('/' + lng + '/projects/' + projectId)
          }
        })
        .catch(() => {
          setErrorMessage(t('errorEditNameProject'))
        })
    } else {
      setErrorMessage(t('nameEmpty'))
    }
  }

  const openDeleteModal = () => {
    setShowDeleteModal(true)
  }

  const confirmDeleteProject = async () => {
    try {
      await axios.delete('/api/projects/' + projectId)

      mutate('/api/projects', (data) => data.filter((p) => p.id !== project.id))
      setShowDeleteModal(false)
      router.push('/' + lng + '/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const cancelDeleteProject = () => {
    setShowDeleteModal(false)
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center border-b-0 sm:border-b p-4">
          <div className="flex justify-start space-x-1 sm:space-x-4">
            <Link
              href={'/' + lng + '/projects/' + projectId}
              className="text-gray-400 hover:text-gray-500 inline-flex items-center text-sm"
            >
              <LeftArrow className="h-4 w-4 mr-1" />
              <span className="hidden sm:block">{t('project')}</span>
            </Link>
            <h1 className="text-base sm:text-lg font-bold pl-0 sm:pl-3 border-0 sm:border-l">
              {t('editProject')}
            </h1>
          </div>
        </div>
        {error ? (
          <p className="text-red-600">{t('errorOccurred')}</p>
        ) : project ? (
          <>
            <div className="p-4">
              <div className="mb-4">
                <label className="text-base font-bold block mb-2" htmlFor="projectName">
                  {t('name')}
                </label>
                <input
                  type="text"
                  id="projectName"
                  autoFocus
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full input"
                />
                {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
              </div>
              <div className="flex justify-start sm:justify-end mb-0">
                <button onClick={editProject} className="button-base button-primary">
                  {t('accept')}
                </button>
              </div>
            </div>
            <div className="border-t border-gray-300 w-full p-4 mb-2">
              <h2 className="text-base font-bold mb-2">{t('deleteProject')}</h2>
              <p className="text-sm mb-4">{t('warningDeleteProject')}</p>
              <button className="button-base button-danger" onClick={openDeleteModal}>
                {t('deleteProject')}
              </button>
            </div>
          </>
        ) : (
          <Loader />
        )}
      </div>
      {showDeleteModal && (
        <DeleteModal
          lng={lng}
          isOpen={showDeleteModal}
          message={`${t('confirmDeleteProject')}`}
          onConfirm={confirmDeleteProject}
          onCancel={cancelDeleteProject}
          expectedText={project?.name}
          requireTextMatch={true}
        />
      )}
    </>
  )
}

export default ProjectEditPage
