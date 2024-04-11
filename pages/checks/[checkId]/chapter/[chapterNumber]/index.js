import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
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
  const [editableVerseIndex, setEditableVerseIndex] = useState(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    return parseInt(chapterNumber) || 1
  })
  const [note, setNote] = useState('')
  const [error, setError] = useState(null)

  const [chapterLength, setChapterLength] = useState(0)
  const [checkName, setCheckName] = useState('')
  const [bookName, setBookName] = useState('')

  const {
    data: material,
    isLoading,
    mutate,
  } = useSWR(checkId && `/api/checks/${checkId}`, fetcher)

  const { data: info } = useSWR(checkId && `/api/info_check/${checkId}`, fetcher)

  useEffect(() => {
    if (info) {
      setCheckName(info.check_name)
      setBookName(info.book_name)
    }
  }, [info])

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

  const editVerse = (index) => {
    setEditableVerseIndex(index)
  }

  const navigateToChapter = (index) => {
    router.push(`/checks/${checkId}/chapter/${index}`)
  }

  const addNotes = (index) => {
    const verse = index + 1
    const materialId = material.id
    axios
      .post(`/api/checks/${checkId}/notes`, {
        materialId,
        note,
        chapter: currentChapterIndex,
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
          <CheckInfo error={error} checkName={checkName} bookName={bookName} />
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
                <Notes
                  key={index}
                  verse={verse}
                  index={index}
                  editableVerseIndex={editableVerseIndex}
                  setNote={setNote}
                  addNotes={addNotes}
                  editVerse={editVerse}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      )}
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
