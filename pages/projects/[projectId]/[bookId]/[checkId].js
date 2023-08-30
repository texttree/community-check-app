import React, { useState } from 'react'
import { useRouter } from 'next/router'
import FileViewer from '@/components/FileViewer'
const CheckId = () => {
  const router = useRouter()
  const { projectId, bookId } = router.query

  const [checkType, setCheckType] = useState('')
  const [hasMaterial, setHasMaterial] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [materialLink, setMaterialLink] = useState('')
  const [hasLink, setHasLink] = useState(false)

  const handleGoBack = () => {
    router.push(`/projects/${projectId}/${bookId}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <div>
      <button onClick={handleGoBack}>Назад</button>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Название:</label>
          <input
            type="text"
            value={checkType}
            onChange={(e) => setCheckType(e.target.value)}
          />
          <button>Загрузить материал</button>
          <input
            type="checkbox"
            checked={hasMaterial}
            onChange={(e) => setHasMaterial(e.target.checked)}
          />
          <label>tit.usfm?</label>
          <input
            type="checkbox"
            checked={hasLink}
            onChange={(e) => setHasLink(e.target.checked)}
          />
        </div>
        <div>
          <label>Дата окончания:</label>
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <label>Укажите ссылку на материал:</label>
          <input
            type="text"
            value={materialLink}
            onChange={(e) => setMaterialLink(e.target.value)}
          />
        </div>
        <button>Сохранить</button>
      </form>
      <FileViewer></FileViewer>
    </div>
  )
}

export default CheckId
