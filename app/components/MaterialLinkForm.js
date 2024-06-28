const MaterialLinkForm = ({ t, materialLink, setMaterialLink, updateContent }) => (
  <div className="mb-6">
    <input
      type="text"
      value={materialLink}
      onChange={(e) => setMaterialLink(e.target.value)}
      placeholder={t('enterMaterialLink')}
      className="border rounded-md px-3 py-2 w-full mb-4"
    />
    <button
      onClick={updateContent}
      className="bg-ming-blue hover:bg-deep-space text-white font-semibold px-4 py-2 rounded-md"
    >
      {t('updateContent')}
    </button>
  </div>
)

export default MaterialLinkForm
