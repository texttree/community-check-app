'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useTranslation } from '@/app/i18n/client'

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
  const [editNote, setEditNote] = useState(null)
  const [isEditingFormOpened, setIsEditingFormOpened] = useState(false) // show edit form
  const [isMenuOpen, setIsMenuOpen] = useState(false) // show menu

  useEffect(() => {
    setEditNote(null)
    setIsMenuOpen(false)
    setIsEditingFormOpened(false)
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

  const updateNote = () => {
    axios
      .post(`/api/checks/${checkId}/notes/${editNote.id}`, {
        note: editNote.note,
        inspectorId,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success(t('noteUpdated'))
          setEditNote(null)
          setError(null)
          setIsEditingFormOpened(false)
          setIsMenuOpen(false)
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

  const deleteNote = () => {
    axios
      .delete(`/api/checks/${checkId}/${inspectorId}`, { data: { noteId: editNote.id } })
      .then((res) => {
        if (res.status === 200) {
          toast.success(t('noteDeleted'))
          mutate()
          setEditNote(null)
          setError(null)
          setIsEditingFormOpened(false)
          setIsMenuOpen(false)
        } else {
          throw new Error(t('errorDeletingNote'))
        }
      })
      .catch((error) => {
        console.error(error)
        toast.error(error.message || t('errorOccurred'))
      })
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log(
        isMenuOpen,
        editNote,
        event.target,
        event.target.closest('.menu-container')
      )
      if (isMenuOpen && !event.target.closest('.menu-container')) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen, editNote])

  return (
    <div className="mt-5">
      <div className="pb-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-24 md:h-16 input mt-2"
          autoFocus
          placeholder={t('notePlaceholder')}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={addNote}
            disabled={!note}
            className="button-base button-primary"
          >
            {t('save')}
          </button>
        </div>
      </div>
      {Array.isArray(notes) &&
        notes.length > 0 &&
        notes.map((noteItem) => (
          <div key={noteItem.id} className="border-t pt-2">
            <div className={`flex items-start justify-between`}>
              {editNote?.id === noteItem.id && isEditingFormOpened ? (
                <div className="w-full mb-4">
                  <textarea
                    value={editNote?.note}
                    onChange={(e) =>
                      setEditNote((prev) => ({ ...prev, note: e.target.value }))
                    }
                    className="w-full h-24 md:h-16 input mt-2"
                    autoFocus
                    placeholder={t('notePlaceholder')}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => updateNote()}
                      disabled={!editNote.note}
                      className="button-base button-primary"
                    >
                      {t('save')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{noteItem.note}</p>
                  <div className="relative menu-container">
                    <button
                      onClick={() => {
                        setIsMenuOpen(true)
                        setEditNote(noteItem)
                      }}
                      className="text-gray-500 cursor-pointer focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-8 h-8 p-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                        />
                      </svg>
                    </button>

                    {editNote?.id === noteItem.id && isMenuOpen && (
                      <div className="absolute right-0 mt-1 w-max min-w-32 origin-top-right bg-white divide-y divide-gray-100 rounded-sm overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <button
                          onClick={() => {
                            // setEditNote(noteItem)
                            setIsEditingFormOpened(true)
                          }}
                          className="block w-full text-left px-2 py-1 text-sm text-raisin-black hover:bg-gray-100 hover:text-black"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => deleteNote()}
                          className="block w-full text-left px-2 py-1 text-sm text-raisin-black hover:bg-gray-100 hover:text-black"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

export default InspectorNotes
