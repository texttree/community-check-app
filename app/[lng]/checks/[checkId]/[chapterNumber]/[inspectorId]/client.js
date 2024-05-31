'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import { useTranslation } from '@/app/i18n/client'

import { fetcher } from '@/helpers/fetcher'
import CheckInfo from '@/app/components/CheckInfo'
import Loader from '@/app/components/Loader'
import InspectorNotes from '@/app/components/InspectorNotes'
import CustomError from '@/app/components/CustomError'

const CheckInspectorDetail = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const router = useRouter()
  const { checkId, inspectorId, chapterNumber } = useParams()

  const [chapter, setChapter] = useState([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    return parseInt(chapterNumber) || 1
  })
  const [notes, setNotes] = useState([])

  const [chapterLength, setChapterLength] = useState(0)
  const [isCheckExpired, setIsCheckExpired] = useState(false)

  const { data: info } = useSWR(checkId && `/api/checks/${checkId}/info`, fetcher, {
    onError: (error) => console.error('Failed to fetch check info:', error),
  })

  const { data: isInspectorDeleted, isLoading: isInspectorDeletedLoading } = useSWR(
    checkId && inspectorId && `/api/checks/${checkId}/${inspectorId}/info`,
    fetcher,
    {
      onError: (error) => console.error('Failed to fetch inspector info:', error),
    }
  )

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

  const { data: inspectorNotes, mutate: inspectorMutate } = useSWR(
    checkId && `/api/checks/${checkId}/${inspectorId}`,
    fetcher,
    {
      onError: (error) => console.error('Failed to fetch inspector notes:', error),
    }
  )

  useEffect(() => {
    if (material?.content && chapter?.length === 0) {
      const _chapter = material.content[currentChapterIndex - 1]
      setChapter(_chapter)
      setChapterLength(material.content.length)
    }
  }, [material, currentChapterIndex, mutate, chapter])

  useEffect(() => {
    if (inspectorNotes) {
      setNotes(inspectorNotes[currentChapterIndex.toString()] ?? [])
    }
  }, [inspectorNotes, currentChapterIndex])

  useEffect(() => {
    setCurrentChapterIndex((prevIndex) => parseInt(chapterNumber) || prevIndex)
  }, [chapterNumber])

  useEffect(() => {
    if (checkId) {
      mutate()
    }
  }, [checkId, mutate])

  const navigateToChapter = (index) => {
    router.push(`/${lng}/checks/${checkId}/${index}/${inspectorId}`)
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

      {!isInspectorDeletedLoading && isInspectorDeleted && (
        <div className="max-w-6xl mx-auto p-4 text-center">
          <p className="text-2xl text-red-500">{t('inspectorDeleted')}</p>
        </div>
      )}

      {!isLoading && material?.content && !isInspectorDeleted && (
        <div className="max-w-6xl mx-auto p-4">
          <CheckInfo checkId={checkId} lng={lng} />
          {(!isCheckExpired || info?.is_owner) && chapter?.verseObjects?.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => navigateToChapter(currentChapterIndex - 1)}
                  disabled={currentChapterIndex === 1}
                  className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('previousChapter')}
                </button>
                <p className="text-2xl font-bold">{currentChapterIndex}</p>
                <button
                  onClick={handleNextChapter}
                  disabled={currentChapterIndex === chapterLength}
                  className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <InspectorNotes
                      lng={lng}
                      checkId={checkId}
                      materialId={material.id}
                      notes={notes[verse.verse]}
                      mutate={inspectorMutate}
                      inspectorId={inspectorId}
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

export default CheckInspectorDetail
