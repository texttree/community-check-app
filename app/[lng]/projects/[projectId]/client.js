'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import BookList from '@/app/components/BookList'
import { fetcher } from '@/helpers/fetcher'
import LeftArrow from '@/public/left.svg'
import Loader from '@/app/components/Loader'
import AddDialogModal from '@/app/components/AddDialogModal'
import axios from 'axios'
import { useTranslation } from '@/app/i18n/client'
import { Tab, TabGroup, TabList } from '@headlessui/react'

const ProjectDetailsPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const { projectId } = useParams()

  const { data: project, error } = useSWR(
    projectId && '/api/projects/' + projectId,
    fetcher
  )

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const menuRef = useRef(null)

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

  const openAddModal = () => {
    setShowAddModal(true)
    document.body.style.overflow = 'hidden'
    setErrorMessage('')
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    document.body.style.overflow = ''
  }

  const handleCreateBook = async (data) => {
    setErrorMessage('')
    const bookName = data.book.trim()

    if (bookName) {
      try {
        const response = await axios.post(`/api/projects/${projectId}/books`, {
          name: bookName,
        })
        if (response.status === 201) {
          mutate(`/api/projects/${projectId}/books`)
          setShowAddModal(false)
          document.body.style.overflow = ''
        } else {
          throw new Error(t('errorCreateBook'))
        }
      } catch (error) {
        setErrorMessage(error.message)
      }
    } else {
      setErrorMessage(t('nameEmpty'))
    }
  }

  return (
    <div className="py-8 min-h-screen">
      <TabGroup className="max-w-4xl  mx-auto">
        <TabList className="bg-ming-blue flex p-2 border border-th-secondary-300 rounded-t-xl shadow-md">
          <Tab
            className={({ selected }) =>
              selected
                ? 'bg-ming-blue text-white cursor-pointer text-lg sm:text-2xl font-bold px-4 sm:px-9 py-2 rounded-t-md w-full text-center'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white px-4 py-2 rounded-t-md w-full text-center'
            }
          >
            {t('')}
          </Tab>
        </TabList>
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-b-md">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Link
                href={`/${lng}/projects`}
                className="text-gray-400 hover:text-gray-600 inline-flex items-center"
              >
                <LeftArrow className="h-5 w-5 mr-1" />
                <span className="text-base font-bold">{t('projects')}</span>
              </Link>
              {project ? (
                <h1 className="text-2xl font-bold">{project.name}</h1>
              ) : (
                <Loader />
              )}
            </div>
            <div className="hidden sm:flex space-x-2">
              <Link
                href={`${projectId}/edit`}
                className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
              >
                {t('editProject')}
              </Link>
              <button
                onClick={openAddModal}
                className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
              >
                {t('createBook')}
              </button>
            </div>
            <div className="sm:hidden flex justify-end items-center" ref={menuRef}>
              <button onClick={handleMenuToggle}>
                <Image src="/menu.svg" alt="Menu" width={30} height={30} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Link
                      href={`${projectId}/edit`}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                      onClick={closeMenu}
                    >
                      {t('editProject')}
                    </Link>
                    <button
                      onClick={() => {
                        openAddModal()
                        closeMenu()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                    >
                      {t('createBook')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {error ? (
            <p className="text-red-600">{t('errorOccurred')}</p>
          ) : project ? (
            <BookList projectId={projectId} lng={lng} />
          ) : (
            <Loader />
          )}
        </div>
        {showAddModal && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-lg z-50"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <AddDialogModal
                isOpen={showAddModal}
                onClose={closeAddModal}
                onAddProject={handleCreateBook}
                errorMessage={errorMessage}
                lng={lng}
                showProject={false}
                showBook={true}
                showCheck={false}
                windowTitle={t('createBook')}
              />
            </div>
          </>
        )}
      </TabGroup>
    </div>
  )
}

export default ProjectDetailsPage
