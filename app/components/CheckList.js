'use client'

import Link from 'next/link'

import { useState, useEffect } from 'react'

import useSWR from 'swr'

import { fetcher } from '@/helpers/fetcher'
import { formatDate } from '@/helpers/formatDate'

import downloadNotes from '@/helpers/downloadNotes'
import Download from '@/public/download.svg'

import toast from 'react-hot-toast'
import Loader from '@/app/components/Loader'
import { useTranslation } from '../i18n/client'

const CheckList = ({ projectId, bookId, lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [notesCounts, setNotesCounts] = useState({})

  const { data: checks, error } = useSWR(
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
        link.download = `${check.name}.tsv`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => {
        const message = t('errorDownloadNotes') + ' ' + error
        toast.error(message)
      })
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Loader />
      )}
    </>
  )
}
export default CheckList
