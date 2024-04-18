import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { languages } from '@/next-i18next.config' // Импортируйте массив языков

const useChangeLanguage = (locale) => {
  let { i18n } = useTranslation()
  useEffect(() => {
    i18n.changeLanguage(locale)
  }, [locale, i18n])
}

const SwitchLanguage = () => {
  const { i18n } = useTranslation()
  const router = useRouter()
  useChangeLanguage(i18n.language)

  const changeLanguage = (lng) => {
    router.push(router.asPath, undefined, { locale: lng })
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      {languages.map((language) => (
        <button
          key={language}
          onClick={() => changeLanguage(language)}
          className={`${
            i18n.language === language
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-600'
          } hover:bg-blue-600 hover:text-white px-2 py-1 rounded-md`}
        >
          {language}
        </button>
      ))}
    </div>
  )
}

export default SwitchLanguage
