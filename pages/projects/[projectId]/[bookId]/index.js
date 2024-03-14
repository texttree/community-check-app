import Link from 'next/link'
import { useRouter } from 'next/router'

import { Toaster } from 'react-hot-toast'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import axios from 'axios'
import useSWR from 'swr'

import CheckList from '@/components/CheckList'
import { fetcher } from '@/helpers/fetcher'

import LeftArrow from 'public/left.svg'

const BookDetailsPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const {
    query: { projectId, bookId },
  } = useRouter()

  const { data: book, error } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}`,
    fetcher
  )

  const handleCreateCheck = () => {
    const currentDate = new Date()
    const formattedDate = currentDate.toISOString() // Используем toISOString для получения строкового представления даты

    const name = `${t('newCheck')} - ${formattedDate}`

    axios
      .post(`/api/projects/${projectId}/books/${bookId}/checks`, { name })
      .then((res) => {
        if (res.status === 200) {
          const checkId = res.data
          router.push(`/projects/${projectId}/${bookId}/${checkId}`)
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }

  return (
    <div className="bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto p-4">
        <Link
          href={`/projects/${projectId}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 mb-4 rounded-md inline-flex items-center"
        >
          <LeftArrow className="h-5 w-5 mr-1" />
          {t('back')}
        </Link>
        {error ? (
          <p className="text-red-600">{t('errorOccurred')}</p>
        ) : book ? (
          <>
            <h1 className="text-3xl font-bold mb-4">{book?.book_name}</h1>
            <Link
              href={`/projects/${projectId}/${bookId}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block mb-4"
            >
              {t('editBook')}
            </Link>
            <CheckList projectId={projectId} bookId={bookId} />
          </>
        ) : (
          <p>{t('loading')}</p>
        )}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 rounded-md inline-block"
          onClick={handleCreateCheck}
        >
          {t('startNewCheck')}
        </button>
      </div>
      <Toaster />
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
