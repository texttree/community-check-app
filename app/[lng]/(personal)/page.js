// Import your Client Component
import MainPage from './client'
import { useTranslation } from '../i18n'
import { getUser } from './actions'

export default async function Page({ params: { lng } }) {
  const { t } = await useTranslation(lng, 'common')
  // Fetch data directly in a Server Component
  // const recentPosts = await getPosts()
  // Forward fetched data to your Client Component
  const user = await getUser()
  return (
    <>
      <MainPage lng={lng} user={user} />
    </>
  )
}
