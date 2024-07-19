'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR, { mutate } from 'swr'
import toast from 'react-hot-toast'
import axios from 'axios'

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
        <div className="overflow-x-auto">
          <table className="min-w-full border-t sm:border-t-0 bg-white text-sm mb-8">
            <thead>
              <tr className="border-b text-left">
                <th className="pl-4 py-2 pr-2 sm:pr-4 sm:py-4">{t('titleCheck')}</th>
                <th className="p-2 sm:p-4">{t('checkStartDate')}</th>
                <th className="p-2 sm:p-4">{t('checkEndDate')}</th>
                <th className="p-2 sm:p-4">{t('downloadNotes')}</th>
                <th className="p-2 sm:p-4">{t('activity')}</th>
                <th className="pr-4 py-2 pl-2 sm:pl-4 sm:py-4"></th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => (
                <tr key={check.id} className="border-b sm:hover:bg-ming-blue/10">
                  <td className="pl-4 py-2 pr-2 sm:pr-4 sm:py-4 border-r sm:border-r-0">
                    <Link
                      href={`/${lng}/projects/${projectId}/${bookId}/${check.id}`}
                      className="link-cell"
                    >
                      {check.name}
                    </Link>
                  </td>
                  <td className="p-2 sm:p-4 border-r sm:border-r-0">
                    <span className="text-cell">{formatDate(check.started_at)}</span>
                  </td>
                  <td className="p-2 sm:p-4 border-r sm:border-r-0">
                    <span className="text-cell">{formatDate(check.finished_at)}</span>
                  </td>
                  <td className="p-2 sm:p-4 border-r sm:border-r-0">
                    <button
                      onClick={() => handleDownloadNotes(check)}
                      disabled={
                        notesCounts[check.name] === undefined ||
                        notesCounts[check.name] === 0
                      }
                      className="disabled:opacity-50 disabled:cursor-not-allowed h-5 w-5 p-1"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="p-2 sm:p-4 border-r sm:border-r-0">
                    <span className="text-cell">{notesCounts[check.name] || 0}</span>
                  </td>

                  <td className="pr-4 py-2 pl-2 sm:pl-4 sm:py-4 flex justify-center sm:justify-end">
                    <div
                      onClick={() => openDeleteModal(check)}
                      className="text-red-500 bg-bright-gray px-2 py-1 rounded-md text-sm font-normal focus:outline-none cursor-pointer sm:bg-red-500 sm:hover:bg-red-600 sm:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="block sm:hidden h-4 w-4 cursor-pointer"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      <span className="hidden sm:block">{t('delete')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Loader
          className="flex flex-col gap-4 p-4"
          line={['h-5 w-full', 'h-5 w-full', 'h-5 w-full']}
        />
      )}
      <DeleteModal
        lng={lng}
        isOpen={showDeleteModal}
        message={t('confirmDeleteCheck')}
        onConfirm={confirmDeleteCheck}
        onCancel={cancelDeleteCheck}
        expectedText={checkToDelete?.name}
        requireTextMatch={true}
      />
    </>
  )
}

export default CheckList
