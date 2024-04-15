import { fetcher } from '@/helpers/fetcher'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

const CheckInfo = ({ checkId }) => {
  const [checkName, setCheckName] = useState('')
  const [bookName, setBookName] = useState('')

  const { data: info } = useSWR(checkId && `/api/info_check/${checkId}`, fetcher)

  useEffect(() => {
    if (info) {
      setCheckName(info.check_name)
      setBookName(info.book_name)
    }
  }, [info])
  return (
    <div className="max-w-6xl mx-auto p-4">
      {checkName && bookName && (
        <h1 className="text-2xl font-bold">{`${checkName}, ${bookName}`}</h1>
      )}
    </div>
  )
}

export default CheckInfo
