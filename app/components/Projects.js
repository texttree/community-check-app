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
        <p className="text-red-600">{t('errorOccurred')}</p>
      ) : projects ? (
        <div className="grid grid-cols-3 gap-4 mb-4 md:flex md:flex-wrap md:gap-6">
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
