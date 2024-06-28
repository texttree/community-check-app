const InspectorForm = ({ t, inspectorName, setInspectorName, createPersonalLink }) => (
  <div className="flex items-center mb-6">
    <input
      type="text"
      value={inspectorName}
      onChange={(e) => setInspectorName(e.target.value)}
      placeholder={t('enterInspectorName')}
      className="border rounded-md px-3 py-2 mr-4 w-full md:w-auto"
    />
    <button
      onClick={createPersonalLink}
      className="bg-ming-blue hover:bg-deep-space text-white font-semibold px-4 py-2 rounded-md"
    >
      {t('addPersonalLink')}
    </button>
  </div>
)

export default InspectorForm
