const InspectorForm = ({ t, inspectorName, setInspectorName, createPersonalLink }) => (
  <div className="flex flex-col w-full">
    <label htmlFor="inspectorName" className="font-medium mb-1">
      {t('inspectorName')}
    </label>
    <input
      id="inspectorName"
      type="text"
      value={inspectorName}
      onChange={(e) => setInspectorName(e.target.value)}
      placeholder={t('enterInspectorName')}
      className="input mb-4"
    />
    <button
      onClick={createPersonalLink}
      className="self-start button-base button-primary"
    >
      {t('addPersonalLink')}
    </button>
  </div>
)

export default InspectorForm
