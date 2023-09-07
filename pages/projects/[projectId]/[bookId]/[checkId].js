import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { ChevronLeft } from 'feather-icons-react'
import Link from 'next/link'

const CheckId = () => {
  const router = useRouter()
  const { projectId, bookId } = router.query

  const [checkType, setCheckType] = useState('')
  const [hasMaterial, setHasMaterial] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [materialLink, setMaterialLink] = useState('')
  const [hasLink, setHasLink] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4">
        <Link href={`/projects/${projectId}/${bookId}`}>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center">
            <ChevronLeft size={18} />
            Назад
          </button>
        </Link>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium text-gray-700">Название:</label>
            <input
              type="text"
              value={checkType}
              onChange={(e) => setCheckType(e.target.value)}
              className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
            />
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-block mt-2">
              Загрузить материал
            </button>
            <input
              type="checkbox"
              checked={hasMaterial}
              onChange={(e) => setHasMaterial(e.target.checked)}
              className="ml-2"
            />
            <label className="ml-1">tit.usfm?</label>
            <input
              type="checkbox"
              checked={hasLink}
              onChange={(e) => setHasLink(e.target.checked)}
              className="ml-2"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium text-gray-700">Дата окончания:</label>
            <input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
            />
            <label className="block font-medium text-gray-700 mt-2">
              Укажите ссылку на материал:
            </label>
            <input
              type="text"
              value={materialLink}
              onChange={(e) => setMaterialLink(e.target.value)}
              className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
            />
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block">
            Создать книгу
          </button>
        </form>
      </div>
    </div>
  )
}

export default CheckId
