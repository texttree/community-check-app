'use client'

import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import useSWR, { mutate } from 'swr'
import toast from 'react-hot-toast'
import DeleteModal from '@/app/components/DeleteModal'
import { useTranslation } from '@/app/i18n/client'
import { fetcher } from '@/helpers/fetcher'
import { formatDate } from '@/helpers/formatDate'
import Image from 'next/image'

const BookList = ({ projectId, lng }) => {
  const { t } = useTranslation(lng, 'common')

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bookToDelete, setBookToDelete] = useState(null)

  const { data: books, error: booksError } = useSWR(
    projectId && `/api/projects/${projectId}/books`,
    fetcher
  )

  const ErrorMessage = ({ message }) => <span className="text-red-600">{message}</span>

  const LoadingMessage = () => <span>{t('loading')}...</span>

  const BookChecksInfo = ({ projectId, bookId, showLastCheck }) => {
    const { data: checks, error } = useSWR(
      projectId && bookId && `/api/projects/${projectId}/books/${bookId}/checks`,
      fetcher
    )

    const getLatestCheckDate = (checks) => {
      if (checks && checks.length > 0) {
        const validDates = checks
          .filter((check) => check.started_at !== null)
          .map((check) => new Date(check.started_at))

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

  const openDeleteModal = (book) => {
    setBookToDelete(book)
    setShowDeleteModal(true)
  }

  const confirmDeleteBook = async () => {
    if (bookToDelete) {
      try {
        await axios.delete(`/api/projects/${projectId}/books/${bookToDelete.id}`)
        mutate(`/api/projects/${projectId}/books`)
        toast.success(t('bookDeleted'))
      } catch (error) {
        toast.error(t('errorDeletingBook'))
      }
    }
    setShowDeleteModal(false)
  }

  const cancelDeleteBook = () => {
    setShowDeleteModal(false)
  }

  return (
    <>
      {booksError ? (
        <ErrorMessage message={t('errorOccurred')} />
      ) : !books ? (
        <LoadingMessage />
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-md mt-2 overflow-x-auto">
          <table className="min-w-full border-collapse">
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
                <tr key={book.id} className="hover:bg-gray-100">
                  <td className="border p-2 text-ming-blue hover:underline">
                    <Link href={`/projects/${projectId}/${book.id}`}>{book.name}</Link>
                  </td>
                  <td className="border p-2 text-center">
                    {formatDate(book.created_at)}
                  </td>
                  <td className="border p-2 text-center">
                    <BookChecksInfo
                      projectId={projectId}
                      bookId={book.id}
                      showLastCheck={true}
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <BookChecksInfo
                      projectId={projectId}
                      bookId={book.id}
                      showLastCheck={false}
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      className="hidden sm:block bg-red-500 hover:bg-red-600 text-white px-2 py-1 sm:px-2 sm:py-1 rounded-md"
                      onClick={() => openDeleteModal(book)}
                    >
                      {t('delete')}
                    </button>
                    <Image
                      key={book.name}
                      src="/delete.svg"
                      alt="Delete Icon"
                      width={24}
                      height={24}
                      onClick={() => openDeleteModal(book)}
                      className="block sm:hidden h-5 w-5 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDeleteModal && (
        <DeleteModal
          lng={lng}
          isVisible={showDeleteModal}
          message={t('confirmDeleteBook')}
          onConfirm={confirmDeleteBook}
          onCancel={cancelDeleteBook}
          expectedText={bookToDelete?.name}
          requireTextMatch={true}
        />
      )}
    </>
  )
}

export default BookList
