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
import { Tab, TabGroup, TabList } from '@headlessui/react'

const ProjectEditPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [projectName, setProjectName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()
  const { projectId } = useParams()

  const { data: project, error } = useSWR(
    projectId && '/api/projects/' + projectId,
    fetcher
  )

  useEffect(() => {
    if (project?.name) {
      setProjectName(project.name)
    }
  }, [project?.name])

  const editProject = () => {
    setErrorMessage('')
    const name = projectName.trim()
    if (name) {
      axios
        .post('/api/projects/' + projectId, { name })
        .then((res) => {
          if (res.status === 200) {
            router.push('/' + lng + '/projects/' + projectId)
          }
        })
        .catch(() => {
          setErrorMessage(t('errorEditNameProject'))
        })
    } else {
      setErrorMessage(t('nameEmpty'))
    }
  }

  const openDeleteModal = () => {
    setShowDeleteModal(true)
  }

  const confirmDeleteProject = async () => {
    try {
      await axios.delete('/api/projects', {
        data: { projectId: project.id },
      })

      mutate('/api/projects', (data) => data.filter((p) => p.id !== project.id))
      setShowDeleteModal(false)
      router.push('/' + lng + '/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const cancelDeleteProject = () => {
    setShowDeleteModal(false)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-b-md sm:max-w-3xl lg:max-w-5xl">
          <div className="mb-4">
            <Link
              href={'/' + lng + '/projects/' + projectId}
              className="text-gray-400 hover:text-gray-600 flex items-center"
            >
              <LeftArrow className="h-5 w-5 mr-1" />
              {t('back')}
            </Link>
          </div>
          {error ? (
            <p className="text-red-600">{t('errorOccurred')}</p>
          ) : project ? (
            <>
              <div className="mb-4">
                <label className="text-xl font-semibold block mb-2" htmlFor="projectName">
                  {t('name')}
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
              </div>
              <div className="flex justify-end mb-8">
                <button
                  onClick={editProject}
                  className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
                >
                  {t('accept')}
                </button>
              </div>
              <div className="mt-8 border-t border-gray-300 w-full pt-4">
                <h2 className="text-xl font-semibold mb-2">{t('deleteProject')}</h2>
                <p className="text-red-600 mb-4">{t('warningDeleteProject')}</p>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                  onClick={openDeleteModal}
                >
                  {t('deleteProject')}
                </button>
              </div>
            </>
          ) : (
            <Loader />
          )}
        </div>
        {showDeleteModal && (
          <DeleteModal
            lng={lng}
            isVisible={showDeleteModal}
            message={`${t('confirmDeleteProject')}`}
            onConfirm={confirmDeleteProject}
            onCancel={cancelDeleteProject}
            expectedText={project?.name}
            requireTextMatch={true}
          />
        )}
      </TabGroup>
    </div>
  )
}

export default ProjectEditPage
