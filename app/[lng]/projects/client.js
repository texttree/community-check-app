'use client'

import Link from 'next/link'
import axios from 'axios'
import useSWR, { mutate } from 'swr'
import { useTranslation } from '@/app/i18n/client'
import { fetcher } from '@/helpers/fetcher'
import Loader from '@/app/components/Loader'

export async function getProjects() {
  const res = await fetch('/api/projects')
  const projects = await res.json()
  return projects
}

const Projects = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const { data: projects, error } = useSWR('/api/projects', fetcher)

  const handleDelete = async (projectId) => {
    try {
      await axios.delete('/api/projects', {
        data: { projectId },
      })

      mutate('/api/projects', (data) => data.filter((p) => p.id !== projectId))
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  return (
    <>
      {error ? (
        <p className="text-red-600">{t('errorOccurred')}</p>
      ) : projects ? (
        projects.map((project) => (
          <div key={project.id} className="block text-center">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105">
              <Link href={`projects/${project.id}`}>
                <p className="text-3xl font-semibold text-blue-600">{project.name}</p>
              </Link>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                onClick={() => handleDelete(project.id)}
              >
                {t('delete')}
              </button>
            </div>
          </div>
        ))
      ) : (
        <Loader />
      )}
    </>
  )
}

export default Projects
