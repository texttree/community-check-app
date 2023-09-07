import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ChevronLeft } from 'feather-icons-react'

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
      console.log('Имя не может быть пустым')
    }
  }

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center mb-4">
          <Link href="/projects">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center">
              <ChevronLeft size={18} />
              Личный кабинет
            </button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-4">Создание проекта</h1>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="projectName" className="block font-medium text-gray-700">
              Название
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
            />
          </div>
          <button
            onClick={createProject}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewProjectPage
