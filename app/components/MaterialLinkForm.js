import { useState } from 'react'

const MaterialLinkForm = ({ t, materialLink, setMaterialLink, updateContent }) => {
  const [loading, setLoading] = useState(false)
  return (
    <div className="w-full flex flex-col mb-4 md:mb-0">
      <label htmlFor="materialLink" className="font-medium mb-1">
        {t('materialLink')}
      </label>
      <input
        id="materialLink"
        type="text"
        value={materialLink}
        onChange={(e) => setMaterialLink(e.target.value)}
        placeholder={t('materialLinkPlaceholder')}
        className="input mb-4"
      />
      <button
        onClick={async () => {
          setLoading(true)
          try {
            await updateContent()
          } catch (error) {
            console.error(error)
          } finally {
            setLoading(false)
          }
        }}
        disabled={loading}
        className="self-start button-base button-primary disabled:animate-pulse"
      >
        {t('updateContent')}
      </button>
    </div>
  )
}
export default MaterialLinkForm
