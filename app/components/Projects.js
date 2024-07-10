'use client'

import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client'
import Loader from '@/app/components/Loader'
import Image from 'next/image'

const Projects = ({ lng, projects, error }) => {
  const { t } = useTranslation(lng, 'common')

  return (
    <>
      {error ? (
        <p className="text-red-600 text-sm">{t('errorOccurred')}</p>
      ) : projects ? (
        <div className="grid grid-cols-3 gap-2 mb-2 md:flex md:flex-wrap md:gap-4">
          {projects.map((project) => (
            <div key={project.id} className="flex flex-col items-center">
              <Link href={`projects/${project.id}`}>
                <Image
                  src="/folder.svg"
                  alt="folder icon"
                  width={80}
                  height={80}
                  className="rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
                />
                <p className="text-lg font-semibold text-raisin-black mt-1 text-center">
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
