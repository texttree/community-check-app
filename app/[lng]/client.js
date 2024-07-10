'use client'

import Link from 'next/link'
import { useTranslation } from '../i18n/client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const Index = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')

  const [currentDomain, setCurrentDomain] = useState(
    'https://community-check-app.netlify.app'
  )

  useEffect(() => {
    setCurrentDomain(window.location.origin)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto p-2 text-center max-w-4xl">
        <Image
          src="/logo.svg"
          alt="Community Check Logo"
          className="mx-auto mb-4 -mt-8 md:-mt-16"
          width={60}
          height={60}
        />
        <h1 className="font-bold text-3xl md:text-6xl mb-2 text-ming-blue font-montserrat">
          Community Check
        </h1>
        <p className="mx-auto max-w-xl mb-6 text-xs md:text-sm text-center">
          {t('aboutComCheck')}
        </p>

        <div className="mb-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="w-full h-auto p-2 md:p-4 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-2">
              <Image
                src="/icon-check.svg"
                alt="Check"
                width={60}
                height={60}
                className="md:w-16 md:h-16"
              />
            </div>
            <h2 className="font-semibold text-base md:text-lg">{t('checkText')}</h2>
            <p className="flex-grow text-xs md:text-sm">{t('loginToAccess')}</p>
          </div>

          <div className="w-full h-auto p-2 md:p-4 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-2">
              <Image
                src="/icon-comment.svg"
                alt="Comment"
                width={60}
                height={60}
                className="md:w-16 md:h-16"
              />
            </div>
            <h2 className="font-semibold text-base md:text-lg">{t('comment')}</h2>
            <p className="flex-grow text-xs md:text-sm">{t('loginToAccess')}</p>
          </div>

          <div className="w-full h-auto p-2 md:p-4 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-2">
              <Image
                src="/icon-project.svg"
                alt="Project"
                width={60}
                height={60}
                className="md:w-16 md:h-16"
              />
            </div>
            <h2 className="font-semibold text-base md:text-lg">{t('curingProject')}</h2>
            <p className="flex-grow text-xs md:text-sm">{t('loginToAccess')}</p>
          </div>
          <div className="w-full h-auto p-2 md:p-4 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-2">
              <Image
                src="/icon-project.svg"
                alt="Project"
                width={60}
                height={60}
                className="md:w-16 md:h-16"
              />
            </div>
            <h2 className="font-semibold text-base md:text-lg">
              {t('integrationProjects')}
            </h2>
            <Link
              className="flex-grow text-xs md:text-sm"
              href="/doc"
            >{`${currentDomain}/doc`}</Link>
          </div>
        </div>
        <div className="mx-auto my-4 h-auto w-full md:w-3/5 flex flex-row justify-between items-center bg-ming-blue rounded-lg px-4 py-2">
          <p className="text-white text-center text-xs md:text-sm">
            {t('startCheсking')}
          </p>
          <Link
            href="/login"
            className="px-4 py-1 h-8 text-ming-blue rounded bg-white hover:bg-gray-200 text-center flex items-center text-xs md:text-sm"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Index
