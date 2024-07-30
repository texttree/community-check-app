// Import your Client Component
import MainPage from './client'
import { getUser } from '@/app/actions/getUser'

export default async function Page({ params: { lng } }) {
  const user = await getUser()
  return (
    <>
      <MainPage lng={lng} user={user} />
    </>
  )
}
