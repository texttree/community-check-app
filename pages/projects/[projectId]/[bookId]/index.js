import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'

const BookDetailsPage = () => {
  const [bookName, setBookName] = useState('')
  const router = useRouter()
  const { projectId, bookId } = router.query
  const _checks = [
    { id: 3, num: 1, name: 'Общественная', date: '22.08.2023', checkActivity: 4 },
    { id: 4, num: 2, name: 'Редакторская', date: '28.08.2023', checkActivity: 2 },
    { id: 5, num: 3, name: 'Лингвистическая', date: '31.08.2023', checkActivity: 1 },
    { id: 6, num: 4, name: 'Пасторская', date: '22.09.2023', checkActivity: 3 },
  ]
  const [checks, setChecks] = useState(_checks)
  const handleCreateBook = () => {}
  {
  }
  console.log(router.query)
  return (
    <div>
      <Link href={`/projects/${projectId}`}>Назад</Link>
      <h1>{bookName}</h1>
      <h2>Проверки книги</h2>
      <table>
        <thead>
          <tr>
            <th>Номер</th>
            <th>Название</th>
            <th>Дата окончания</th>
            <th>Скачать заметки</th>
            <th>Активность (кол-во проверок)</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.id}>
              <td>{check.num}</td>
              <Link href={`/projects/${projectId}/${bookId}/${check.id}`}>
                <td>{check.name}</td>
              </Link>
              <td>{check.date}</td>
              <td>Скачать</td>
              <td>{check.checkActivity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href={`/projects/${projectId}`}>Начать новую проверку</Link>
    </div>
  )
}

export default BookDetailsPage
