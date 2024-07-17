'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

import useSWR from 'swr'
import axios from 'axios'

import { fetcher } from '@/helpers/fetcher'

import LeftArrow from '@/public/left.svg'
import { useTranslation } from '@/app/i18n/client'
import DeleteModal from '@/app/components/DeleteModal'
import Loader from '@/app/components/Loader'

const BookEditPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [bookName, setBookName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const router = useRouter()
  const { projectId, bookId } = useParams()

  const { data: book, error: bookError } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}`,
    fetcher
  )

  useEffect(() => {
    if (book?.name) {
      setBookName(book.name)
    }
  }, [book])

  const editBook = async () => {
    setErrorMessage('')
    const name = bookName.trim()
    if (name) {
      try {
        const response = await axios.post(`/api/projects/${projectId}/books/${bookId}`, {
          name,
        })
        if (response.status === 200) {
          router.push('/' + lng + '/projects/' + projectId + `/${bookId}`)
        }
      } catch (error) {
        setErrorMessage(t('errorEditNameBook'))
      }
    } else {
      setErrorMessage(t('nameEmpty'))
    }
  }

  const openDeleteModal = () => {
    setShowDeleteModal(true)
  }

  const confirmDeleteBook = async () => {
    try {
      await axios.delete('/api/projects/' + projectId + '/books/' + bookId)
      mutate('/api/projects/' + projectId + '/books', (data) =>
        data.filter((b) => b.id !== book.id)
      )
      setShowDeleteModal(false)
      router.push('/' + lng + '/projects/' + projectId + '/books')
    } catch (error) {
      console.error('Failed to delete book:', error)
    }
  }

  const cancelDeleteBook = () => {
    setShowDeleteModal(false)
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center border-b-0 sm:border-b p-4">
          <div className="flex justify-start space-x-1 sm:space-x-4">
            <Link
              href={`/${lng}/projects/${projectId}/${bookId}`}
              className="text-gray-400 hover:text-gray-500 inline-flex items-center text-sm"
            >
              <LeftArrow className="h-4 w-4 mr-1" />
              <span className="hidden sm:block">{t('book')}</span>
            </Link>
            <h1 className="text-base sm:text-lg font-bold pl-0 sm:pl-3 border-0 sm:border-l">
              {t('editBook')}
            </h1>
          </div>
        </div>
        {error ? (
          <p className="text-red-600">{t('errorOccurred')}</p>
        ) : book ? (
          <>
            <div className="p-4">
              <div className="mb-4">
                <label className="text-base font-bold block mb-2" htmlFor="bookName">
                  {t('name')}
                </label>
                <input
                  type="text"
                  id="bookName"
                  autoFocus
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="w-full input"
                />
                {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
              </div>
              <div className="flex justify-start sm:justify-end mb-0">
                <button onClick={editBook} className="button-base button-primary">
                  {t('accept')}
                </button>
              </div>
            </div>
            <div className="border-t border-gray-300 w-full p-4 mb-2">
              <h2 className="text-base font-bold mb-2">{t('deleteBook')}</h2>
              <p className="text-sm mb-4">{t('warningDeleteBook')}</p>
              <button className="button-base button-danger" onClick={openDeleteModal}>
                {t('deleteBook')}
              </button>
            </div>
          </>
        ) : (
          <Loader />
        )}
      </div>
      <DeleteModal
        lng={lng}
        isOpen={showDeleteModal}
        message={`${t('confirmDeleteBook')}`}
        onConfirm={confirmDeleteBook}
        onCancel={cancelDeleteBook}
        expectedText={project?.name}
        requireTextMatch={true}
      />
    </>
  )
}

export default BookEditPage
