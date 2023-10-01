import Link from 'next/link'
import { useTranslation } from 'next-i18next'
const books = [
  { id: 2, name: 'Ruth', finished_at: 'dd:mm:yyyy', checks: '2' },
  { id: 3, name: 'testBook', finished_at: 'dd:mm:yyyy', checks: '2' },
]

const BookList = ({ projectId }) => {
  const { t } = useTranslation()
  return (
    <>
      <h1 className="text-2xl font-semibold">{t('projectBooks')}</h1>
      <div className="bg-white p-4 rounded-lg shadow-md mt-2">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-center">ID</th>
              <th className="border p-2 text-center">{t('titleInTable')}</th>
              <th className="border p-2 text-center">{t('dateCreation')}</th>
              <th className="border p-2 text-center">{t('dateLastCheck')}</th>
              <th className="border p-2 text-center">{t('NumberChecks')}</th>
              <th className="border p-2 text-center">{t('activeChecks')}</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td className="border p-2 text-center">{book.id}</td>
                <td className="border p-2 text-center">
                  <Link
                    href={`/projects/${projectId}/${book.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {book.name}
                  </Link>
                </td>
                <td className="border p-2 text-center">{book.finished_at}</td>
                <td className="border p-2 text-center">{book.finished_at}</td>
                <td className="border p-2 text-center">{book.checks}</td>
                <td className="border p-2 text-center">{book.checks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link
        href={`/projects/${projectId}/new`}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
      >
        {t('createBook')}
      </Link>
    </>
  )
}

export default BookList
