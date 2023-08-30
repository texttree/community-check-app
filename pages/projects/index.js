import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const ProjectsPage = () => {
  const _projects = [
    { id: 1, name: 'ROST' },
    { id: 2, name: 'RLOB' },
    { id: 3, name: 'RSOB' },
  ]
  const [projects, setProjects] = useState(_projects)
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
      <p className="text-3xl">text</p>
      <p>text</p>
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
