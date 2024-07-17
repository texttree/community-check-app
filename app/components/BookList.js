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
import Loader from './Loader'

const ErrorMessage = ({ message }) => <span className="text-red-600">{message}</span>

const BookList = ({ projectId, lng }) => {
  const { t } = useTranslation(lng, 'common')

  const LoadingMessage = () => (
    <Loader
      className="flex flex-col gap-4 pb-4 px-4"
      line={['h-5 w-full', 'h-5 w-full', 'h-5 w-full']}
    />
  )

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bookToDelete, setBookToDelete] = useState(null)

  const { data: books, error: booksError } = useSWR(
    projectId && `/api/projects/${projectId}/books`,
    fetcher
  )

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
        <div className="overflow-x-auto">
          <table className="min-w-full border-t sm:border-t-0 bg-white text-sm mb-8">
            <thead>
              <tr className="border-b text-left">
                <th className="pl-4 py-2 pr-2 sm:pr-4 sm:py-4">{t('titleInTable')}</th>
                <th className="p-2 sm:p-4">{t('dateCreation')}</th>
                <th className="p-2 sm:p-4">{t('dateLastCheck')}</th>
                <th className="p-2 sm:p-4">{t('numberChecks')}</th>
                <th className="pr-4 py-2 pl-2 sm:pl-4 sm:py-4"></th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-b sm:hover:bg-ming-blue/10">
                  <td className="pl-4 py-2 pr-2 sm:pr-4 sm:py-4 border-r sm:border-r-0">
                    <Link
                      className="link-cell"
                      href={`/projects/${projectId}/${book.id}`}
                    >
                      {book.name}
                    </Link>
                  </td>
                  <td className="p-2 sm:p-4 border-r sm:border-r-0">
                    <span className="text-cell">{formatDate(book.created_at)}</span>
                  </td>
                  <td className="p-2 sm:p-4 border-r sm:border-r-0">
                    <span className="text-cell">
                      <BookChecksInfo
                        projectId={projectId}
                        bookId={book.id}
                        showLastCheck={true}
                      />
                    </span>
                  </td>
                  <td className="p-2 sm:p-4 border-r sm:border-r-0">
                    <span className="text-cell">
                      <BookChecksInfo
                        projectId={projectId}
                        bookId={book.id}
                        showLastCheck={false}
                      />
                    </span>{' '}
                  </td>
                  <td className="pr-4 py-2 pl-2 sm:pl-4 sm:py-4 flex justify-center sm:justify-end">
                    <div
                      onClick={() => openDeleteModal(book)}
                      className="text-red-500 bg-bright-gray px-2 py-1 rounded-md text-sm font-medium focus:outline-none cursor-pointer sm:bg-red-500 sm:hover:bg-red-600 sm:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="block sm:hidden h-4 w-4 cursor-pointer"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      <span className="hidden sm:block">{t('delete')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <DeleteModal
        lng={lng}
        isOpen={showDeleteModal}
        message={t('confirmDeleteBook')}
        onConfirm={confirmDeleteBook}
        onCancel={cancelDeleteBook}
        expectedText={bookToDelete?.name}
        requireTextMatch={true}
      />
    </>
  )
}

export default BookList
