import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'
import axios from 'axios'
import { useEffect, useState } from 'react'

const ProjectEditPage = () => {
  const [projectName, setProjectName] = useState('')
  const router = useRouter()
  const projectId = router.query.projectId
  const { data: project, error } = useSWR(
    projectId && '/api/projects/' + projectId,
    fetcher
  )
  useEffect(() => {
    if (project?.name) {
      setProjectName(project.name)
    }
  }, [project?.name])

  const editProject = () => {
    const name = projectName.trim()
    if (name) {
      axios.post('/api/projects/' + projectId, { name, id: project.id }).then((res) => {
        if (res) {
          router.push('/projects/' + projectId)
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
      <Link href="/projects">Назад</Link>
      {error ? (
        <p>Возникла ошибка</p>
      ) : project ? (
        <>
          <div>
            <label htmlFor="projectName">Название</label> <br />
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <button onClick={editProject}>Edit</button>
        </>
      ) : (
        <p>Loading</p>
      )}
    </div>
  )
}

export default ProjectEditPage
