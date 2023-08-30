import { useState } from 'react'

function FileViewer() {
  const [fileUrl, setFileUrl] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [error, setError] = useState('')

  const handleLoadButtonClick = async () => {
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error('Ошибка при загрузке файла')
      }
      const text = await response.text()
      setFileContent(text)
      setError('')
    } catch (err) {
      setError(err.message)
      setFileContent('')
    }
  }

  return (
    <div>
      <input
        type="text"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        placeholder="Введите URL файла"
      />
      <button onClick={handleLoadButtonClick}>Загрузить файл</button>
      {error && <p>{error}</p>}
      <div>{fileContent}</div>
    </div>
  )
}

export default FileViewer
