import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

const SwitchLanguage = () => {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng).then(() => {
      router.push(router.asPath, undefined, { locale: lng })
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`${
          i18n.language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
        } hover:bg-blue-600 hover:text-white px-2 py-1 rounded-md`}
      >
        {t('english')}
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`${
          i18n.language === 'ru' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
        } hover:bg-blue-600 hover:text-white px-2 py-1 rounded-md`}
      >
        {t('russian')}
      </button>
    </div>
  )
}

export default SwitchLanguage
