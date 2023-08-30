import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from 'axios'

const NewProjectPage = () => {
  const [projectName, setProjectName] = useState('')
  const router = useRouter()

  const createProject = () => {
    const name = projectName.trim()
    if (name) {
      axios.post('/api/projects', { name }).then((res) => {
        if (res) {
          router.push('/projects/' + res.data.id)
        } else {
          console.log(res.data.error)
        }
      })
    } else {
      console.log('имя не может быть пустым')
    }
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
