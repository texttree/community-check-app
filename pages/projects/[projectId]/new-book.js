import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'

const NewBookPage = () => {
  const [bookName, setBookName] = useState('')
  const router = useRouter()
  const { projectId } = router.query

  const handleCreateBook = () => {}

  return (
    <div>
      <Link href={`/projects/${projectId}`}>Назад</Link>
      <h1>Название книги</h1>
      <p>Название</p>
      <input type="text" value={bookName} onChange={(e) => setBookName(e.target.value)} />
      <Link href={`/projects/${projectId}/${bookId}`}>
        <button onClick={handleCreateBook}>Создать книгу</button>
      </Link>
    </div>
  )
}

export default NewBookPage
