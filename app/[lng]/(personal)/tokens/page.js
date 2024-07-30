import TokenGeneration from './components/TokenGeneration'

function Page({ params: { lng } }) {
  return <TokenGeneration lng={lng} />
}

export default Page
