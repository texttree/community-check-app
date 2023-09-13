import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import i18nextConfig from 'next-i18next.config'

const SwitchLanguage = () => {
  const { i18n } = useTranslation()
  const router = useRouter()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng).then(() => {
      router.push(router.asPath, undefined, { locale: lng })
    })
  }
  console.log(router.locale)
  return (
    <div>
      <button onClick={() => changeLanguage('en')}>En</button>{' '}
      <button onClick={() => changeLanguage('ru')}>Ру</button>
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

export default SwitchLanguage
