import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { fetcher } from '@/helpers/fetcher'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import CheckList from '@/components/CheckList'
import LeftArrow from 'public/left.svg'

const BookDetailsPage = () => {
  const { t } = useTranslation()
  const {
    query: { projectId, bookId },
  } = useRouter()

  const { data: book, error } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}`,
    fetcher
  )
  console.log(book)

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
            <h1 className="text-3xl font-bold mb-4">{book.name}</h1>
            <CheckList projectId={projectId} bookId={bookId} />
          </>
        ) : (
          <p>{t('loading')}</p>
        )}
        <Link
          href={`/projects/${projectId}/${bookId}/new`}
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
