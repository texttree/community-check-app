import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'

const BookList = ({ projectId }) => {
  const { t } = useTranslation()

  const { data: books, error } = useSWR(
    projectId && `/api/projects/${projectId}/books`,
    fetcher
  )

  return (
    <>
      <h1 className="text-2xl font-semibold">{t('projectBooks')}</h1>
      {error ? (
        <p className="text-red-600">{t('errorOccurred')}</p>
      ) : books ? (
        <div className="bg-white p-4 rounded-lg shadow-md mt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-center">ID</th>
                <th className="border p-2 text-center">{t('titleInTable')}</th>
                <th className="border p-2 text-center">{t('dateCreation')}</th>
                <th className="border p-2 text-center">{t('dateLastCheck')}</th>
                <th className="border p-2 text-center">{t('numberChecks')}</th>
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
      ) : (
        <p>{t('loading')}</p>
      )}
    </>
  )
}

export default BookList
