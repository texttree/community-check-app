// Import your Client Component
import MainPage from './main-page'
import { useTranslation } from '../i18n'
// async function getPosts() {
//   const res = await fetch('https://...')
//   const posts = await res.json()
//   return posts
// }

export default async function Page({ params: { lng } }) {
  console.log({ lng })
  const { t } = await useTranslation(lng, 'common')
  // Fetch data directly in a Server Component
  // const recentPosts = await getPosts()
  // Forward fetched data to your Client Component
  return (
    <>
      <h1 className="text-3xl">{t('welcomeTo')}</h1>
      <MainPage lng={lng} />
    </>
  )
}
