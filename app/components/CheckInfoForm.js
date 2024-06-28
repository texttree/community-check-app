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
    <div className="flex flex-col items-start w-full mb-4 md:mb-0 md:mr-4">
      <label htmlFor="checkName" className="font-semibold mb-1">
        {t('checkName')}
      </label>
      <input
        id="checkName"
        type="text"
        placeholder={t('checkName')}
        value={checkName}
        onChange={(e) => setCheckName(e.target.value)}
        className="border rounded-md px-3 py-2 w-full"
      />
    </div>
    <div className="flex flex-col items-start w-full mb-4 md:mb-0 md:mr-4">
      <label htmlFor="startDate" className="font-semibold mb-1">
        {t('startDate')}
      </label>
      <input
        id="startDate"
        type="datetime-local"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border rounded-md px-2 py-2 w-full"
      />
    </div>
    <div className="flex flex-col items-start w-full mb-4 md:mb-0 md:mr-4">
      <label htmlFor="endDate" className="font-semibold mb-1">
        {t('endDate')}
      </label>
      <input
        id="endDate"
        type="datetime-local"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border rounded-md px-2 py-2 w-full"
      />
    </div>
    <div className="flex flex-col items-start w-full md:mt-7 md:mr-4">
      <button
        onClick={updateCheckInfo}
        className="bg-ming-blue hover:bg-deep-space text-white font-semibold px-4 py-2 rounded-md ml-auto md:ml-0 flex items-center"
      >
        <span className="mr-2">{t('updateInformation')}</span>
      </button>
    </div>
  </div>
)

export default CheckInfoForm
