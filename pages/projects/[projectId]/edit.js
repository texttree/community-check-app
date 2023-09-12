import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import LeftArrow from 'public/left.svg'

const ProjectEditPage = () => {
  const { t } = useTranslation()
  const [projectName, setProjectName] = useState('')
  const router = useRouter()
  const projectId = router.query.projectId
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
    const name = projectName.trim()
    if (name) {
      axios.post('/api/projects/' + projectId, { name, id: project.id }).then((res) => {
        if (res) {
          router.push('/projects/' + projectId)
        } else {
          console.log(res.data.error)
        }
      })
    } else {
      console.log('имя не может быть пустым')
    }
  }

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4">
        <Link
          href={'/projects/' + projectId}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center"
        >
          <LeftArrow className="h-5 w-5 mr-1" />
          {t('back')}
        </Link>
        {error ? (
          <p className="text-red-600">Возникла ошибка</p>
        ) : project ? (
          <>
            <div>
              <label className="text-2xl font-semibold" htmlFor="projectName">
                {t('name')}
              </label>{' '}
              <br />
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
              />
            </div>
            <button
              onClick={editProject}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
            >
              {t('accept')}
            </button>
          </>
        ) : (
          <p>{t('loading')}</p>
        )}
      </div>
    </div>
  )
}
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default ProjectEditPage
