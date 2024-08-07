import axios from 'axios'

const downloadNotes = async (check, t, projectId, bookId) => {
  try {
    const responseMaterials = await axios.get(
      `/api/projects/${projectId}/books/${bookId}/checks/${check.id}/notes`
    )
    const notes = responseMaterials.data

    if (!notes) {
      throw t('noNotesFound')
    }

    if (notes.error) {
      throw notes.error
    }

    const notesDownload = ['chapter\tverse\tnote\tinspector_name']
    notes.forEach((line) => {
      const inspectorName = line.inspector_name ?? ''
      if (line.chapter && line.verse && line.note) {
        const row = `${line.chapter}\t${line.verse}\t${line.note}\t${inspectorName}`
        notesDownload.push(row)
      }
    })

    return notesDownload.join('\n')
  } catch (error) {
    console.error('Error downloading notes:', error)
    throw error
  }
}

export default downloadNotes
