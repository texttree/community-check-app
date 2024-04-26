'use server'

import Link from 'next/link'
import { useTranslation } from '@/app/i18n'
import Projects from './client'

async function Page({ params: { lng } }) {
  const { t } = await useTranslation(lng, 'common')
  return (
    <div className="bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{t('projects')}</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Projects lng={lng} />
        </div>
        <Link
          href={`/${lng}/projects/new`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
        >
          {t('createProject')}
        </Link>
        <Link
          href={`/${lng}/tokens`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 ml-2 mt-4 inline-block rounded-md"
        >
          {t('createToken')}
        </Link>
      </div>
    </div>
  )
}

export default Page
