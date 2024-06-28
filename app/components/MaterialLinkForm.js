const MaterialLinkForm = ({ t, materialLink, setMaterialLink, updateContent }) => (
  <div>
    <label className="mt-6 block font-medium text-gray-700">{t('provideLink')}</label>
    <input
      type="text"
      value={materialLink}
      onChange={(e) => setMaterialLink(e.target.value)}
      placeholder={t('linkResource')}
      className="mt-1 mb-2 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-full"
    />
    <button
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block"
      onClick={updateContent}
    >
      {t('updateContent')}
    </button>
  </div>
)

export default MaterialLinkForm
