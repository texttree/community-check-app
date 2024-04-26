'use client'

import Link from 'next/link'

import useSWR from 'swr'
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
  return (
    <>
      {error ? (
        <p className="text-red-600">{t('errorOccurred')}</p>
      ) : projects ? (
        projects.map((project) => (
          <Link key={project.id} href={`projects/${project.id}`}>
            <div className="block text-center">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105">
                <p className="text-3xl font-semibold text-blue-600">{project.name}</p>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <Loader />
      )}
    </>
  )
}

export default Projects
