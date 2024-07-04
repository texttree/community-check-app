'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useTranslation } from '../i18n/client'

const Notes = ({ reference, materialId, checkId, lng, toggleNoteInput }) => {
  const { t } = useTranslation(lng, 'common')
  const [error, setError] = useState(null)
  const [note, setNote] = useState('')

  const addNote = () => {
    if (!note) {
      toast.error(t('errorEmptyNote'))
      return
    }
    axios
      .post(`/api/checks/${checkId}/notes`, {
        materialId,
        note,
        ...reference,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success(t('noteSaved'))
          setNote('')
          setError(null)
          toggleNoteInput(reference.verse)
        } else {
          throw new Error(t('errorSavingNote'))
        }
      })
      .catch((error) => {
        console.error(error)
        setError(error.message)
      })
  }

  return (
    <div className="relative">
      <div className="flex items-center mt-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border rounded p-1"
          autoFocus
        />
      </div>
      <div className="flex justify-end mt-2">
        <button
          onClick={addNote}
          disabled={!note}
          className="bg-ming-blue text-white py-1 px-2 rounded disabled:opacity-50"
        >
          {t('save')}
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}

export default Notes
