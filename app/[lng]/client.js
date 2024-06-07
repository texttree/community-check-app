'use client'

import Link from 'next/link'
import { useTranslation } from '../i18n/client'
import Image from 'next/image'

const Index = ({ lng, user }) => {
  const { t } = useTranslation(lng, 'common')

  const currentDomain =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://community-check-app.netlify.app'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="mx-auto p-4 text-center max-w-6xl">
        <Image
          src="/logo.svg"
          alt="Community Check Logo"
          className="mx-auto mb-6"
          width={60}
          height={60}
        />
        <h1 className="font-bold text-8xl mb-4 text-ming-blue font-montserrat">
          Community Check
        </h1>
        <p className="mx-auto max-w-2xl mb-10 text-lg text-center">
          Lorem ipsum dolor sit amet consectetur. Eget aliquam diam nunc eget mauris.
          Faucibus volutpat aliquam elementum faucibus proin massa vel elit. Ut
          sollicitudin nibh pharetra ullamcorper ullamcorper. Nunc tortor suspendisse
          tortor pretium massa mi odio vulputate cursus.
        </p>

        <div className="mb-10 grid gap-6 grid-cols-1 md:grid-cols-3">
          <div className="w-full md:w-auto h-auto md:h-64 p-6 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-4">
              <Image src="/icon-check.svg" alt="Check" width={60} height={60} />
            </div>
            <h2 className="font-semibold text-xl">Проверка текста</h2>
            <p className="flex-grow">
              Пожалуйста, войдите, чтобы получить доступ к полному функционалу.
            </p>
          </div>

          <div className="w-full md:w-auto h-auto md:h-64 p-6 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-4">
              <Image src="/icon-comment.svg" alt="Comment" width={60} height={60} />
            </div>
            <h2 className="font-semibold text-xl">Комментирование</h2>
            <p className="flex-grow">
              Пожалуйста, войдите, чтобы получить доступ к полному функционалу.
            </p>
          </div>

          <div className="w-full md:w-auto h-auto md:h-64 p-6 text-left border border-gray-200 rounded-lg bg-white shadow flex flex-col">
            <div className="flex items-center mb-4">
              <Image src="/icon-project.svg" alt="Project" width={60} height={60} />
            </div>
            <h2 className="font-semibold text-xl">
              Создание и курирование больших проектов
            </h2>
            <p className="flex-grow">
              Пожалуйста, войдите, чтобы получить доступ к полному функционалу.
            </p>
          </div>
        </div>

        <div className="mb-10 flex flex-col items-center space-y-4">
          <div className="flex justify-center bg-gray-200 rounded-lg h-12 items-center space-x-4 px-6">
            <p className="font-bold text-lg flex-shrink-0">API</p>
            <Link href="/doc">{`${currentDomain}/doc`}</Link>
          </div>
        </div>
        <div className="mx-auto my- h-16 w-2/5 flex justify-center bg-gray-200 rounded-lg">
          <p className="mt-3 px-6 py-2 text-black ">Начните проверку прямо сейчас</p>
          <Link
            href="/login"
            className="mt-3 px-6 py-2 h-10 text-white rounded bg-ming-blue hover:bg-dark-slate-gray"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Index
