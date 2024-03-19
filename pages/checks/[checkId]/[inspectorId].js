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
  const { checkId, inspectorId } = router.query
  const [chapter, setChapter] = useState([])
  const { data: material, error } = useSWR(checkId && `/api/checks/${checkId}`, fetcher)
  const {
    data: inspectorNotes,
    error: err,
    mutate,
  } = useSWR(checkId && `/api/checks/${checkId}/${inspectorId}`, fetcher)
  const [editableVerseIndex, setEditableVerseIndex] = useState(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(1)
  const [notes, setNotes] = useState(new Array(chapter.length).fill(''))
  const [arrayLength, setArrayLength] = useState('')
  const [note, setNote] = useState('')
  useEffect(() => {
    if (material?.content) {
      const chapters = material.content.chapters
      const numberChapters = Object.keys(chapters)
      const _chapter = parseChapter(chapters[currentChapterIndex])
      setChapter(_chapter)
      setArrayLength(numberChapters.length)
      const notesChapter = inspectorNotes?.filter(
        (note) => note.chapter == currentChapterIndex.toString()
      )
      setNotes(notesChapter)
    }
  }, [material, currentChapterIndex, inspectorId, inspectorNotes])
  const editVerse = (index) => {
    setEditableVerseIndex(index)
  }
  const previousChapter = () => {
    if (currentChapterIndex > 1) {
      setCurrentChapterIndex(currentChapterIndex - 1)
    }
  }
  const nextChapter = () => {
    if (currentChapterIndex < arrayLength) {
      setCurrentChapterIndex(currentChapterIndex + 1)
    }
  }

  const uploadNotes = () => {
    const chapter = currentChapterIndex
    const verse = editableVerseIndex + 1
    const materialId = material.id
    axios
      .post(`/api/checks/${checkId}/notes`, {
        materialId,
        note,
        chapter,
        verse,
        inspectorId,
      })
      .then((res) => {
        if (res.status === 200) {
          mutate()
          toast.success(t('noteSaved'))
        } else {
          throw res
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }
  return (
    <div className="bg-gray-200">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold">{t('checkDetails')}</h1>
        {chapter && chapter.length && (
          <div className="mt-4">
            <div className="flex justify-between mb-4">
              <button
                onClick={previousChapter}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                {t('previousChapter')}
              </button>
              <p className="text-2xl font-bold">{currentChapterIndex.toString()}</p>
              <button
                onClick={nextChapter}
                className="bg-blue-500 text-white py-2 px-4 rounded"
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
                      value={
                        editableVerseIndex !== null
                          ? notes.find(
                              (note) =>
                                note?.verse === (editableVerseIndex + 1).toString()
                            )?.note || ''
                          : ''
                      }
                      onChange={(e) => {
                        const newNotes = [...notes]
                        newNotes[editableVerseIndex] = {
                          verse: (editableVerseIndex + 1).toString(),
                          note: e.target.value,
                        }
                        setNotes(newNotes)
                        setNote(e.target.value)
                      }}
                      className="w-full border rounded p-1"
                    />
                    <button
                      onClick={uploadNotes}
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
