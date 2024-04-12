const Notes = ({
  verse,
  index,
  editableVerseIndex,
  notes,
  setNotes,
  setNote,
  uploadNotes,
  editVerse,
  addNotes,
  t,
}) => {
  const isInspector = typeof notes !== 'undefined'
  const currentNotes = isInspector ? notes[index] : null

  return (
    <div className="bg-gray-100 p-2 rounded-md my-2">
      <p className="text-lg font-semibold">{verse.verse}</p>
      <p className="text-gray-700">{verse.text}</p>
      {editableVerseIndex === index ? (
        <div className="flex items-center">
          <textarea
            value={currentNotes || undefined}
            onChange={(e) => {
              if (isInspector) {
                const newNotes = [...notes]
                newNotes[index] = e.target.value
                setNotes(newNotes)
              }
              setNote(e.target.value)
            }}
            className="w-full border rounded p-1"
          />
          <button
            onClick={isInspector ? uploadNotes : addNotes}
            className="bg-blue-500 text-white py-1 px-2 rounded ml-2"
          >
            {t('save')}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            onClick={() => editVerse(index)}
            className="bg-blue-500 text-white py-1 px-2 rounded  ml-2"
          >
            {t('note')}
          </button>
        </div>
      )}
    </div>
  )
}

export default Notes
