import { useState } from 'react'
import { useTranslation } from 'next-i18next'

const ChapterContent = ({
  verse,
  index,
  editableVerseIndex,
  notes,
  editVerse,
  uploadNotes,
}) => {
  const { t } = useTranslation()
  const [note, setNote] = useState('')

  return (
    <div className="bg-gray-100 p-2 rounded-md my-2">
      <p className="text-lg font-semibold">{verse.verse}</p>
      <p className="text-gray-700">{verse.text}</p>
      {editableVerseIndex === index ? (
        <div className="flex items-center">
          <textarea
            value={
              editableVerseIndex !== null
                ? notes.find(
                    (note) => note?.verse === (editableVerseIndex + 1).toString()
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
  )
}

export default ChapterContent
