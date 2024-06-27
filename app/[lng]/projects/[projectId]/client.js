'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import useSWR from 'swr'

import BookList from '@/app/components/BookList'
import { fetcher } from '@/helpers/fetcher'

import LeftArrow from '@/public/left.svg'
import Loader from '@/app/components/Loader'
import { useTranslation } from '@/app/i18n/client'

const ProjectDetailsPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const { projectId } = useParams()

  const { data: project, error } = useSWR(
    projectId && '/api/projects/' + projectId,
    fetcher
  )

  return (
    <div className="bg-gray-100 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/${lng}/projects`}
              className="text-gray-600 hover:text-gray-800 inline-flex items-center"
            >
              <LeftArrow className="h-5 w-5 mr-1" />
              <span className="text-lg font-bold">{t('projects')}</span>
            </Link>
            {project ? (
              <h1 className="text-2xl font-bold">{project.name}</h1>
            ) : (
              <Loader />
            )}
          </div>
          <div className="flex space-x-2">
            <Link
              href={`${projectId}/edit`}
              className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
            >
              {t('editProject')}
            </Link>
            <Link
              href={`${projectId}/new`}
              className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
            >
              {t('createBook')}
            </Link>
          </div>
        </div>
        {error ? (
          <p className="text-red-600">{t('errorOccurred')}</p>
        ) : project ? (
          <BookList projectId={projectId} lng={lng} />
        ) : (
          <Loader />
        )}
      </div>
    </div>
  )
}

export default ProjectDetailsPage
