'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/app/i18n/client'
import axios from 'axios'
import Projects from '@/app/components/Projects'
import AddDialogModal from '@/app/components/AddDialogModal'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'

const ProjectPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [showModal, setShowModal] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
    setShowModal(true)
    document.body.style.overflow = 'hidden'
    setModalOptions({ windowTitle, showBook, showCheck })
  }

  const closeAddModal = () => {
    setShowModal(false)
    document.body.style.overflow = ''
  }

  const handleAddFastCheck = async (data) => {
    const project = data.project.trim()
    const book = data.book.trim()
    const check = data.check.trim()
    if (!project || !book || !check) {
      return { error: t('emptyField') }
    }
    try {
      const response = await axios.post('/api/projects/complex-create', {
        project_name: project,
        book_name: book,
        check_name: check,
      })
      if (response.status === 201) {
        router.push(
          `/${lng}/projects/${response.data.project_id}/${response.data.book_id}/${response.data.check_id}`
        )
        setShowModal(false)
        document.body.style.overflow = ''
        return { error: false }
      } else {
        return { error: `Failed to add project: ${response.data}` }
      }
    } catch (error) {
      return { error: `Error adding project: ${error}` }
    }
  }

  const handleCreateProject = async (data) => {
    const name = data.project.trim()
    if (!name) {
      return { error: t('nameEmpty') }
    }
    try {
      const response = await axios.post('/api/projects', { name })
      if (response.status === 200) {
        mutate()
        setShowModal(false)
        document.body.style.overflow = ''
        return { error: false }
      } else {
        throw new Error(t('errorCreateProjectName'))
      }
    } catch (error) {
      return { error: error.message }
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
    <div className="w-full">
      <div className="bg-ming-blue text-white text-base px-4 py-1 text-center min-w-36 md:min-w-52 inline-block rounded-t-lg">
        {t('projects')}
      </div>
      <div className="overflow-hidden rounded-br-lg rounded-tr-lg rounded-bl-lg">
        <div className="bg-ming-blue p-3.5 w-full"></div>
        <div>
          <div className="bg-white">
            <div className="hidden p-4 md:flex justify-start space-x-2 mb-2 border-b">
              <button
                className="button-primary button-base"
                onClick={() => openAddModal('createProject', false, false)}
              >
                {t('createProject')}
              </button>
              <Link href={`/${lng}/tokens`} className="button-primary button-base">
                {t('tokens')}
              </Link>
              <button
                className="button-primary button-base"
                onClick={() => openAddModal('quickCreateCheck', true, true)}
              >
                {t('quickCreateCheck')}
              </button>
            </div>
            <div className="md:hidden pr-2 pt-2 flex justify-end">
              <div className="relative inline-block text-left" ref={menuRef}>
                <button onClick={handleMenuToggle} className="p-2">
                  <Image src="/menu.svg" alt="Menu" width={24} height={24} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-40 origin-top-right bg-white divide-y divide-gray-100 rounded-b-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          openAddModal('createProject', false, false)
                          closeMenu()
                        }}
                        className="block w-full text-left px-2 py-1 text-sm text-raisin-black hover:bg-gray-100 hover:text-black"
                      >
                        {t('createProject')}
                      </button>
                      <Link
                        href={`/${lng}/tokens`}
                        className="block w-full text-left px-2 py-1 text-sm text-raisin-black hover:bg-gray-100 hover:text-black"
                        onClick={closeMenu}
                      >
                        {t('tokens')}
                      </Link>
                      <button
                        onClick={() => {
                          openAddModal('quickCreateCheck', true, true)
                          closeMenu()
                        }}
                        className="block w-full text-left px-2 py-1 text-sm text-raisin-black hover:bg-gray-100 hover:text-black"
                      >
                        {t('quickCreateCheck')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Projects lng={lng} projects={projects} error={error} />
          </div>
        </div>
        {showModal && (
          <AddDialogModal
            isOpen={showModal}
            onClose={closeAddModal}
            onAddProject={
              modalOptions.windowTitle === 'createProject'
                ? handleCreateProject
                : handleAddFastCheck
            }
            lng={lng}
            showProject={true}
            showBook={modalOptions.showBook}
            showCheck={modalOptions.showCheck}
            windowTitle={modalOptions.windowTitle}
          />
        )}
      </div>
    </div>
  )
}

export default ProjectPage
