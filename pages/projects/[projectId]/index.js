import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'

const ProjectDetailsPage = () => {
  const _books = [{ id: 2, name: 'Rut' }]
  const [books, setProjects] = useState(_books)

  const router = useRouter()

  console.log(router.query.projectId)
  const projectId = router.query.projectId
  return (
    <div>
      <Link href="/projects">Назад</Link>
      <h1>{books[0].name}</h1>
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
              <Link href={`/projects/${projectId}/${books[0].id}`}>{books[0].name} </Link>
            </td>
          </tr>
        </tbody>
      </table>
      <Link href={`/projects/new-book`}>Создать Книгу</Link>
    </div>
  )
}

export default ProjectDetailsPage
