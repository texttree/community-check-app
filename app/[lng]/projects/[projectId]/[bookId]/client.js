'use client'

import { useEffect, useState, useRef } from 'react'
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
import Image from 'next/image'

const BookEditPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [errorMessage, setErrorMessage] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newBookName, setNewBookName] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const router = useRouter()
  const { projectId, bookId } = useParams()

  const { data: book, error: bookError } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}`,
    fetcher
  )

  const [isModalOpen, setModalOpen] = useState(false)

  const handleCreateCheck = async ({ name, url, startDate }) => {
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
      console.error(error)
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

  const openEditModal = () => {
    setShowEditModal(true)
    setNewBookName(book.name)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setNewBookName('')
  }

  const saveBookName = async () => {
    setErrorMessage(null)
    const name = newBookName.trim()
    if (name) {
      try {
        const response = await axios.post(`/api/projects/${projectId}/books/${bookId}`, {
          name,
        })
        if (response.status === 200) {
          setShowEditModal(false)
          mutate(`/api/projects/${projectId}/books/${bookId}`)
        }
      } catch (error) {
        setErrorMessage({ message: t('errorEditNameBook') })
      }
    } else {
      setErrorMessage({ message: t('nameEmpty') })
    }
  }
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

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuRef])

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white shadow-md rounded-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Link href={'/' + lng + '/projects/' + projectId}>
              <div className="text-gray-400 hover:text-gray-600 inline-flex items-center">
                <LeftArrow className="h-5 w-5 mr-1" />
                <span>{t('back')}</span>
              </div>
            </Link>
            {book && <div className="text-xl font-semibold">{book.name}</div>}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={openEditModal}
              className="hidden sm:block bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
            >
              {t('editBook')}
            </button>
            <button
              className="hidden sm:block bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
              onClick={() => setModalOpen(true)}
            >
              {t('startNewCheck')}
            </button>
            <div className="sm:hidden flex justify-end items-center" ref={menuRef}>
              <button onClick={handleMenuToggle}>
                <Image src="/menu.svg" alt="Menu" width={30} height={30} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        openEditModal()
                        closeMenu()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                    >
                      {t('editBook')}
                    </button>
                    <button
                      onClick={() => {
                        setModalOpen(true)
                        closeMenu()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                    >
                      {t('startNewCheck')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
            <Loader />
          )}
        </div>
      </div>
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white rounded-md p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{t('editBook')}</h2>
            <label className="block mb-2" htmlFor="newBookName">
              {t('name')}
            </label>
            <input
              type="text"
              id="newBookName"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            {errorMessage && <p className="text-red-600 mt-2">{errorMessage.message}</p>}
            <div className="mt-4 flex justify-end">
              <button
                onClick={saveBookName}
                className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md mr-2"
              >
                {t('save')}
              </button>
              <button
                onClick={closeEditModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <DeleteModal
          lng={lng}
          isVisible={showDeleteModal}
          message={`${t('confirmDeleteBook')}`}
          onConfirm={confirmDeleteBook}
          onCancel={cancelDeleteBook}
          expectedText={book?.name}
          requireTextMatch={true}
        />
      )}
      <CheckModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateCheck}
        lng={lng}
      />
    </div>
  )
}

export default BookEditPage
