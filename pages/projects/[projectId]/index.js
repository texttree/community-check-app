import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import useSWR from 'swr'

import BookList from '@/components/BookList'
import { fetcher } from '@/helpers/fetcher'

import LeftArrow from 'public/left.svg'

const ProjectDetailsPage = () => {
  const { t } = useTranslation()
  const {
    query: { projectId },
  } = useRouter()

  const { data: project, error } = useSWR(
    projectId && '/api/projects/' + projectId,
    fetcher
  )

  return (
    <div className="bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center mb-4">
          <Link
            href="/projects"
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
              href={'/projects/' + projectId + '/edit'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block mb-4"
            >
              {t('editProject')}
            </Link>
            <BookList projectId={projectId} />

            <Link
              href={`/projects/${projectId}/new`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
            >
              {t('createBook')}
            </Link>
          </>
        ) : (
          <p>{t('loading')}</p>
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

export default ProjectDetailsPage
