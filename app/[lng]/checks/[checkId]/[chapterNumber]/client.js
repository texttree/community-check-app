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
    <div>
      <TabGroup className="max-w-6xl  mx-auto">
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
        {!isLoading && material?.content && (
          <div className="max-w-6xl mx-auto p-4">
            <CheckInfo checkId={checkId} lng={lng} />
            {(!isCheckExpired || info?.is_owner) && chapter?.verseObjects?.length > 0 && (
              <div className="mt-4">
                {chapter?.verseObjects
                  .filter((verse) => verse.text !== '')
                  .map((verse) => (
                    <div key={verse.verse} className="bg-gray-100 p-2 rounded-md my-1">
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
            <div className="flex justify-center items-center mt-8 p-4 space-x-14">
              <button
                onClick={() => navigateToChapter(currentChapterIndex - 1)}
                disabled={currentChapterIndex === 1}
                className={`p-2 rounded-full ${currentChapterIndex === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' : 'bg-gray-700 text-white'}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <p className="text-xl font-bold">
                {t('Chapter')} {currentChapterIndex}
              </p>
              <button
                onClick={handleNextChapter}
                disabled={currentChapterIndex === chapterLength}
                className={`p-2 rounded-full ${currentChapterIndex === chapterLength ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' : 'bg-gray-700 text-white'}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </TabGroup>
    </div>
  )
}

export default CheckDetail
