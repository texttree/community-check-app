'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import { useTranslation } from '@/app/i18n/client'

import { fetcher } from '@/helpers/fetcher'

import CustomError from '@/app/components/CustomError'
import Loader from '@/app/components/Loader'
import Notes from '@/app/components/Notes'
import CheckInfo from '@/app/components/CheckInfo'

const CheckDetail = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const router = useRouter()
  const { checkId, chapterNumber } = useParams()

  const [chapter, setChapter] = useState([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    return parseInt(chapterNumber) || 1
  })

  const [isCheckExpired, setIsCheckExpired] = useState(false)
  const [chapterLength, setChapterLength] = useState(0)

  const { data: info } = useSWR(checkId && `/api/checks/${checkId}/info`, fetcher, {
    onError: (error) => console.error('Failed to fetch check info:', error),
  })
  const {
    data: material,
    isLoading,
    mutate,
  } = useSWR(checkId && `/api/checks/${checkId}`, fetcher)

  useEffect(() => {
    if (info?.check_finished_at) {
      const currentDate = new Date()
      const checkFinishedDate = new Date(info.check_finished_at)
      setIsCheckExpired(currentDate > checkFinishedDate)
    }
  }, [info])

  useEffect(() => {
    if (material?.content && chapter?.length === 0) {
      const _chapter = material.content[currentChapterIndex - 1]
      setChapter(_chapter)
      setChapterLength(material.content.length)
    }
  }, [material, currentChapterIndex, mutate, chapter])

  useEffect(() => {
    setCurrentChapterIndex((prevIndex) => parseInt(chapterNumber) || prevIndex)
  }, [chapterNumber])

  useEffect(() => {
    if (checkId) {
      mutate()
    }
  }, [checkId, mutate])

  const navigateToChapter = (index) => {
    router.push(`/${lng}/checks/${checkId}/${index}`)
  }

  const handleNextChapter = () => {
    if (currentChapterIndex < chapterLength) {
      navigateToChapter(currentChapterIndex + 1)
    }
  }

  if (info?.deleted_at) {
    return <CustomError statusCode={404} title={t('Check Deleted')} />
  }

  return (
    <div className="bg-gray-200">
      {isLoading && (
        <div className="max-w-6xl mx-auto p-4 text-center">
          <Loader />
        </div>
      )}
      {!isLoading && !material?.content && (
        <div className="max-w-6xl mx-auto p-4 text-center">
          <p className="text-2xl text-red-500">{t('contentNotLoaded')}</p>
        </div>
      )}
      {!isLoading && material?.content && (
        <div className="max-w-6xl mx-auto p-4">
          <CheckInfo checkId={checkId} lng={lng} />
          {(!isCheckExpired || info?.is_owner) && chapter?.verseObjects?.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => navigateToChapter(currentChapterIndex - 1)}
                  disabled={currentChapterIndex === 1}
                  className={`bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {t('previousChapter')}
                </button>
                <p className="text-2xl font-bold">{currentChapterIndex}</p>
                <button
                  onClick={handleNextChapter}
                  disabled={currentChapterIndex === chapterLength}
                  className={`bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {t('nextChapter')}
                </button>
              </div>
              {chapter?.verseObjects
                .filter((verse) => verse.text !== '')
                .map((verse) => (
                  <div key={verse.verse} className="bg-gray-100 p-2 rounded-md my-2">
                    <p className="text-lg font-semibold">{verse.verse}</p>
                    <p className="text-gray-700">{verse.text}</p>
                    <Notes
                      lng={lng}
                      checkId={checkId}
                      materialId={material.id}
                      reference={{ verse: verse.verse, chapter: currentChapterIndex }}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CheckDetail
