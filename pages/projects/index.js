import Link from 'next/link'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'

const ProjectsPage = () => {
  const { data: projects, error } = useSWR('/api/projects', fetcher)

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Проекты</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {error ? (
            <p className="text-red-600">Возникла ошибка</p>
          ) : projects ? (
            projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="block text-center">
                  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105">
                    <p className="text-3xl font-semibold text-blue-600">{project.name}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>Загрузка...</p>
          )}
        </div>
        <Link
          href="/projects/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
        >
          Создать проект
        </Link>
      </div>
    </div>
  )
}

export default ProjectsPage
