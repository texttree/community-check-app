const downloadNotes = async (check) => {
  try {
    const responseMaterials = await fetch(`/api/checks/${check.id}/notes`)
    const notes = await responseMaterials.json()

    const notesDownload = ['chapter\tverse\tnote']
    notes.forEach((not) => {
      const { chapter, verse, note } = not
      const row = `${chapter}\t${verse}\t${note}`
      notesDownload.push(row)
    })

    const tsvContent = notesDownload.join('\n')

    const blob = new Blob([tsvContent])

    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${check.name}.tsv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return notesDownload
  } catch (error) {
    console.error('Ошибка при загрузке заметок:', error)
    throw error
  }
}

export default downloadNotes
