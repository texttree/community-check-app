import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import useSWR from 'swr'
import axios from 'axios'

import { fetcher } from '@/helpers/fetcher'
import { formatDate } from '@/helpers/formatDate'

import downloadNotes from '@/helpers/downloadNotes'
import Download from 'public/download.svg'

import toast from 'react-hot-toast'
import Loader from './Loader'
import DeleteModal from './DeleteModal'

const CheckList = ({ projectId, bookId }) => {
  const { t } = useTranslation()
  const [notesCounts, setNotesCounts] = useState({})
  const [checkToDelete, setCheckToDelete] = useState(null)
  const [confirmationText, setConfirmationText] = useState('')

  const {
    data: checks,
    error,
    mutate,
  } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}/checks`,
    fetcher
  )

  const { data: info } = useSWR(bookId && `/api/info_check/books/${bookId}`, fetcher)

  useEffect(() => {
    if (info) {
      const counts = {}
      info.forEach((item) => {
        counts[item.check_id] = item.notes_count
      })
      setNotesCounts(counts)
    }
  }, [info])

  const handleDownloadNotes = (check) => {
    downloadNotes(check, t)
      .then((notes) => {
        const blob = new Blob([notes])

        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `${check.check_name}.tsv`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => {
        const message = t('errorDownloadNotes') + ' ' + error
        toast.error(message)
      })
  }

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/projects/${projectId}/books/${bookId}/checks`, {
        data: { checkId: checkToDelete },
      })
      mutate()
      setCheckToDelete(null)
      setConfirmationText('')
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteCheck = (checkId) => {
    setCheckToDelete(checkId)
    setConfirmationText(t('confirmDeleteCheck'))
  }

  const handleCancelDelete = () => {
    setCheckToDelete(null)
    setConfirmationText('')
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-2">{t('bookChecks')}</h2>
      {error ? (
        <p className="text-red-600">{t('errorOccurred')}</p>
      ) : checks !== undefined ? (
        <div className="bg-white p-4 rounded-lg shadow-md mt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-center">{t('titleInTable')}</th>
                <th className="border p-2 text-center">{t('checkStartDate')}</th>
                <th className="border p-2 text-center">{t('checkEndDate')}</th>
                <th className="border p-2 text-center">{t('downloadNotes')}</th>
                <th className="border p-2 text-center">{t('activity')}</th>
                <th className="border p-2 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => (
                <tr key={check.check_id}>
                  <td className="border p-2 text-center">
                    <Link
                      href={`/projects/${projectId}/${bookId}/${check.check_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {check.check_name}
                    </Link>
                  </td>
                  <td className="border p-2 text-center">
                    {formatDate(check.check_started_time)}
                  </td>
                  <td className="border p-2 text-center">
                    {formatDate(check.check_finished_time)}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDownloadNotes(check)}
                      disabled={
                        notesCounts[check.check_id] === undefined ||
                        notesCounts[check.check_id] === 0
                      }
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-5 w-5 mr-1" />
                    </button>
                  </td>
                  <td className="border p-2 text-center">
                    {notesCounts[check.check_id] || 0}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDeleteCheck(check.check_id)}
                      className="bg-white hover:text-red-700 text-red-500 px-4 py-2 rounded-md"
                    >
                      {t('deleteCheck')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Loader />
      )}
      {checkToDelete && (
        <DeleteModal
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          confirmationText={confirmationText}
        />
      )}
    </>
  )
}
export default CheckList
