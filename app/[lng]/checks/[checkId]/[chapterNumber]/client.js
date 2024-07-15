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
import { Tab, TabGroup, TabList } from '@headlessui/react'

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
    return <CustomError statusCode={404} title={t('Check Deleted')} />
  }

  return (
    <div>
      <TabGroup className="mx-auto max-w-6xl">
        <TabList className="flex p-2 border rounded-t-xl bg-ming-blue border-th-secondary-300 shadow-md">
          <Tab
            className={({ selected }) =>
              selected
                ? 'w-full px-4 py-2 text-lg font-bold text-center cursor-pointer text-white rounded-t-md sm:px-9 sm:text-2xl bg-ming-blue'
                : 'w-full px-4 py-2 text-center text-blue-100 rounded-t-md hover:bg-white/[0.12] hover:text-white'
            }
          ></Tab>
        </TabList>
        {isLoading && (
          <div className="p-4 mx-auto text-center max-w-6xl">
            <Loader />
          </div>
        )}
        {!isLoading && !material?.content && (
          <div className="p-4 mx-auto text-center max-w-6xl">
            <p className="text-2xl text-red-500">{t('contentNotLoaded')}</p>
          </div>
        )}
        {!isLoading && material?.content && (
          <div className="p-4 mx-auto bg-white rounded-b-md max-w-6xl">
            <CheckInfo checkId={checkId} lng={lng} />
            {(!isCheckExpired || info?.is_owner) && chapter?.verseObjects?.length > 0 && (
              <div className="mt-4">
                {chapter?.verseObjects
                  .filter((verse) => verse.text !== '')
                  .map((verse) => (
                    <div key={verse.verse} className="p-2 my-1 border-b">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-lg font-semibold">{verse.verse}</p>
                          <p className="text-raisin-black">{verse.text}</p>
                        </div>
                        <button
                          onClick={() => toggleNoteInput(verse.verse)}
                          className="text-gray-500 hover:text-raisin-black focus:outline-none"
                        >
                          {showNoteInputs[verse.verse] ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
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
                              viewBox="0 24 24"
                              strokeWidth="1.5"
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
                          reference={{ verse: verse.verse, chapter: currentChapterIndex }}
                          toggleNoteInput={toggleNoteInput}
                        />
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </TabGroup>
      <div className="flex items-center justify-center p-4 mt-8 mb-5 space-x-14">
        <button
          onClick={() => navigateToChapter(currentChapterIndex - 1)}
          disabled={currentChapterIndex === 1}
          className={`p-2 rounded-full transition duration-300 ${
            currentChapterIndex === 1
              ? 'cursor-not-allowed bg-gray-300 text-gray-500 opacity-50'
              : 'bg-gray-600 text-white hover:bg-gray-700 hover:text-white'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
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
              ? 'cursor-not-allowed bg-gray-300 text-gray-500 opacity-50'
              : 'bg-gray-600 text-white hover:bg-gray-700 hover:text-white'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
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
