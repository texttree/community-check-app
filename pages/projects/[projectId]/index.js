import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'

const books = [{ id: 2, name: 'Ruth' }]

const ProjectDetailsPage = () => {
  const router = useRouter()
  const projectId = router.query.projectId
  const { data: project, error } = useSWR(
    projectId && '/api/projects/' + projectId,
    fetcher
  )

  return (
    <div>
      <Link href="/projects">Назад</Link>
      {error ? (
        <p>Возникла ошибка</p>
      ) : project ? (
        <>
          <h1>{project.name}</h1>
          <Link href={'/projects/' + projectId + '/edit'}>Edit project</Link> <br />
          <h1>Книги проекта</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Дата создания</th>
                <th>Дата последней проверки</th>
                <th>Кол-во проверок</th>
                <th>Активных проверок</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{books[0].id}</td>

                <td>
                  <Link href={`/projects/${projectId}/${books[0].id}`}>
                    {books[0].name}{' '}
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
          <Link href={`/projects/new-book`}>Создать Книгу</Link>
        </>
      ) : (
        <p>Loading</p>
      )}
    </div>
  )
}

export default ProjectDetailsPage
