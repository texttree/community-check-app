'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import toast from 'react-hot-toast'
import axios from 'axios' // Импортируем Axios

import { fetcher } from '@/helpers/fetcher'
import { formatDate } from '@/helpers/formatDate'

import downloadNotes from '@/helpers/downloadNotes'
import Download from '@/public/download.svg'

import Loader from '@/app/components/Loader'
import { useTranslation } from '@/app/i18n/client'
import DeleteModal from '@/app/components/DeleteModal'

const CheckList = ({ projectId, bookId, lng }) => {
  const { t } = useTranslation(lng, 'common')

  const [notesCounts, setNotesCounts] = useState({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [checkToDelete, setCheckToDelete] = useState(null)

  const { data: checks, error } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}/checks`,
    fetcher
  )

  const { data: info, mutate: mutateInfo } = useSWR(
    bookId && `/api/projects/${projectId}/books/${bookId}/info`,
    fetcher
  )
  useEffect(() => {
    if (info) {
      const counts = info.reduce((acc, item) => {
        acc[item.check_id] = item.notes_count
        return acc
      }, {})
      setNotesCounts(counts)
    } else {
      mutateInfo()
    }
  }, [info, mutateInfo])

  const handleDownloadNotes = (check) => {
    downloadNotes(check, t, projectId, bookId)
      .then((notes) => {
        const blob = new Blob([notes])
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `${check.name}.tsv`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => {
        const message = `${t('errorDownloadNotes')} ${error}`
        toast.error(message)
      })
  }

  const openDeleteModal = (check) => {
    setCheckToDelete(check)
    setShowDeleteModal(true)
  }

  const confirmDeleteCheck = async () => {
    if (checkToDelete) {
      try {
        const response = await axios.delete(
          `/api/projects/${projectId}/books/${bookId}/checks/${checkToDelete.id}` // Используем Axios для DELETE запроса
        )

        if (!response.data) {
          throw new Error(t('errorDeletingCheck'))
        }

        toast.success(t('checkDeleted'))
        mutate(`/api/projects/${projectId}/books/${bookId}/checks`) // Обновляем данные после удаления
        mutateInfo()
      } catch (error) {
        toast.error(t('errorOccurred'))
      }
    }
    setShowDeleteModal(false)
  }

  const cancelDeleteCheck = () => {
    setShowDeleteModal(false)
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
                <tr key={check.id}>
                  <td className="border p-2 text-center">
                    <Link
                      href={`/${lng}/projects/${projectId}/${bookId}/${check.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {check.name}
                    </Link>
                  </td>
                  <td className="border p-2 text-center">
                    {formatDate(check.started_at)}
                  </td>
                  <td className="border p-2 text-center">
                    {formatDate(check.finished_at)}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDownloadNotes(check)}
                      disabled={
                        notesCounts[check.id] === undefined || notesCounts[check.id] === 0
                      }
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-5 w-5 mr-1" />
                    </button>
                  </td>
                  <td className="border p-2 text-center">{notesCounts[check.id] || 0}</td>
                  <td className="border p-2 text-center">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => openDeleteModal(check)}
                    >
                      {t('delete')}
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

      {showDeleteModal && (
        <DeleteModal
          lng={lng}
          isVisible={showDeleteModal}
          message={t('confirmDeleteCheck')}
          onConfirm={confirmDeleteCheck}
          onCancel={cancelDeleteCheck}
        />
      )}
    </>
  )
}

export default CheckList
