'use client'

import { useEffect, useState } from 'react'

import useSWR from 'swr'

import { fetcher } from '@/helpers/fetcher'
import { useTranslation } from '@/app/i18n/client'

const CheckInfo = ({ checkId, lng }) => {
  const { t } = useTranslation(lng, 'common')
  const [checkName, setCheckName] = useState('')
  const [bookName, setBookName] = useState('')
  const [isCheckExpired, setIsCheckExpired] = useState(false)
  const [error, setError] = useState(null)

  const { data: info } = useSWR(checkId && `/api/info_check/${checkId}`, fetcher)

  useEffect(() => {
    if (info) {
      setCheckName(info.check_name)
      setBookName(info.book_name)
    }
  }, [info])

  useEffect(() => {
    if (info?.check_finished_at) {
      const currentDate = new Date()
      const checkFinishedDate = new Date(info.check_finished_at)
      setIsCheckExpired(currentDate > checkFinishedDate)

      if (isCheckExpired) {
        setError(t('checkExpiredMessage'))
      } else {
        setError(null)
      }
    }
  }, [info, isCheckExpired, t])

  return (
    <div className="max-w-6xl mx-auto p-4">
      {error && <p className="text-red-500">{error}</p>}
      {checkName && bookName && (
        <h1 className="text-2xl font-bold">{`${checkName}, ${bookName}`}</h1>
      )}
    </div>
  )
}

export default CheckInfo
