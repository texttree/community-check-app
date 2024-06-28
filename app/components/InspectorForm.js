const InspectorForm = ({ t, inspectorName, setInspectorName, createPersonalLink }) => (
  <div className="my-2 mt-6">
    <label className="block font-medium text-gray-700">{t('nameInspector')}</label>
    <input
      type="text"
      value={inspectorName}
      onChange={(e) => setInspectorName(e.target.value)}
      className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
    />
    <button
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 my-2 rounded-md"
      onClick={createPersonalLink}
    >
      {t('addPersonalLink')}
    </button>
  </div>
)

export default InspectorForm
