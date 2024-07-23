'use client'

import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client'
import Loader from '@/app/components/Loader'
import Image from 'next/image'

const Projects = ({ lng, projects, error }) => {
  const { t } = useTranslation(lng, 'common')

  return (
    <div className="p-4">
      {error ? (
        <p className="text-red-600 text-sm">{t('errorOccurred')}</p>
      ) : projects ? (
        projects.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 mb-2 md:gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col items-center hover:underline md:w-[112px] w-[76px]"
              >
                <Link href={`projects/${project.id}`}>
                  <Image
                    src="/folder.svg"
                    alt="folder icon"
                    width={112}
                    height={107}
                    className=""
                  />
                  <p className="text-sm mt-1 text-center">{project.name}</p>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm mt-2 mb-8">{t('noProjects')}</p>
        )
      ) : (
        <Loader line={['w-[76px] h-2.5', 'w-[112px] h-2.5', 'w-[76px] h-2.5']} />
      )}
    </div>
  )
}

export default Projects
