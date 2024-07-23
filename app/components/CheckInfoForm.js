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
  <div className="flex flex-col md:flex-row items-end gap-0 md:gap-4">
    <div className="flex flex-col items-start w-full mb-4 md:mb-0">
      <label htmlFor="checkName" className="font-medium mb-1">
        {t('checkName')}
      </label>
      <input
        id="checkName"
        type="text"
        placeholder={t('checkName')}
        value={checkName}
        onChange={(e) => setCheckName(e.target.value)}
        className="input w-full"
      />
    </div>
    <div className="flex flex-col items-start w-full mb-4 md:mb-0">
      <label htmlFor="startDate" className="font-medium mb-1">
        {t('dateStartCheck')}
      </label>
      <input
        id="startDate"
        type="datetime-local"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="input w-full"
      />
    </div>
    <div className="flex flex-col items-start w-full mb-4 md:mb-0">
      <label htmlFor="endDate" className="font-medium mb-1">
        {t('dateFinishCheck')}
      </label>
      <input
        id="endDate"
        type="datetime-local"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="input w-full"
      />
    </div>
    <div className="w-full">
      <button onClick={updateCheckInfo} className="button-base button-primary">
        {t('updateInformation')}
      </button>
    </div>
  </div>
)

export default CheckInfoForm
