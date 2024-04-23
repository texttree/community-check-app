import { useEffect, useState } from 'react'

import toast from 'react-hot-toast'
import axios from 'axios'

const Notes = ({ reference, materialId, checkId }) => {
  const t = (k) => k
  const [error, setError] = useState(null)
  const [note, setNote] = useState('')

  const [writeNote, setWriteNote] = useState(false)
  useEffect(() => {
    setWriteNote(false)
  }, [reference.chapter])
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
        if (res.status === 200) {
          toast.success(t('noteSaved'))
          setWriteNote(false)
          setNote('')
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
    <>
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
            className="bg-blue-500 text-white py-1 px-2 rounded  ml-2"
          >
            {t('note')}
          </button>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </>
  )
}

export default Notes
