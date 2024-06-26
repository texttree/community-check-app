'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useTranslation } from '../i18n/client'

const InspectorNotes = ({
  reference,
  materialId,
  checkId,
  notes = [],
  mutate,
  inspectorId,
  lng,
}) => {
  const { t } = useTranslation(lng, 'common')
  const [error, setError] = useState(null)
  const [note, setNote] = useState('')
  const [writeNote, setWriteNote] = useState(false)
  const [editNoteId, setEditNoteId] = useState(null)
  const [editNoteText, setEditNoteText] = useState('')

  useEffect(() => {
    setWriteNote(false)
    setEditNoteId(null)
  }, [reference.chapter])

  const addNote = () => {
    axios
      .post(`/api/checks/${checkId}/notes`, {
        materialId,
        inspectorId,
        note,
        ...reference,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success(t('noteSaved'))
          setWriteNote(false)
          setNote('')
          setError(null)
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

  const updateNote = (noteId) => {
    axios
      .put(`/api/checks/${checkId}/notes`, {
        noteId,
        note: editNoteText,
        inspectorId,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success(t('noteUpdated'))
          setEditNoteId(null)
          setEditNoteText('')
          setError(null)
          mutate()
        } else {
          throw new Error(t('errorUpdatingNote'))
        }
      })
      .catch((error) => {
        console.error(error)
        setError(error.message)
      })
  }

  const deleteNoteById = (noteId) => {
    axios
      .delete(`/api/checks/${checkId}/${inspectorId}`, { data: { noteId } })
      .then((res) => {
        if (res.status === 200) {
          mutate()
          toast.success(t('noteDeleted'))
        } else {
          throw res
        }
      })
      .catch((error) => {
        toast.error(error.message || t('errorOccurred'))
        console.error(error)
      })
  }

  return (
    <>
      {notes?.length
        ? notes.map((note) => (
            <div key={note.id} className="flex items-center justify-between">
              {editNoteId === note.id ? (
                <textarea
                  value={editNoteText}
                  onChange={(e) => setEditNoteText(e.target.value)}
                  className="w-full border rounded p-1"
                  autoFocus
                />
              ) : (
                <p className="text-gray-700">{note.note}</p>
              )}
              <div className="flex items-center">
                {editNoteId === note.id ? (
                  <button
                    onClick={() => updateNote(note.id)}
                    disabled={!editNoteText}
                    className="bg-blue-500 text-white py-1 px-2 rounded ml-2 disabled:opacity-50"
                  >
                    {t('save')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditNoteId(note.id)
                        setEditNoteText(note.note)
                      }}
                      className="text-orange-500"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => deleteNoteById(note.id)}
                      className="text-red-500 ml-2"
                    >
                      {t('delete')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        : ''}
      {writeNote ? (
        <div className="flex items-center">
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
            }}
            className="w-full border rounded p-1"
            autoFocus
          />
          <button
            onClick={addNote}
            disabled={!note}
            className="bg-blue-500 text-white py-1 px-2 rounded ml-2 disabled:opacity-50"
          >
            {t('save')}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWriteNote(true)}
            className="bg-blue-500 text-white py-1 px-2 rounded ml-2"
          >
            {t('note')}
          </button>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </>
  )
}

export default InspectorNotes
