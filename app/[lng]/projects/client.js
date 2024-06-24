'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client'
import axios from 'axios'

import Projects from '@/app/components/Projects'
import AddProjectModal from '@/app/components/AddProjectModal'
import { useRouter } from 'next/navigation'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

const ProjectPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')

  const [showAddModal, setShowAddModal] = useState(false)
  const router = useRouter()

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
        router.push(
          `/${lng}/projects/${response.data.project_id}/${response.data.book_id}/${response.data.check_id}`
        )
        setShowAddModal(false)
      } else {
        console.error('Failed to add project:', response.data)
      }
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto p-4">
        <TabGroup>
          <TabList className="bg-ming-blue flex p-2 w-full border border-th-secondary-300 rounded-xl shadow-md">
            <Tab
              className={({ selected }) =>
                selected
                  ? 'bg-ming-blue text-white cursor-pointer text-2xl font-bold  px-9 py-2 rounded-md'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white px-4 py-2 rounded-md'
              }
            >
              {t('projects')}
            </Tab>
          </TabList>
          <TabPanels className="mt-2">
            <TabPanel className="bg-white p-4 rounded-md text-left">
              <div className="flex justify-start space-x-4 mb-4">
                <Link
                  href={`/${lng}/projects/new`}
                  className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
                >
                  {t('createProject')}
                </Link>
                <Link
                  href={`/${lng}/tokens`}
                  className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
                >
                  {t('tokens')}
                </Link>
                <button
                  className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
                  onClick={openAddModal}
                >
                  {t('quickCreateCheck')}
                </button>
              </div>
              <Projects lng={lng} />
            </TabPanel>
          </TabPanels>
        </TabGroup>

        <AddProjectModal
          isOpen={showAddModal}
          onClose={closeAddModal}
          onAddProject={handleAddProject}
          lng={lng}
        />
      </div>
    </div>
  )
}

export default ProjectPage
