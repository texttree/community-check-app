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
    <div>
      <button onClick={() => changeLanguage('en')}>En</button>{' '}
      <button onClick={() => changeLanguage('ru')}>Ру</button>
    </div>
  )
}

export default SwitchLanguage
