import Link from 'next/link'
import { useState } from 'react'
import axios from 'axios'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import useSWR, { mutate } from 'swr'

import { fetcher } from '@/helpers/fetcher'
import Loader from '@/components/Loader'
import DeleteModal from '@/components/DeleteModal'

const ProjectsPage = () => {
  const { t } = useTranslation()
  const { data: projects, error } = useSWR('/api/projects', fetcher)
  const [deleteProjectId, setDeleteProjectId] = useState(null)

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/projects/${deleteProjectId}`)
      mutate('/api/projects')
      setDeleteProjectId(null)
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  return (
    <div className="bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{t('projects')}</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {error ? (
            <p className="text-red-600">{t('errorOccurred')}</p>
          ) : projects ? (
            projects.map((project) => (
              <div key={project.id} className="block text-center">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105">
                  <p className="text-3xl font-semibold text-blue-600">{project.name}</p>
                  <div className="mt-4">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                      onClick={() => setDeleteProjectId(project.id)}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <Loader />
          )}
        </div>
        <Link
          href="/projects/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
        >
          {t('createProject')}
        </Link>
        <Link
          href="/tokens"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 ml-2 mt-4 inline-block rounded-md"
        >
          {t('tokens')}
        </Link>
        {deleteProjectId && (
          <DeleteModal
            onCancel={() => setDeleteProjectId(null)}
            onConfirm={handleDelete}
            confirmationText={t('confirmDeleteProject')}
            safety={true}
            nameDelete={projects.find((p) => p.id === deleteProjectId).name}
          />
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default ProjectsPage
