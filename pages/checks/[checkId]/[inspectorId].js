import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { fetcher } from '@/helpers/fetcher'

import { parseChapter } from '@/helpers/usfmHelper'
import Notes from '@/components/Notes'

const CheckDetail = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { checkId, inspectorId } = router.query
  const [chapter, setChapter] = useState([])
  const { data: material } = useSWR(checkId && `/api/checks/${checkId}`, fetcher)
  const { data: inspectorNotes, mutate } = useSWR(
    checkId && `/api/checks/${checkId}/${inspectorId}`,
    fetcher
  )
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
      const filteredNotes = {}
      inspectorNotes?.forEach((note) => {
        if (note.chapter === currentChapterIndex.toString()) {
          filteredNotes[note.verse] = note
        }
      })
      const notesArray = Object.values(filteredNotes)

      setNotes(notesArray)
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
    if (!chapter || !verse || !materialId) {
      console.error(t('invalidInformationNote'))
      return
    }
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
        toast.success(error)
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
              <Notes
                key={index}
                verse={verse}
                index={index}
                editableVerseIndex={editableVerseIndex}
                notes={notes}
                editVerse={editVerse}
                uploadNotes={uploadNotes}
              />
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
