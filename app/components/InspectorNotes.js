'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [showInput, setShowInput] = useState(true)
  const [editNoteId, setEditNoteId] = useState(null)
  const [editNoteText, setEditNoteText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    setEditNoteId(null)
    setEditNoteText('')
  }, [reference?.chapter])

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
          setIsEditing(false)
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
          toast.success(t('noteDeleted'))
          mutate()
        } else {
          throw new Error(t('errorDeletingNote'))
        }
      })
      .catch((error) => {
        console.error(error)
        toast.error(error.message || t('errorOccurred'))
      })
  }

  const handleMenuToggle = (noteId) => {
    if (editNoteId === noteId && !isEditing) {
      setIsEditing(true)
      setEditNoteId(noteId)
    } else {
      setEditNoteId(noteId)
      setEditNoteText(notes.find((note) => note.id === noteId)?.note || '')
      setIsEditing(false)
    }
  }

  const adjustTextareaHeight = (event) => {
    event.target.style.height = 'auto'
    event.target.style.height = `${Math.min(event.target.scrollHeight, 200)}px`
  }
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.classList.contains('editable-note') &&
        !event.target.closest('.editable-note')
      ) {
        setEditNoteId(null)
        setEditNoteText('')
        setIsEditing(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="mt-5">
      <div className="mb-5">
        <div>
          <label htmlFor="notes" className="font-bold text-xl">
            {t('Комментарии')}
          </label>
        </div>

        {Array.isArray(notes) &&
          notes.length > 0 &&
          notes.map((noteItem, index) => (
            <div
              key={noteItem.id}
              className={`flex items-center justify-between ${
                index !== notes.length - 1 ? 'border-b pb-2 my-2' : ''
              }`}
            >
              {editNoteId === noteItem.id && isEditing ? (
                <div className="flex w-full">
                  <textarea
                    value={editNoteText}
                    onChange={(e) => setEditNoteText(e.target.value)}
                    className="w-full border rounded p-1 overflow-hidden resize-vertical"
                    autoFocus
                    aria-label={t('editNote')}
                    onInput={adjustTextareaHeight}
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      maxHeight: '200px',
                    }}
                  />
                  <button
                    onClick={() => updateNote(noteItem.id)}
                    disabled={!editNoteText}
                    className="bg-ming-blue hover:bg-deep-space text-white h-10 py-1 px-2 rounded ml-2 my-4 disabled:opacity-50"
                  >
                    {t('save')}
                  </button>
                </div>
              ) : (
                <>
                  <p
                    className="text-raisin-black"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {noteItem.note}
                  </p>
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => handleMenuToggle(noteItem.id)}
                      className="text-gray-500 cursor-pointer focus:outline-none"
                      aria-label={t('menu')}
                    >
                      ...
                    </button>

                    {editNoteId === noteItem.id && !isEditing && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md z-10">
                        <button
                          onClick={() => {
                            setEditNoteId(noteItem.id)
                            setEditNoteText(noteItem.note)
                            setIsEditing(true)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-raisin-black hover:bg-gray-100 hover:text-black"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => deleteNoteById(noteItem.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-raisin-black hover:bg-gray-100 hover:text-black"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
      {showInput && (
        <div className="flex items-center">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded p-1 overflow-hidden resize-vertical"
            autoFocus
            aria-label={t('newNote')}
            onInput={adjustTextareaHeight}
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              minHeight: '60px',
              maxHeight: '200px',
            }}
          />
          <button
            onClick={addNote}
            disabled={!note}
            className="bg-ming-blue hover:bg-deep-space text-white py-1 px-2 rounded ml-2 disabled:opacity-50"
          >
            {t('save')}
          </button>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

export default InspectorNotes
