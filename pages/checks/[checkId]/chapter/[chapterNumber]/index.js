import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { fetcher } from '@/helpers/fetcher'
import { parseChapter } from '@/helpers/usfmHelper'

const CheckDetail = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { checkId, chapterNumber } = router.query

  const [chapter, setChapter] = useState([])
  const [editableVerseIndex, setEditableVerseIndex] = useState(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    return parseInt(chapterNumber) || 1
  })
  const [note, setNote] = useState('')
  const [error, setError] = useState(null)
  const [chapterLength, setChapterLength] = useState(0)

  const { data: material, mutate } = useSWR(checkId && `/api/checks/${checkId}`, fetcher)

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
  }, [checkId])

  const editVerse = (index) => {
    setEditableVerseIndex(index)
  }

  const navigateToChapter = (index) => {
    router.push(`/checks/${checkId}/chapter/${index}`)
  }

  const addNotes = () => {
    const chapterNum = currentChapterIndex
    const verse = editableVerseIndex + 1
    const materialId = material.id
    axios
      .post(`/api/checks/${checkId}/notes`, {
        materialId,
        note,
        chapter: chapterNum,
        verse,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success(t('noteSaved'))
          mutate()
        } else {
          throw new Error(t('errorSavingNote'))
        }
      })
      .catch((error) => {
        console.error(error)
        setError(error.message)
      })
  }

  const handleNextChapter = () => {
    if (currentChapterIndex < chapterLength) {
      navigateToChapter(currentChapterIndex + 1)
    }
  }

  return (
    <div className="bg-gray-200">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold">{t('checkDetails')}</h1>
        {error && <p className="text-red-500">{error}</p>}
        {chapter.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between mb-4">
              <button
                onClick={() => navigateToChapter(currentChapterIndex - 1)}
                className={`bg-blue-500 text-white py-2 px-4 rounded ${
                  currentChapterIndex === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {t('previousChapter')}
              </button>

              <button
                onClick={handleNextChapter}
                className={`bg-blue-500 text-white py-2 px-4 rounded ${
                  currentChapterIndex === chapterLength
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {t('nextChapter')}
              </button>
            </div>
            {chapter.map((verse, index) => (
              <div key={index} className="bg-gray-100 p-2 rounded-md my-2">
                <p className="text-lg font-semibold">{verse.verse}</p>
                <p className="text-gray-700">{verse.text}</p>
                {editableVerseIndex === index ? (
                  <div className="flex items-center">
                    <textarea
                      onChange={(e) => {
                        setNote(e.target.value)
                      }}
                      className="w-full border rounded p-1"
                    />
                    <button
                      onClick={addNotes}
                      className="bg-blue-500 text-white py-1 px-2 rounded ml-2"
                    >
                      {t('save')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => editVerse(index)}
                      className="bg-blue-500 text-white py-1 px-2 rounded  ml-2"
                    >
                      {t('note')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Toaster />
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
