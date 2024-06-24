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
      <div className="mx-auto p-4 text-center max-w-6xl">
        <Image
          src="/logo.svg"
          alt="Community Check Logo"
          className="mx-auto mb-6 -mt-16 md:-mt-32"
          width={80}
          height={80}
        />
        <h1 className="font-bold text-4xl md:text-8xl mb-4 text-ming-blue font-montserrat">
          Community Check
        </h1>
        <p className="mx-auto max-w-2xl mb-10 text-sm md:text-lg text-center">
          Lorem ipsum dolor sit amet consectetur. Eget aliquam diam nunc eget mauris.
          Faucibus volutpat aliquam elementum faucibus proin massa vel elit. Ut
          sollicitudin nibh pharetra ullamcorper ullamcorper. Nunc tortor suspendisse
          tortor pretium massa mi odio vulputate cursus.
        </p>

        <div className="mb-10 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="w-full h-auto p-4 md:p-6 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-4">
              <Image
                src="/icon-check.svg"
                alt="Check"
                width={80}
                height={80}
                className="md:w-20 md:h-20"
              />
            </div>
            <h2 className="font-semibold text-lg md:text-xl">Проверка текста</h2>
            <p className="flex-grow">
              Пожалуйста, войдите, чтобы получить доступ к полному функционалу.
            </p>
          </div>

          <div className="w-full h-auto p-4 md:p-6 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-4">
              <Image
                src="/icon-comment.svg"
                alt="Comment"
                width={80}
                height={80}
                className="md:w-20 md:h-20"
              />
            </div>
            <h2 className="font-semibold text-lg md:text-xl">Комментирование</h2>
            <p className="flex-grow">
              Пожалуйста, войдите, чтобы получить доступ к полному функционалу.
            </p>
          </div>

          <div className="w-full h-auto p-4 md:p-6 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-4">
              <Image
                src="/icon-project.svg"
                alt="Project"
                width={80}
                height={80}
                className="md:w-20 md:h-20"
              />
            </div>
            <h2 className="font-semibold text-lg md:text-xl">
              Создание и курирование больших проектов
            </h2>
            <p className="flex-grow">
              Пожалуйста, войдите, чтобы получить доступ к полному функционалу.
            </p>
          </div>
          <div className="w-full h-auto p-4 md:p-6 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-4">
              <Image
                src="/icon-project.svg"
                alt="Project"
                width={80}
                height={80}
                className="md:w-20 md:h-20"
              />
            </div>
            <h2 className="font-semibold text-lg md:text-xl">
              Интеграция с большими проектами
            </h2>
            <Link className="flex-grow" href="/doc">{`${currentDomain}/doc`}</Link>
          </div>
        </div>
        <div className="mx-auto my-4 h-auto w-full md:w-2/5 flex  flex-row justify-between items-center bg-ming-blue rounded-lg px-6 py-4">
          <p className="text-white text-center text-sm md:text-base">
            Начните проверку прямо сейчас
          </p>
          <Link
            href="/login"
            className="px-6 py-2 h-10 text-ming-blue rounded bg-white hover:bg-gray-200 text-center flex items-center"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Index
