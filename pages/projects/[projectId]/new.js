import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import LeftArrow from 'public/left.svg'

const NewBookPage = () => {
  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState('')
  const [bookName, setBookName] = useState('')
  const router = useRouter()
  const { projectId } = router.query

  const handleCreateBook = async () => {
    setErrorMessage('')
    const name = bookName.trim()
    if (name) {
      try {
        const response = await fetch(`/api/projects/${projectId}/books`, {
          method: 'POST',
          body: JSON.stringify({ name }),
        })
        if (!response.ok) {
          const errorMessage =
            response.status === 400 ? t('errorCreateBook') : response.statusText
          throw new Error(`${errorMessage}`)
        }
        const data = await response.json()
        router.push(`/projects/${projectId}/${data.book_id}`)
      } catch (error) {
        console.error(error)
        setErrorMessage(error.message)
      }
    } else {
      setErrorMessage(t('nameEmpty'))
    }
  }

  return (
    <div className="bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto p-4">
        <Link
          href={`/projects/${projectId}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center"
        >
          <LeftArrow className="h-5 w-5 mr-1" />
          {t('back')}
        </Link>
        <h1 className="text-2xl font-semibold">{t('bookTitle')}</h1>
        <input
          type="text"
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
        />
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
          onClick={handleCreateBook}
        >
          {t('createBook')}
        </button>
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

export default NewBookPage
