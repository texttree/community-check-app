'use client'

import Link from 'next/link'
import axios from 'axios'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { useTranslation } from '@/app/i18n/client'
import { fetcher } from '@/helpers/fetcher'
import Loader from '@/app/components/Loader'
import DeleteModal from '@/app/components/DeleteModal'

const Projects = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const { data: projects, error } = useSWR('/api/projects', fetcher)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)

  const openDeleteModal = (project) => {
    setProjectToDelete(project)
    setShowDeleteModal(true)
  }

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      try {
        await axios.delete('/api/projects', {
          data: { projectId: projectToDelete.id },
        })

        mutate('/api/projects', (data) => data.filter((p) => p.id !== projectToDelete.id))
        setShowDeleteModal(false)
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  const cancelDeleteProject = () => {
    setShowDeleteModal(false)
  }

  return (
    <>
      {error ? (
        <p className="text-red-600">{t('errorOccurred')}</p>
      ) : projects ? (
        projects.map((project) => (
          <div key={project.id} className="block">
            <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105">
              <Link
                className="text-3xl font-semibold text-blue-600"
                href={`projects/${project.id}`}
              >
                {project.name}
              </Link>
              <button
                className="bg-red-500 block hover:bg-red-600 text-white px-4 py-2 rounded-md"
                onClick={() => openDeleteModal(project)}
              >
                {t('delete')}
              </button>
            </div>
          </div>
        ))
      ) : (
        <Loader />
      )}

      {showDeleteModal && (
        <DeleteModal
          lng={lng}
          isVisible={showDeleteModal}
          message={`${t('confirmDeleteProject')}`}
          onConfirm={confirmDeleteProject}
          onCancel={cancelDeleteProject}
          expectedText={projectToDelete?.name}
          requireTextMatch={true}
        />
      )}
    </>
  )
}

export default Projects
