import Link from 'next/link'

import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'

const ProjectsPage = () => {
  const { data: projects, error } = useSWR('/api/projects', fetcher)
  return (
    <div className="mx-6 my-6">
      <h1 class="text-3xl font-bold">Проекты</h1>
      <div class="'grid grid-cols-1 gap-3 py-10 content-start md:grid-cols-2 xl:grid-cols-3 sm:gap-7 md:py-10'">
        {error ? (
          <p className="text-red-600" key="error">
            Возникла ошибка
          </p>
        ) : projects ? (
          projects.map((project) => (
            <div className="flex flex-col gap-3 py-10 sm:gap-7" key={project.id}>
              <Link href={`/projects/${project.id}`}>{project.name}</Link>
            </div>
          ))
        ) : (
          <li key="loading">Загрузка</li>
        )}
      </div>
      <Link href="/projects/new">Создать проект</Link>
    </div>
  )
}

export default ProjectsPage
