'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import axios from 'axios'
import { fetcher } from '@/helpers/fetcher'
import LeftArrow from '@/public/left.svg'
import Loader from '@/app/components/Loader'
import DeleteModal from '@/app/components/DeleteModal'
import { useTranslation } from '@/app/i18n/client'
import CheckList from '@/app/components/CheckList'
import CheckModal from '@/app/components/CheckModal'
import Menu from '@/app/components/Menu'

const BookEditPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const router = useRouter()
  const { projectId, bookId } = useParams()

  const { data: book, error: bookError } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}`,
    fetcher
  )

  const [isModalOpen, setModalOpen] = useState(false)

  const handleCreateCheck = async ({ name, url, startDate }) => {
    if (!name || !url || !startDate) {
      return { error: 'All fields are required' }
    }
    try {
      const res = await axios.post(`/api/projects/${projectId}/books/${bookId}/checks`, {
        name,
        url,
        startDate,
      })
      if (res.status === 201) {
        const checkId = res.data.id
        router.push(`/${lng}/projects/${projectId}/${bookId}/${checkId}`)
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  const { data: checkList, error: checkListError } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}/checks`,
    fetcher
  )

  useEffect(() => {
    if (bookError) {
      console.error(bookError)
    }
  }, [bookError])

  const confirmDeleteBook = async () => {
    try {
      await axios.delete(`/api/projects/${projectId}/books/${bookId}`)
      mutate(`/api/projects/${projectId}/books`)
      setShowDeleteModal(false)
      router.push('/' + lng + '/projects/' + projectId)
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
              href={'/' + lng + '/projects/' + projectId}
              className="text-gray-400 hover:text-gray-500 inline-flex items-center text-sm"
            >
              <LeftArrow className="h-4 w-4 mr-1" />
              <span className="hidden sm:block">{t('project')}</span>
            </Link>
            <h1 className="text-base sm:text-lg font-bold pl-0 sm:pl-3 border-0 sm:border-l">
              {book ? book.name : <Loader line={['h-5 w-48']} />}
            </h1>
          </div>
          <Menu>
            <Link href={`${bookId}/edit`} className="button-base button-secondary">
              {t('editBook')}
            </Link>
            <button
              className="button-base button-primary"
              onClick={() => setModalOpen(true)}
            >
              {t('startNewCheck')}
            </button>
          </Menu>
        </div>
        {bookError ? (
          <p className="text-red-600">{t('errorOccurred')}</p>
        ) : book ? (
          <></>
        ) : (
          <Loader />
        )}
        <div className="mt-8">
          {checkListError ? (
            <p className="text-red-600">{t('errorOccurred')}</p>
          ) : checkList ? (
            <CheckList lng={lng} projectId={projectId} bookId={bookId} />
          ) : (
            <Loader
              className="flex flex-col gap-4 pb-4 px-4"
              line={['h-5 w-full', 'h-5 w-full', 'h-5 w-full']}
            />
          )}
        </div>
      </div>
      <DeleteModal
        lng={lng}
        isOpen={showDeleteModal}
        message={`${t('confirmDeleteBook')}`}
        onConfirm={confirmDeleteBook}
        onCancel={cancelDeleteBook}
        expectedText={book?.name}
        requireTextMatch={true}
      />
      <CheckModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateCheck}
        lng={lng}
      />
    </>
  )
}

export default BookEditPage
