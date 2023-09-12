import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import LeftArrow from 'public/left.svg'

const books = [
  { id: 2, name: 'Ruth', finished_at: 'dd:mm:yyyy', checks: '2' },
  { id: 3, name: 'testBook', finished_at: 'dd:mm:yyyy', checks: '2' },
]

const ProjectDetailsPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const projectId = router.query.projectId
  const { data: project, error } = useSWR(
    projectId && '/api/projects/' + projectId,
    fetcher
  )

  return (
    <div className="bg-gray-200 min-h-screen py-8">
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
            <h1 className="text-2xl font-semibold">{t('projectBooks')}</h1>
            <div className="bg-white p-4 rounded-lg shadow-md mt-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-center">ID</th>
                    <th className="border p-2 text-center">{t('titleInTable')}</th>
                    <th className="border p-2 text-center">{t('dateCreation')}</th>
                    <th className="border p-2 text-center">{t('dateLastCheck')}</th>
                    <th className="border p-2 text-center">{t('NumberChecks')}</th>
                    <th className="border p-2 text-center">{t('activeChecks')}</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td className="border p-2 text-center">{book.id}</td>
                      <td className="border p-2 text-center">
                        <Link
                          href={`/projects/${projectId}/${book.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {book.name}
                        </Link>
                      </td>
                      <td className="border p-2 text-center">{book.finished_at}</td>
                      <td className="border p-2 text-center">{book.finished_at}</td>
                      <td className="border p-2 text-center">{book.checks}</td>
                      <td className="border p-2 text-center">{book.checks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
