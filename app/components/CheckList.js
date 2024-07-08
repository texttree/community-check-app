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
import Image from 'next/image'

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
        acc[item.check_name] = item.notes_count
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
          `/api/projects/${projectId}/books/${bookId}/checks/${checkToDelete.id}`
        )

        if (!response.data) {
          throw new Error(t('errorDeletingCheck'))
        }

        toast.success(t('checkDeleted'))
        mutate(`/api/projects/${projectId}/books/${bookId}/checks`)
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
      {error ? (
        <p className="text-red-600">{t('errorOccurred')}</p>
      ) : checks !== undefined ? (
        <div className="bg-white p-4 rounded-lg shadow-md mt-2 overflow-x-auto">
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
                      className="text-ming-blue hover:underline"
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
                        notesCounts[check.name] === undefined ||
                        notesCounts[check.name] === 0
                      }
                      className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Download className="h-5 w-5 mr-1" />
                    </button>
                  </td>
                  <td className="border p-2 text-center">
                    {notesCounts[check.name] || 0}
                  </td>

                  <td className="border p-2 text-center">
                    <button
                      className="hidden sm:block bg-red-500 hover:bg-red-600 text-white px-2 py-1 sm:px-2 sm:py-1 rounded-md"
                      onClick={() => openDeleteModal(check)}
                    >
                      {t('delete')}
                    </button>
                    <Image
                      key={check.id}
                      src="/delete.svg"
                      alt="Delete Icon"
                      width={24}
                      height={24}
                      onClick={() => openDeleteModal(check)}
                      className="block sm:hidden h-5 w-5 cursor-pointer"
                    />
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
