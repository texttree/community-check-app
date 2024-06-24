'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { useTranslation } from '@/app/i18n/client'
import { fetcher } from '@/helpers/fetcher'
import Loader from '@/app/components/Loader'
import Image from 'next/image'

const Projects = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const { data: projects, error } = useSWR('/api/projects', fetcher)

  return (
    <>
      {error ? (
        <p className="text-red-600">{t('errorOccurred')}</p>
      ) : projects ? (
        <div className="flex flex-wrap gap-4 mb-4">
          {projects.map((project) => (
            <div key={project.id} className="flex flex-col items-center">
              <Link href={`projects/${project.id}`}>
                <Image
                  src="/folder.svg"
                  alt="folder icon"
                  width={120}
                  height={120}
                  className="rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
                />
                <p className="text-xl font-semibold text-raisin-black mt-2 text-center">
                  {project.name}
                </p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <Loader />
      )}
    </>
  )
}

export default Projects
