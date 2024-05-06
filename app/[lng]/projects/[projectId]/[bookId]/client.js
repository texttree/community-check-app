'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

import axios from 'axios'
import useSWR from 'swr'

import CheckList from '@/app/components/CheckList'
import { fetcher } from '@/helpers/fetcher'

import LeftArrow from '@/public/left.svg'
import Loader from '@/app/components/Loader'
import { useTranslation } from '@/app/i18n/client'

const BookDetailsPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const router = useRouter()
  const { projectId, bookId } = useParams()

  const { data: book, error } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}`,
    fetcher
  )

  const handleCreateCheck = () => {
    const currentDate = new Date()
    const formattedDate = currentDate.toISOString()

    const name = `${t('newCheck')} - ${formattedDate}`

    axios
      .post(`/api/projects/${projectId}/books/${bookId}/checks`, { name })
      .then((res) => {
        if (res.status === 201) {
          const checkId = res.data
          router.push(`/${lng}/projects/${projectId}/${bookId}/${checkId}`)
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
          href={`/${lng}//projects/${projectId}`}
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
              href={`/${lng}/projects/${projectId}/${bookId}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block mb-4"
            >
              {t('editBook')}
            </Link>
            <CheckList lng={lng} projectId={projectId} bookId={bookId} />
          </>
        ) : (
          <Loader />
        )}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 rounded-md inline-block"
          onClick={handleCreateCheck}
        >
          {t('startNewCheck')}
        </button>
      </div>
    </div>
  )
}

export default BookDetailsPage
