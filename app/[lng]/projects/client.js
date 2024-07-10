'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/app/i18n/client'
import axios from 'axios'
import Projects from '@/app/components/Projects'
import AddDialogModal from '@/app/components/AddDialogModal'
import { useRouter } from 'next/navigation'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'

const ProjectPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [projects, setProjects] = useState([])
  const menuRef = useRef(null)
  const router = useRouter()
  const { data: projectsData, mutate, error } = useSWR('/api/projects', fetcher)

  useEffect(() => {
    if (projectsData) {
      setProjects(projectsData)
    }
  }, [projectsData])

  const openAddModal = (windowTitle, showBook, showCheck) => {
    setShowAddModal(true)
    document.body.style.overflow = 'hidden'
    setModalOptions({ windowTitle, showBook, showCheck })
    setErrorMessage('')
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    document.body.style.overflow = ''
  }

  const handleAddFastCheck = async (data) => {
    try {
      const response = await axios.post('/api/projects/complex-create', {
        project_name: data.projectName,
        book_name: data.book,
        check_name: data.check,
      })
      if (response.status === 201) {
        router.push(
          `/${lng}/projects/${response.data.project_id}/${response.data.book_id}/${response.data.check_id}`
        )
        setShowAddModal(false)
        document.body.style.overflow = ''
      } else {
        console.error('Failed to add project:', response.data)
      }
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  const handleCreateProject = async (data) => {
    setErrorMessage('')
    const name = data.projectName.trim()

    if (name) {
      try {
        const response = await axios.post('/api/projects', { name })
        if (response.status === 200) {
          mutate()
          setShowAddModal(false)
          document.body.style.overflow = ''
        } else {
          throw new Error(t('errorCreateProject'))
        }
      } catch (error) {
        setErrorMessage(error.message)
      }
    } else {
      setErrorMessage(t('nameEmpty'))
    }
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

  const [modalOptions, setModalOptions] = useState({
    windowTitle: '',
    showBook: false,
    showCheck: false,
  })

  return (
    <div className="max-w-3xl mx-auto p-2 text-sm">
      <TabGroup>
        <TabList className="bg-ming-blue flex p-1 w-full border border-th-secondary-300 rounded-t-xl shadow-md">
          <Tab
            className={({ selected }) =>
              selected
                ? 'bg-ming-blue text-white cursor-pointer text-lg font-bold px-4 py-1 rounded-md'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white px-2 py-1 rounded-md'
            }
          >
            {t('projects')}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel className="bg-white p-2 rounded-b-md text-left">
            <div className="hidden md:flex justify-start space-x-2 mb-2">
              <button
                className="bg-ming-blue hover:bg-deep-space text-white px-2 py-1 rounded-md"
                onClick={() => openAddModal('createProject', false, false)}
              >
                {t('createProject')}
              </button>
              <Link
                href={`/${lng}/tokens`}
                className="bg-ming-blue hover:bg-deep-space text-white px-2 py-1 rounded-md"
              >
                {t('tokens')}
              </Link>
              <button
                className="bg-ming-blue hover:bg-deep-space text-white px-2 py-1 rounded-md"
                onClick={() => openAddModal('quickCreateCheck', true, true)}
              >
                {t('quickCreateCheck')}
              </button>
            </div>
            <div className="md:hidden mb-2 flex justify-end">
              <div className="relative inline-block text-left" ref={menuRef}>
                <button onClick={handleMenuToggle}>
                  <Image src="/menu.svg" alt="Menu" width={20} height={20} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-40 origin-top-right bg-white divide-y divide-gray-100 rounded-b-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <button
                        onClick={() => openAddModal('createProject', false, false)}
                        className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                      >
                        {t('createProject')}
                      </button>
                      <Link
                        href={`/${lng}/tokens`}
                        className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                        onClick={closeMenu}
                      >
                        {t('tokens')}
                      </Link>
                      <button
                        onClick={() => {
                          openAddModal('quickCreateCheck', true, true)
                          closeMenu()
                        }}
                        className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                      >
                        {t('quickCreateCheck')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Projects lng={lng} projects={projects} error={error} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-lg z-50"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <AddDialogModal
              isOpen={showAddModal}
              onClose={closeAddModal}
              onAddProject={
                modalOptions.windowTitle === 'createProject'
                  ? handleCreateProject
                  : handleAddFastCheck
              }
              errorMessage={errorMessage}
              lng={lng}
              showProject={true}
              showBook={modalOptions.showBook}
              showCheck={modalOptions.showCheck}
              windowTitle={modalOptions.windowTitle}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ProjectPage
