'use client'

import Link from 'next/link'
import axios from 'axios'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { useTranslation } from '@/app/i18n/client'
import { fetcher } from '@/helpers/fetcher'
import Loader from '@/app/components/Loader'
import DeleteModal from '@/app/components/DeleteModal'
import Image from 'next/image'

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
        <div className="flex flex-wrap gap-4 mb-4">
          {projects.map((project) => (
            <div key={project.id} className="flex flex-col items-center">
              <Link href={`projects/${project.id}`}>
                <Image
                  src="/folder.svg"
                  alt="folder icon"
                  width={120}
                  height={120}
                  className="rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
                />
                <p className="text-xl font-semibold text-raisin-black mt-2 text-center">
                  {project.name}
                </p>
              </Link>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md mt-2"
                onClick={() => openDeleteModal(project)}
              >
                {t('delete')}
              </button>
            </div>
          ))}
        </div>
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
