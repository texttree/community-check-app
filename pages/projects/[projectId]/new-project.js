import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const NewProjectPage = () => {
  const [projectName, setProjectName] = useState('')
  const router = useRouter()

  const createProject = () => {
    const newProject = {
      id: projectName,
      name: projectName,
    }
    router.push(`/projects?newProject=${encodeURI(projectName)}`)
  }

  return (
    <div>
      <h1>Создание проекта</h1>
      <Link href="/projects">Назад</Link>
      <div>
        <label htmlFor="projectName">Название</label>
        <input
          type="text"
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>
      <button onClick={createProject}>Создать</button>
    </div>
  )
}

export default NewProjectPage
