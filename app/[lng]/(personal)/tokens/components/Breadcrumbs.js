import Link from 'next/link'
import LeftArrow from '@/public/left.svg'
import { useTranslation } from '@/app/i18n'

async function Breadcrumbs({ lng }) {
  const { t } = await useTranslation(lng, 'common')
  return (
    <div className="p-4 flex justify-start space-x-1 sm:space-x-4 mb-2 border-b">
      <Link
        href={`/${lng}/projects`}
        className="text-gray-400 hover:text-gray-500 inline-flex items-center text-sm"
      >
        <LeftArrow className="h-4 w-4 mr-1" />
        <span className="hidden sm:block">{t('projects')}</span>
      </Link>
      <h2 className="text-base sm:text-lg font-medium pl-0 sm:pl-3 border-0 sm:border-l">
        {t('tokens')}
      </h2>
    </div>
  )
}

export default Breadcrumbs
