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
    <div className="mt-4">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full h-24 md:h-16 input mt-2"
        placeholder={t('notePlaceholder')}
        autoFocus
      />
      <div className="flex justify-end mt-2">
        <button onClick={addNote} disabled={!note} className="button-base button-primary">
          {t('save')}
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}

export default Notes
