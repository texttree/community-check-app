import axios from 'axios'

const downloadNotes = async (check, t) => {
  try {
    const responseMaterials = await axios.get(`/api/checks/${check.check_id}/notes`)
    const notes = responseMaterials.data

    if (!notes) {
      throw t('no_notes_found')
    }

    if (notes.error) {
      throw notes.error
    }

    const notesDownload = ['chapter\tverse\tnote']
    notes.forEach((line) => {
      if (line.chapter && line.verse && line.note) {
        const row = `${line.chapter}\t${line.verse}\t${line.note}`
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
