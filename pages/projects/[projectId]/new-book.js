import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { ChevronLeft } from 'feather-icons-react'

const NewBookPage = () => {
  const [bookName, setBookName] = useState('')
  const router = useRouter()
  const { projectId } = router.query

  const handleCreateBook = () => {}

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4">
        <Link href={`/projects/${projectId}`}>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center">
            <ChevronLeft size={18} />
            Назад
          </button>
        </Link>
        <h1 className="text-2xl font-semibold">Название книги</h1>

        <input
          type="text"
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
        />
        <Link href={`/projects/${projectId}`}>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
            onClick={handleCreateBook}
          >
            Создать книгу
          </button>
        </Link>
      </div>
    </div>
  )
}

export default NewBookPage
