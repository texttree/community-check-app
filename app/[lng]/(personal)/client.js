'use client'

import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const Index = ({ lng, user }) => {
  const { t } = useTranslation(lng, 'common')

  const [currentDomain, setCurrentDomain] = useState(
    'https://community-check-app.netlify.app'
  )

  useEffect(() => {
    setCurrentDomain(window.location.origin)
  }, [])

  const cardContent = [
    {
      title: t('checkText'),
      description: <p className="pt-2 text-sm">{t('checkTextDescription')}</p>,
      image: '/icon-check.svg',
      alt: 'Check',
    },

    {
      title: t('comment'),
      description: <p className="pt-2 text-sm">{t('commentDescription')}</p>,
      image: '/icon-comment.svg',
      alt: 'Comment',
    },

    {
      title: t('curingProject'),
      description: <p className="pt-2 text-sm">{t('curingProjectDescription')}</p>,
      image: '/icon-project.svg',
      alt: 'Project',
    },

    {
      title: t('integrationProjects'),
      description: (
        <>
          <p className="pt-2 text-sm">{t('integrationProjectsDescription')}</p>
          <br />
          <Link className="text-ming-blue hover:underline text-sm" href="/doc">
            {`${currentDomain}/doc`}
          </Link>
        </>
      ),
      image: '/icon-api.svg',
      alt: 'About',
    },
  ]
  return (
    <div className="flex flex-col items-center justify-center mb-32 md:mb-24">
      <div className="mx-auto text-center max-w-6xl text-sm md:text-base">
        <Image
          src="/logo.svg"
          alt="Community Check Logo"
          className="mx-auto mb-8"
          width={60}
          height={60}
        />
        <h1 className="mb-9 font-[600] text-3xl sm:text-4xl md:text-6xl lg:text-8xl text-ming-blue font-montserrat">
          Community Check
        </h1>
        <div className="mx-auto max-w-xl mb-9 text-base text-center">
          <p>{t('aboutComCheck')}</p>
          <ul className="mt-4 hidden">
            <li className="mb-3 italic">{t('features.one')}</li>
            <li className="mb-3 italic">{t('features.two')}</li>
            <li className="mb-3 italic">{t('features.three')}</li>
          </ul>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {cardContent.map((card) => (
            <div
              key={card.title}
              className="w-full h-auto p-5 md:p-4 text-left rounded-lg bg-white flex flex-col"
            >
              <div className="flex flex-row md:flex-col gap-6">
                <Image src={card.image} alt={card.alt} width={60} height={60} />
                <div>
                  <h2 className="font-bold text-base">{card.title}</h2>
                  {card.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-8 mx-5 h-auto flex flex-row justify-between items-center bg-ming-blue rounded-lg px-6 py-4 shadow-lg  left-0 right-0 sm:left-auto sm:right-auto min-w-52 sm:min-w-96">
        {user ? (
          <>
            <p className="text-white font-medium text-center">{t('goToProjects')}</p>
            <Link
              href="/projects"
              className="px-4 py-1 ml-3 h-8 rounded bg-white hover:bg-bright-gray text-center flex items-center whitespace-nowrap"
            >
              {t('projects')}
            </Link>
          </>
        ) : (
          <>
            <p className="text-white font-medium text-center">{t('startCheсking')}</p>
            <Link
              href="/login"
              className="px-4 py-1 ml-3 h-8 rounded bg-white hover:bg-bright-gray text-center flex items-center whitespace-nowrap"
            >
              {t('signIn')}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default Index
