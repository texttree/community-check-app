'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import axios from 'axios'
import { fetcher } from '@/helpers/fetcher'
import LeftArrow from '@/public/left.svg'
import Loader from '@/app/components/Loader'
import { useTranslation } from '@/app/i18n/client'

const ProjectEditPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [projectName, setProjectName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
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

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded">
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
            <div className="flex justify-end">
              <button
                onClick={editProject}
                className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
              >
                {t('accept')}
              </button>
            </div>
            <div className="mt-8 border-t border-gray-300 w-full">
              <h2 className="text-xl font-semibold mb-2">{t('deleteProject')}</h2>
              <p className="text-gray-600 mb-4">
                Lorem ipsum dolor sit amet consectetur. Neque sed tellus tincidunt
                tincidunt interdum urna.
              </p>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
                {t('deleteProject')}
              </button>
            </div>
          </>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  )
}

export default ProjectEditPage
