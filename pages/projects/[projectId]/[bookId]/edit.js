import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import useSWR from 'swr'
import axios from 'axios'

import { fetcher } from '@/helpers/fetcher'

import LeftArrow from 'public/left.svg'

const BookEditPage = () => {
  const { t } = useTranslation()
  const [bookName, setBookName] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)

  const router = useRouter()
  const {
    query: { projectId, bookId },
  } = useRouter()

  const { data: book, error: bookError } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}`,
    fetcher
  )

  useEffect(() => {
    if (bookError) {
      console.error(bookError)
    }
  }, [bookError])

  useEffect(() => {
    if (book?.book_name) {
      setBookName(book.book_name)
    }
  }, [book])

  const editBook = async () => {
    setErrorMessage(null)
    const name = bookName.trim()
    if (name) {
      try {
        const response = await axios.post(`/api/projects/${projectId}/books/${bookId}`, {
          name,
        })
        if (response.status === 200) {
          router.push('/projects/' + projectId + `/${bookId}`)
        }
      } catch (error) {
        setErrorMessage({ message: t('errorEditNameBook') })
      }
    } else {
      setErrorMessage({ message: t('nameEmpty') })
    }
  }

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4">
        <Link href={'/projects/' + projectId}>
          <div className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center">
            <LeftArrow className="h-5 w-5 mr-1" />
            {t('back')}
          </div>
        </Link>
        <>
          <div>
            <label className="text-2xl font-semibold" htmlFor="bookName">
              {t('name')}
            </label>
            <input
              type="text"
              id="bookName"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              className="mt-1 px-2 py-1 mb-2 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
            />
            {errorMessage && <p className="text-red-600">{errorMessage.message}</p>}
          </div>
          <button
            onClick={editBook}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
          >
            {t('accept')}
          </button>
        </>
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

export default BookEditPage
