import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import useSWR, { mutate } from 'swr'
import { fetcher } from '@/helpers/fetcher'
import { formatDate } from '@/helpers/formatDate'
import axios from 'axios'
import toast from 'react-hot-toast'

const BookList = ({ projectId }) => {
  const { t } = useTranslation()

  const { data: books, error: booksError } = useSWR(
    projectId && `/api/projects/${projectId}/books`,
    fetcher
  )

  const ErrorMessage = ({ message }) => <span className="text-red-600">{message}</span>

  const LoadingMessage = () => <span>{t('loading')}...</span>

  const handleDeleteBook = async (bookId) => {
    try {
      await axios.delete(`/api/projects/${projectId}/books/${bookId}`)
      mutate(`/api/projects/${projectId}/books`)
      toast.success(t('bookDeleted'))
    } catch (error) {
      console.error(error)
      toast.error(t('errorOccurred'))
    }
  }

  const BookChecksInfo = ({ projectId, bookId, showLastCheck }) => {
    const { data: checks, error } = useSWR(
      projectId && bookId && `/api/projects/${projectId}/books/${bookId}/checks`,
      fetcher
    )

    const getLatestCheckDate = (checks) => {
      if (checks && checks.length > 0) {
        const validDates = checks
          .filter((check) => check.check_started_time !== null)
          .map((check) => new Date(check.check_started_time))

        if (validDates.length > 0) {
          const latestDate = new Date(Math.max(...validDates))
          return formatDate(latestDate)
        } else {
          return '-'
        }
      }
      return '-'
    }

    if (error) {
      return <ErrorMessage message={t('errorOccurred')} />
    } else if (!checks) {
      return <LoadingMessage />
    } else {
      return <span>{showLastCheck ? getLatestCheckDate(checks) : checks.length}</span>
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold">{t('projectBooks')}</h1>
      {booksError ? (
        <ErrorMessage message={t('errorOccurred')} />
      ) : !books ? (
        <LoadingMessage />
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-md mt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-center">{t('titleInTable')}</th>
                <th className="border p-2 text-center">{t('dateCreation')}</th>
                <th className="border p-2 text-center">{t('dateLastCheck')}</th>
                <th className="border p-2 text-center">{t('numberChecks')}</th>
                <th className="border p-2 text-center">{t('actions')}</th>
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
                  <td className="border p-2 text-center">
                    <BookChecksInfo
                      projectId={projectId}
                      bookId={book.book_id}
                      showLastCheck={true}
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <BookChecksInfo
                      projectId={projectId}
                      bookId={book.book_id}
                      showLastCheck={false}
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDeleteBook(book.book_id)}
                      className="bg-white hover:text-red-700 text-red-500 px-4 py-2 rounded-md"
                    >
                      {t('deleteBook')}
                    </button>
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

export default BookList
