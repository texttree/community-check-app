const InspectorForm = ({ t, inspectorName, setInspectorName, createPersonalLink }) => (
  <div className="flex flex-col mb-6 w-full">
    <input
      type="text"
      value={inspectorName}
      onChange={(e) => setInspectorName(e.target.value)}
      placeholder={t('enterInspectorName')}
      className="border rounded-md px-3 py-2 mb-4 w-full"
    />
    <button
      onClick={createPersonalLink}
      className="self-start bg-ming-blue hover:bg-deep-space text-white font-semibold px-4 py-2 rounded-md"
    >
      {t('addPersonalLink')}
    </button>
  </div>
)

export default InspectorForm
