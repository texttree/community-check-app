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
  <div className="flex flex-col md:flex-row items-center mb-6">
    <input
      type="text"
      placeholder={t('checkName')}
      value={checkName}
      onChange={(e) => setCheckName(e.target.value)}
      className="border rounded-md px-3 py-2 mb-4 md:mb-0 md:mr-4 w-full md:w-auto"
    />
    <input
      type="datetime-local"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="border rounded-md px-3 py-2 mb-4 md:mb-0 md:mr-4 w-full md:w-auto"
    />
    <input
      type="datetime-local"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="border rounded-md px-3 py-2 mb-4 md:mb-0 md:mr-4 w-full md:w-auto"
    />
    <button
      onClick={updateCheckInfo}
      className="bg-ming-blue hover:bg-deep-space text-white font-semibold px-4 py-2 rounded-md"
    >
      {t('updateInformation')}
    </button>
  </div>
)

export default CheckInfoForm
