'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import BookList from '@/app/components/BookList'
import { fetcher } from '@/helpers/fetcher'
import LeftArrow from '@/public/left.svg'
import Loader from '@/app/components/Loader'
import { useTranslation } from '@/app/i18n/client'

const ProjectDetailsPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const { projectId } = useParams()

  const { data: project, error } = useSWR(
    projectId && '/api/projects/' + projectId,
    fetcher
  )

  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  return (
    <div className=" py-8 min-h-screen">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/${lng}/projects`}
              className="text-gray-400 hover:text-gray-800 inline-flex items-center"
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
            <Link
              href={`${projectId}/new`}
              className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
            >
              {t('createBook')}
            </Link>
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
                  <Link
                    href={`${projectId}/new`}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                    onClick={closeMenu}
                  >
                    {t('createBook')}
                  </Link>
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
    </div>
  )
}

export default ProjectDetailsPage
