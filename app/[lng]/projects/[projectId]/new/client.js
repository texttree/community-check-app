'use client'

import { useState } from 'react'
import axios from 'axios' // Импортируем Axios

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

import LeftArrow from '@/public/left.svg'
import { useTranslation } from '@/app/i18n/client'

const NewBookPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [errorMessage, setErrorMessage] = useState('')
  const [bookName, setBookName] = useState('')
  const router = useRouter()
  const { projectId } = useParams()

  const handleCreateBook = async () => {
    setErrorMessage('')
    const name = bookName.trim()
    if (name) {
      try {
        const response = await axios.post(`/api/projects/${projectId}/books`, { name }) // Используем Axios для POST запроса
        const data = response.data
        router.push(`/${lng}/projects/${projectId}/${data.book_id}`)
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
          href={`/${lng}/projects/${projectId}`}
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
export default NewBookPage
