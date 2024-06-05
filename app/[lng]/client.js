'use client'

import Link from 'next/link'
import { useTranslation } from '../i18n/client'
import Image from 'next/image'

const Index = ({ lng, user }) => {
  const { t } = useTranslation(lng, 'common')
  return (
    <div>
      <div className="max-w-6xl mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('welcomeTo')}</h1>
        <div className="flex justify-between items-center relative">
          <div className="mr-4">
            <Image src="Paul.svg" alt="Paul" width={500} height={300} />
          </div>
          {user?.email ? (
            <>
              <p className="text-lg mb-4">{t('youLoggedIn')}</p>
              <Link
                href={`/${lng}/projects`}
                className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md inline-flex items-center"
              >
                {t('goToProjects')}
              </Link>
            </>
          ) : (
            <div className="bg-white py-4 rounded-md w-96 h-48 mb-48 absolute right-72">
              <h5 className="mb-4 text-2xl font-bold">{t('Войти в аккаунт')}</h5>
              <p className="text-lg mb-4">{t('loginToAccess')}</p>
              <Link
                href="/login"
                className="bg-ming-blue hover:bg-deep-space text-white w-2/3 py-2 rounded-md inline-flex items-center justify-center"
              >
                {t('signIn')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Index
