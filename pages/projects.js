import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const ProjectsPage = () => {
  const [projects, setProjects] = useState([])
  const router = useRouter()

  useEffect(() => {
    const newProjectName = router.query.newProject
    if (newProjectName) {
      addProject(newProjectName)
    }
  }, [router.query.newProject])

  const addProject = (projectName) => {
    const newProject = {
      id: '1',
      name: projectName,
    }
    setProjects([...projects, newProject])
  }
  console.log(router.query)
  return (
    <div>
      <h1>Список проектов</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={`/projects/${project.id}`}>{project.name}</Link>
          </li>
        ))}
      </ul>
      <Link href="/projects/new-project">Создать проект</Link>
    </div>
  )
}

export default ProjectsPage
