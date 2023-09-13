import Projects from './projects'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
const Index = () => {
  return (
    <>
      <Projects />
    </>
  )
}
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default Index
