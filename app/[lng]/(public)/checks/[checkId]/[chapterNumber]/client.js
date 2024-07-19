'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import { useTranslation } from '@/app/i18n/client'

import { fetcher } from '@/helpers/fetcher'

import CustomError from '@/app/components/CustomError'
import Loader from '@/app/components/Loader'
import Notes from '@/app/components/Notes'
import LoadingBlock from '@/app/components/LoadingBlock'

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

  const [showNoteInputs, setShowNoteInputs] = useState({})

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

  const toggleNoteInput = (verseKey) => {
    setShowNoteInputs((prevState) => ({
      ...prevState,
      [verseKey]: !prevState[verseKey],
    }))
  }

  if (info?.deleted_at) {
    return <CustomError statusCode={404} title={t('CheckDeleted')} />
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg">
        <div className="bg-ming-blue p-3.5 w-full hidden md:block"></div>
        <div className="bg-inherit md:bg-white pb-32 md:pb-0">
          {isLoading && <LoadingBlock />}
          {!isLoading && !material?.content && (
            <p className="p-4 text-lg text-red-500">{t('contentNotLoaded')}</p>
          )}
          {!isLoading && material?.content && info && (
            <div>
              <div className="border-b">
                {isCheckExpired ? (
                  <p className="p-4 text-lg text-red-500">{t('checkExpiredMessage')}</p>
                ) : (
                  <div className="py-4 pl-0 pr-4 md:pl-4">
                    <div className="text-lg font-bold">
                      {info.check_name}, {info.book_name}
                    </div>
                    <div className="mt-3 text-xs text-foil-silver">
                      {info.check_finished_at}
                    </div>
                  </div>
                )}
              </div>
              {(!isCheckExpired || info?.is_owner) &&
                chapter?.verseObjects?.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {chapter?.verseObjects
                      .filter((verse) => verse.text !== '')
                      .map((verse) => (
                        <div
                          key={verse.verse}
                          className="p-4 border-b-0 bg-white rounded-2xl md:rounded-none md:bg-inherit md:border-b"
                        >
                          <div className="flex flex-row items-center gap-2">
                            <p className="font-medium self-start py-2">{verse.verse}.</p>
                            <p className="flex-1 py-2">{verse.text}</p>
                            <button
                              onClick={() => toggleNoteInput(verse.verse)}
                              className="p-2 text-neutral-700 hover:text-raisin-black focus:outline-none"
                            >
                              {showNoteInputs[verse.verse] ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                  stroke="currentColor"
                                  className="w-6 h-6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m4.5 15.75 7.5-7.5 7.5 7.5"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                  stroke="currentColor"
                                  className="w-6 h-6"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                          {showNoteInputs[verse.verse] && (
                            <Notes
                              lng={lng}
                              checkId={checkId}
                              materialId={material.id}
                              reference={{
                                verse: verse.verse,
                                chapter: currentChapterIndex,
                              }}
                              toggleNoteInput={toggleNoteInput}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t max-w-full p-6 mb-0 md:relative flex items-center justify-between md:max-w-sm md:p-4 mt-8 md:bg-inherit mx-auto md:border-t-0">
        <button
          onClick={() => navigateToChapter(currentChapterIndex - 1)}
          disabled={currentChapterIndex === 1}
          className={`p-2 rounded-full transition duration-300 ${
            currentChapterIndex === 1
              ? 'cursor-not-allowed bg-neutral-200 text-raisin-black'
              : 'bg-raisin-black text-white hover:bg-raisin-black/90'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <p className="text-xl font-bold">
          {t('chapter')} {currentChapterIndex}
        </p>
        <button
          onClick={handleNextChapter}
          disabled={currentChapterIndex === chapterLength}
          className={`p-2 rounded-full transition duration-300 ${
            currentChapterIndex === chapterLength
              ? 'cursor-not-allowed bg-neutral-200 text-raisin-black'
              : 'bg-raisin-black text-white hover:bg-raisin-black/90'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default CheckDetail
