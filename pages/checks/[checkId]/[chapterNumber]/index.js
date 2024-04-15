import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { fetcher } from '@/helpers/fetcher'
import { parseChapter } from '@/helpers/usfmHelper'
import CheckInfo from '@/components/CheckInfo'
import Loader from '@/components/Loader'
import Notes from '@/components/Notes'

const CheckDetail = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { checkId, chapterNumber } = router.query

  const [chapter, setChapter] = useState([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    return parseInt(chapterNumber) || 1
  })

  const [chapterLength, setChapterLength] = useState(0)

  const {
    data: material,
    isLoading,
    mutate,
  } = useSWR(checkId && `/api/checks/${checkId}`, fetcher)

  useEffect(() => {
    if (material?.content) {
      const chapters = material.content.chapters
      const _chapter = parseChapter(chapters[currentChapterIndex])
      setChapter(_chapter)
      setChapterLength(Object.keys(chapters).length)
    }
  }, [material, currentChapterIndex])

  useEffect(() => {
    setCurrentChapterIndex((prevIndex) => parseInt(chapterNumber) || prevIndex)
  }, [chapterNumber])

  useEffect(() => {
    if (checkId) {
      mutate()
    }
  }, [checkId, mutate])

  const navigateToChapter = (index) => {
    router.push(`/checks/${checkId}/${index}`)
    toast.success(t('noteSaved'))
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
      {!isLoading && material && (
        <div className="max-w-6xl mx-auto p-4">
          <CheckInfo checkId={checkId} />
          {chapter.length > 0 && (
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
                    <Notes
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

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default CheckDetail
