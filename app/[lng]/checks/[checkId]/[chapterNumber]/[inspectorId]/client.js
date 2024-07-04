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
import { Tab, TabGroup, TabList } from '@headlessui/react'

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
  const [showNoteInputs, setShowNoteInputs] = useState({})

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

  const toggleNoteInput = (verse) => {
    setShowNoteInputs((prevState) => ({
      ...prevState,
      [verse]: !prevState[verse],
    }))
  }

  return (
    <div>
      <TabGroup className="max-w-6xl mx-auto">
        <TabList className="bg-ming-blue flex p-2 border border-th-secondary-300 rounded-t-xl shadow-md">
          <Tab
            className={({ selected }) =>
              selected
                ? 'bg-ming-blue text-white cursor-pointer text-lg sm:text-2xl font-bold px-4 sm:px-9 py-2 rounded-t-md w-full text-center'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white px-4 py-2 rounded-t-md w-full text-center'
            }
          ></Tab>
        </TabList>
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
          <div className="bg-white max-w-6xl mx-auto p-4">
            <CheckInfo checkId={checkId} lng={lng} />
            {(!isCheckExpired || info?.is_owner) && chapter?.verseObjects?.length > 0 && (
              <div className="mt-4">
                {chapter?.verseObjects
                  .filter((verse) => verse.text !== '')
                  .map((verse) => (
                    <div key={verse.verse} className="border-b p-2 my-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-lg font-semibold">{verse.verse}</p>
                          <p className="text-gray-700">{verse.text}</p>
                        </div>
                        <button
                          onClick={() => toggleNoteInput(verse.verse)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
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
                              viewBox="0 0 24 24"
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
                        <InspectorNotes
                          lng={lng}
                          checkId={checkId}
                          materialId={material.id}
                          notes={notes[verse.verse]}
                          mutate={inspectorMutate}
                          inspectorId={inspectorId}
                          reference={{ verse: verse.verse, chapter: currentChapterIndex }}
                        />
                      )}
                    </div>
                  ))}
                <div className="flex justify-center items-center mt-8 p-4 space-x-14">
                  <button
                    onClick={() => navigateToChapter(currentChapterIndex - 1)}
                    disabled={currentChapterIndex === 1}
                    className={`p-2 rounded-full transition duration-300 ${currentChapterIndex === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' : 'bg-gray-600 text-white hover:bg-gray-700 hover:text-white'}`}
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
                    {t('сhapter')} {currentChapterIndex}
                  </p>
                  <button
                    onClick={handleNextChapter}
                    disabled={currentChapterIndex === chapterLength}
                    className={`p-2 rounded-full transition duration-300 ${currentChapterIndex === chapterLength ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' : 'bg-gray-600 text-white hover:bg-gray-700 hover:text-white'}`}
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
            )}
          </div>
        )}
      </TabGroup>
    </div>
  )
}

export default CheckInspectorDetail
