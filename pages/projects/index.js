import Link from 'next/link'

import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'

const ProjectsPage = () => {
  const { data: projects, error } = useSWR('/api/projects', fetcher)
  return (
    <div>
      <h1>Список проектов</h1>
      <p className="text-3xl">text</p>
      <p>text</p>
      <ul>
        {error ? (
          <li key="error">Возникла ошибка</li>
        ) : projects ? (
          projects.map((project) => (
            <li key={project.id}>
              <Link href={`/projects/${project.id}`}>{project.name}</Link>
            </li>
          ))
        ) : (
          <li key="loading">Загрузка</li>
        )}
      </ul>
      <Link href="/projects/new">Создать проект</Link>
    </div>
  )
}

export default ProjectsPage
