const CheckInfoForm = ({
  t,
  checkName,
  setCheckName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  updateCheckInfo,
}) => (
  <div>
    <div className="mb-4">
      <label className="block font-medium text-gray-700">{t('name')}</label>
      <input
        type="text"
        value={checkName}
        onChange={(e) => setCheckName(e.target.value)}
        className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
      />
    </div>
    <div className="mb-4">
      <label className="block font-medium text-gray-700">{t('startingDate')}</label>
      <input
        type="datetime-local"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
      />
      <label className="block font-medium text-gray-700">{t('expirationDate')}</label>
      <input
        type="datetime-local"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
      />
    </div>
    <button
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block"
      onClick={updateCheckInfo}
    >
      {t('updateInformation')}
    </button>
  </div>
)

export default CheckInfoForm
