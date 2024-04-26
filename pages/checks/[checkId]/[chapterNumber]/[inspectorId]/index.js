import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { fetcher } from '@/helpers/fetcher'
import { parseChapter } from '@/helpers/usfmHelper'
import CheckInfo from '@/components/CheckInfo'
import Loader from '@/components/Loader'
import InspectorNotes from '@/components/InspectorNotes'

const CheckInspectorDetail = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { checkId, inspectorId, chapterNumber } = router.query

  const [chapter, setChapter] = useState([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    return parseInt(chapterNumber) || 1
  })
  const [notes, setNotes] = useState([])

  const [chapterLength, setСhapterLength] = useState(0)

  const [isCheckExpired, setIsCheckExpired] = useState(false)

  const { data: info } = useSWR(checkId && `/api/info_check/${checkId}`, fetcher)
  const { data: existInspector, isLoading: isLoadingInspector } = useSWR(
    checkId && inspectorId && `/api/info_check/${checkId}/${inspectorId}`,
    fetcher
  )
  useEffect(() => {
    if (info?.check_finished_at) {
      const currentDate = new Date()
      const checkFinishedDate = new Date(info.check_finished_at)
      setIsCheckExpired(currentDate > checkFinishedDate)
    }
  }, [info])

  const {
    data: material,
    isLoading,
    mutate,
  } = useSWR(checkId && `/api/checks/${checkId}`, fetcher)

  const { data: inspectorNotes, mutate: inspectorMutate } = useSWR(
    checkId && `/api/checks/${checkId}/${inspectorId}`,
    fetcher
  )

  useEffect(() => {
    if (material?.content) {
      const chapters = material.content.chapters
      const _chapter = parseChapter(chapters[currentChapterIndex])
      setChapter(_chapter)
      setСhapterLength(Object.keys(chapters).length)
    }
  }, [material, currentChapterIndex])

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
    router.push(`/checks/${checkId}/${index}/${inspectorId}`)
  }

  const handleNextChapter = () => {
    if (currentChapterIndex < chapterLength) {
      navigateToChapter(currentChapterIndex + 1)
    }
  }

  return (
    <div className="bg-gray-200">
      {isLoading && (
        <div className="max-w-6xl mx-auto p-4 text-center">
          <Loader />
        </div>
      )}
      {!isLoading && !material && (
        <div className="max-w-6xl mx-auto p-4 text-center">
          <p className="text-2xl text-red-500">{t('contentNotLoaded')}</p>
        </div>
      )}
      {!isLoadingInspector && !existInspector && (
        <div className="max-w-6xl mx-auto p-4 text-center">
          <p className="text-2xl text-red-500">{t('inspectorDeleted')}</p>
        </div>
      )}
      {!isLoading && material && existInspector && (
        <div className="max-w-6xl mx-auto p-4">
          <CheckInfo checkId={checkId} />
          {(!isCheckExpired || info?.is_owner) && chapter.length > 0 && (
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
              {chapter
                .filter((verse) => verse.text !== '')
                .map((verse) => (
                  <div key={verse.verse} className="bg-gray-100 p-2 rounded-md my-2">
                    <p className="text-lg font-semibold">{verse.verse}</p>
                    <p className="text-gray-700">{verse.text}</p>
                    <InspectorNotes
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

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default CheckInspectorDetail
