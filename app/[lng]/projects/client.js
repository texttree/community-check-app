'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client'
import axios from 'axios'
import Projects from '@/app/components/Projects'
import AddModal from '@/app/components/AddModal'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'
import Menu from '@/app/components/Menu'

const ProjectPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [showModal, setShowModal] = useState(false)
  const [projects, setProjects] = useState([])
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
            <div className="p-2 border-b-0 md:p-4 md:flex justify-start mb-2 md:border-b">
              <Menu>
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
              </Menu>
            </div>
            <Projects lng={lng} projects={projects} error={error} />
          </div>
        </div>
        {showModal && (
          <AddModal
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
