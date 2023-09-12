import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import LeftArrow from 'public/left.svg'

const BookDetailsPage = () => {
  const { t } = useTranslation()
  const [bookName, setBookName] = useState('Test')
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

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4">
        <Link
          href={`/projects/${projectId}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 mb-4 rounded-md inline-flex items-center"
        >
          <LeftArrow className="h-5 w-5 mr-1" />
          {t('back')}
        </Link>
        <h1 className="text-3xl font-bold mb-4">{bookName}</h1>
        <h2 className="text-2xl font-semibold mb-2">{t('bookChecks')}</h2>
        <div className="bg-white p-4 rounded-lg shadow-md mt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-center">{t('number')}</th>
                <th className="border p-2 text-center">{t('titleInTable')}</th>
                <th className="border p-2 text-center">{t('checEkndDate')}</th>
                <th className="border p-2 text-center">{t('downloadNotes')}</th>
                <th className="border p-2 text-center">{t('activity')}</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => (
                <tr key={check.id}>
                  <td className="border p-2 text-center">{check.num}</td>
                  <td className="border p-2 text-center">
                    <Link
                      href={`/projects/${projectId}/${bookId}/${check.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {check.name}
                    </Link>
                  </td>
                  <td className="border p-2 text-center">{check.date}</td>
                  <td className="border p-2 text-center">{t('download')}</td>
                  <td className="border p-2 text-center">{check.checkActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          href={`/projects/${projectId}/${bookId}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 rounded-md inline-block"
        >
          {t('startNewCheck')}
        </Link>
      </div>
    </div>
  )
}
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default BookDetailsPage
