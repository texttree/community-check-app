'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client'
import axios from 'axios'

import { mutate } from 'swr'

import Projects from '@/app/components/Projects'
import AddProjectModal from '@/app/components/AddProjectModal'

const ProjectPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')

  const [showAddModal, setShowAddModal] = useState(false)

  const openAddModal = () => {
    setShowAddModal(true)
  }

  const closeAddModal = () => {
    setShowAddModal(false)
  }

  const handleAddProject = async (projectName, book, check) => {
    try {
      const response = await axios.post('/api/projects/fast', {
        project_name: projectName,
        book_name: book,
        check_name: check,
      })

      if (response.status === 201) {
        mutate('/api/projects')
        setShowAddModal(false)
      } else {
        console.error('Failed to add project:', response.data)
      }
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }
  return (
    <div className="bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{t('projects')}</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Projects lng={lng} />
        </div>
        <Link
          href={`/${lng}/projects/new`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
        >
          {t('createProject')}
        </Link>
        <Link
          href={`/${lng}/tokens`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 ml-2 mt-4 inline-block rounded-md"
        >
          {t('tokens')}
        </Link>
        <AddProjectModal
          isOpen={showAddModal}
          onClose={closeAddModal}
          onAddProject={handleAddProject}
          lng={lng}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mt-4 ml-2"
          onClick={openAddModal}
        >
          {t('quickCreateCheck')}
        </button>
      </div>
    </div>
  )
}

export default ProjectPage
