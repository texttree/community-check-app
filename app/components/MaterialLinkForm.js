const MaterialLinkForm = ({ t, materialLink, setMaterialLink, updateContent }) => (
  <div className="mb-6 w-full flex flex-col">
    <input
      type="text"
      value={materialLink}
      onChange={(e) => setMaterialLink(e.target.value)}
      placeholder={t('enterMaterialLink')}
      className="border rounded-md px-3 py-2 mb-4"
    />
    <button
      onClick={updateContent}
      className="self-start bg-ming-blue hover:bg-deep-space text-white font-semibold px-4 py-2 rounded-md"
    >
      {t('updateContent')}
    </button>
  </div>
)

export default MaterialLinkForm
