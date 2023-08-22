import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'

const ProjectDetailsPage = () => {
  const [project] = useState({
    id: '1',
    name: 'Tit',
    creationDate: '21.08.2023',
    lastCheckDate: '01.09.2023',
    totalChecks: 8,
    activeChecks: 4,
  })
  const router = useRouter()
  console.log(router.query.projectId)
  const projectId = router.query.projectId
  return (
    <div>
      <Link href="/projects">Назад</Link>
      <h1>{project.name}</h1>
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
            <td>{project.id}</td>
            <td>{project.name}</td>
            <td>{project.creationDate}</td>
            <td>{project.lastCheckDate}</td>
            <td>{project.totalChecks}</td>
            <td>{project.activeChecks}</td>
          </tr>
        </tbody>
      </table>
      <Link href={`/projects/${projectId}new-book`}>Создать+</Link>
    </div>
  )
}

export default ProjectDetailsPage
