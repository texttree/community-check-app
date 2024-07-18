'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import BookList from '@/app/components/BookList'
import { fetcher } from '@/helpers/fetcher'
import LeftArrow from '@/public/left.svg'
import Loader from '@/app/components/Loader'
import AddModal from '@/app/components/AddModal'
import axios from 'axios'
import { useTranslation } from '@/app/i18n/client'
import Menu from '@/app/components/Menu'

const ProjectDetailsPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const { projectId } = useParams()

  const { data: project, error } = useSWR(
    projectId && '/api/projects/' + projectId,
    fetcher
  )

  const [showAddModal, setShowAddModal] = useState(false)

  const openAddModal = () => {
    setShowAddModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    document.body.style.overflow = ''
  }

  const handleCreateBook = async (data) => {
    const bookName = data.book.trim()
    if (!bookName) {
      return { error: t('nameEmpty') }
    }
    try {
      const response = await axios.post(`/api/projects/${projectId}/books`, {
        name: bookName,
      })
      if (response.status === 201) {
        mutate(`/api/projects/${projectId}/books`)
        setShowAddModal(false)
        document.body.style.overflow = ''
        return { error: false }
      } else {
        throw new Error(t('errorCreateBook'))
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center border-b-0 sm:border-b p-4">
          <div className="flex justify-start space-x-1 sm:space-x-4">
            <Link
              href={`/${lng}/projects`}
              className="text-gray-400 hover:text-gray-500 inline-flex items-center text-sm"
            >
              <LeftArrow className="h-4 w-4 mr-1" />
              <span className="hidden sm:block">{t('projects')}</span>
            </Link>

            <h1 className="text-base sm:text-lg font-bold pl-0 sm:pl-3 border-0 sm:border-l">
              {project ? project.name : <Loader line={['h-5 w-48']} />}
            </h1>
          </div>
          <Menu>
            <Link href={`${projectId}/edit`} className="button-base button-secondary">
              {t('editProject')}
            </Link>
            <button onClick={openAddModal} className="button-base button-primary">
              {t('createBook')}
            </button>
          </Menu>
        </div>
        {project ? (
          <BookList projectId={projectId} lng={lng} />
        ) : (
          <Loader
            className="flex flex-col gap-4 p-4"
            line={['h-5 w-full', 'h-5 w-full', 'h-5 w-full']}
          />
        )}
      </div>
      {showAddModal && (
        <AddModal
          isOpen={showAddModal}
          onClose={closeAddModal}
          onAddProject={handleCreateBook}
          lng={lng}
          showProject={false}
          showBook={true}
          showCheck={false}
          windowTitle={t('createBook')}
        />
      )}
    </>
  )
}

export default ProjectDetailsPage
