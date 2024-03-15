import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useUser } from '@supabase/auth-helpers-react'

const Index = () => {
  const { t } = useTranslation()
  const user = useUser()

  return (
    <div className="bg-gray-200">
      <div className="max-w-6xl mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('welcomeTo')}</h1>
        {user?.email ? (
          <>
            <p className="text-lg mb-4">{t('youLoggedIn')}</p>
            <Link
              href="/projects"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              {t('goToProjects')}
            </Link>
          </>
        ) : (
          <>
            <p className="text-lg mb-4">{t('loginToAccess')}</p>
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              {t('signIn')}
            </Link>
          </>
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

export default Index
