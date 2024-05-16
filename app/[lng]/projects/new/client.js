'use client'

import { useState } from 'react'
import axios from 'axios' // Импортируем Axios

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import LeftArrow from '@/public/left.svg'
import { useTranslation } from '@/app/i18n/client'

const NewProjectPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [projectName, setProjectName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const createProject = async () => {
    setErrorMessage('')
    const name = projectName.trim()

    if (name) {
      try {
        const response = await axios.post('/api/projects', { name }) // Используем Axios для POST запроса

        if (!response.data) {
          throw new Error(t('errorCreateProject'))
        }

        router.push(`/${lng}/projects/${response.data}`)
      } catch (error) {
        setErrorMessage(error.message)
      }
    } else {
      setErrorMessage(t('nameEmpty'))
    }
  }

  return (
    <div className="bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center mb-4">
          <Link
            href={`/${lng}/projects`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center"
          >
            <LeftArrow className="h-5 w-5 mr-1" />
            {t('personalArea')}
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-4">{t('createProject')}</h1>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="projectName" className="block font-medium text-gray-700">
              {t('titleProject')}
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
            />
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
          </div>
          <button
            onClick={createProject}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            {t('create')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewProjectPage
