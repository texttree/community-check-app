import TokenGeneration from './client'

function Page({ params: { lng } }) {
  return <TokenGeneration lng={lng} />
}

export default Page
