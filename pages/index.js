import Link from 'next/link'
import Projects from './projects'

const Index = () => {
  return (
    <>
      <div>
        <Link href="/projects">
          <Projects />
        </Link>
      </div>
    </>
  )
}

export default Index
