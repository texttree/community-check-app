const CheckInfo = ({ error, checkName, bookName }) => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      {error && <p className="text-red-500">{error}</p>}
      {checkName && bookName && (
        <h1 className="text-2xl font-bold">{`${checkName}, ${bookName}`}</h1>
      )}
    </div>
  )
}

export default CheckInfo
