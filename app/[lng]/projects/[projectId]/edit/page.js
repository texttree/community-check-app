import Client from './client'

function Page({ params: { lng } }) {
  return <Client lng={lng} />
}
export default Page
