import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import axios from 'axios'
import { fetcher } from '@/helpers/fetcher'

import { parseChapter } from '@/helpers/usfmHelper'

const CheckDetail = () => {
  const router = useRouter()
  const { checkId } = router.query
  const [chapter, setChapter] = useState('')
  const { data: material, error } = useSWR(checkId && `/api/checks/${checkId}`, fetcher)
  const [editableVerseIndex, setEditableVerseIndex] = useState(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(1)
  const [notes, setNotes] = useState(new Array(chapter.length).fill(''))
  const [arrayLenght, setArrayLenght] = useState('')
  const [testNotes, setTestNotes] = useState('')

  useEffect(() => {
    if (material?.content) {
      const chapters = material.content.chapters
      const numberChapters = Object.keys(chapters)
      const _chapter = parseChapter(chapters[currentChapterIndex])
      setChapter(_chapter)
      setArrayLenght(numberChapters.length)
    }
  }, [material, currentChapterIndex])
  const editVerse = (index) => {
    setEditableVerseIndex(index)
  }

  const saveNotes = (index) => {
    setEditableVerseIndex(null)
  }
  const PreviousChapter = () => {
    if (currentChapterIndex > 1) {
      setCurrentChapterIndex(currentChapterIndex - 1)
    }
  }
  const nextChapter = () => {
    if (currentChapterIndex < arrayLenght) {
      setCurrentChapterIndex(currentChapterIndex + 1)
    }
  }

  const uploadNotes = () => {
    const note = testNotes
    const chapter = currentChapterIndex
    const verse = editableVerseIndex + 1
    const materialId = material.id
    const deleted_at = material.deleted_at
    axios
      .post(`/api/checks/${checkId}/notes`, {
        materialId,
        note,
        chapter,
        verse,
        deleted_at,
      })
      .then((res) => {
        if (res.status === 200) {
          console.log('uploadTrue')
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
        <h1 className="text-2xl font-bold">Детали проверки</h1>
        {chapter && (
          <div className="mt-4">
            <div className="flex justify-between mb-4">
              <button
                onClick={PreviousChapter}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Предыдущая глава
              </button>
              <p className="text-2xl font-bold">{currentChapterIndex.toString()}</p>
              <button
                onClick={nextChapter}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Следующая глава
              </button>
            </div>
            {chapter.map((verse, index) => (
              <div key={index} className="bg-gray-100 p-2 rounded-md my-2">
                <p className="text-lg font-semibold">{verse.verse}</p>
                <p className="text-gray-700">{verse.text}</p>
                {editableVerseIndex === index ? (
                  <div className="flex items-center">
                    <textarea
                      value={notes[index]}
                      onChange={(e) => {
                        const newNotes = [...notes]
                        newNotes[index] = e.target.value
                        setNotes(newNotes)
                        setTestNotes(e.target.value)
                      }}
                      className="w-full border rounded p-1"
                    />
                    <button
                      onClick={uploadNotes}
                      className="bg-blue-500 text-white py-1 px-2 rounded ml-2"
                    >
                      Сохранить
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => editVerse(index)}
                      className="bg-blue-500 text-white py-1 px-2 rounded  ml-2"
                    >
                      комментарий
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckDetail
