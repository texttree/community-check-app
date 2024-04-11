const PublicNotes = ({
  verse,
  index,
  editableVerseIndex,
  setNote,
  editVerse,
  addNotes,
  t,
}) => {
  return (
    <div key={index} className="bg-gray-100 p-2 rounded-md my-2">
      <p className="text-lg font-semibold">{verse.verse}</p>
      <p className="text-gray-700">{verse.text}</p>
      {editableVerseIndex === index ? (
        <div className="flex items-center">
          <textarea
            onChange={(e) => {
              setNote(e.target.value)
            }}
            className="w-full border rounded p-1"
          />
          <button
            onClick={addNotes}
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

export default PublicNotes
