import axios from 'axios'

const downloadNotes = async (check) => {
  return await axios.get(`/api/checks/${check.id}/notes`).then((responseMaterials) => {
    const notes = responseMaterials.data
    if (notes.error) {
      throw error
    }
    const notesDownload = ['chapter\tverse\tnote']
    notes.forEach((line) => {
      const { chapter, verse, note } = line
      const row = `${chapter}\t${verse}\t${note}`
      notesDownload.push(row)
    })
    return notesDownload.join('\n')
  })
}

export default downloadNotes
