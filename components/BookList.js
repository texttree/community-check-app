import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'

const BookList = ({ projectId }) => {
  const { t } = useTranslation()

  const { data: books, error: booksError } = useSWR(
    projectId && `/api/projects/${projectId}/books`,
    fetcher
  )

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{t('projectBooks')}</h1>
      {booksError ? (
        <p className="text-red-600">{t('errorOccurred')}</p>
      ) : !books ? (
        <p>{t('loading')}</p>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-md mt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-center">{t('titleInTable')}</th>
                <th className="border p-2 text-center">{t('dateCreation')}</th>
                <th className="border p-2 text-center">{t('dateLastCheck')}</th>
                <th className="border p-2 text-center">{t('numberChecks')}</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.book_id}>
                  <td className="border p-2 text-center">
                    <Link
                      href={`/projects/${projectId}/${book.book_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {book.book_name}
                    </Link>
                  </td>
                  <td className="border p-2 text-center">
                    {formatDate(book.book_created_at)}
                  </td>
                  <td className="border p-2 text-center">{book.finished_at}</td>
                  <td className="border p-2 text-center">
                    <BookChecks projectId={projectId} bookId={book.book_id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

const BookChecks = ({ projectId, bookId }) => {
  const { data: checks, error } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}/checks`,
    fetcher
  )

  return error ? (
    <span className="text-red-600">Error</span>
  ) : !checks ? (
    <span>Loading...</span>
  ) : (
    <span>{checks.length}</span>
  )
}

export default BookList
