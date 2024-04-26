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
    <div className="bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center mb-4">
          <Link
            href={`/${lng}/projects`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center"
          >
            <LeftArrow className="h-5 w-5 mr-1" />
            {t('personalArea')}
          </Link>
        </div>
        {error ? (
          <p className="text-red-600">{t('errorOccurred')}</p>
        ) : project ? (
          <>
            <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
            <Link
              href={`${projectId}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block mb-4"
            >
              {t('editProject')}
            </Link>
            <BookList projectId={projectId} lng={lng} />

            <Link
              href={`${projectId}/new`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
            >
              {t('createBook')}
            </Link>
          </>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  )
}

export default ProjectDetailsPage
