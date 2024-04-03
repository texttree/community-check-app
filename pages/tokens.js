import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const TokenGeneration = () => {
  const [accessToken, setAccessToken] = useState('')
  const [tokenName, setTokenName] = useState('')
  const [isTokenGenerated, setIsTokenGenerated] = useState(false)
  const [errorText, setErrorText] = useState('')
  const supabase = useSupabaseClient()
  const { t } = useTranslation()

  const handleGenerateToken = async () => {
    try {
      const { data, error } = await supabase.rpc('add_token', { name: tokenName })

      if (error) {
        throw new Error(`Failed to store token in the database: ${error.message}`)
      }

      setAccessToken(data)
      setIsTokenGenerated(true)
      setErrorText('')
    } catch (error) {
      console.error('Error generating or storing tokens:', error.message)
      setIsTokenGenerated(false)
      setErrorText('Failed to generate or store tokens')
    }
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(accessToken)
  }

  return (
    <div className="flex justify-center items-center flex-col mt-4">
      <div className="flex items-center">
        <input
          type="text"
          placeholder={t('tokenNamePlaceholder')}
          className="border border-gray-300 px-4 py-2 rounded-md mr-2"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={handleGenerateToken}
        >
          {t('generateToken')}
        </button>
      </div>
      {isTokenGenerated && (
        <p className="text-green-500 mt-2">{t('tokenGeneratedSuccessfully')}</p>
      )}
      {errorText && <p className="text-red-500 mt-2">{errorText}</p>}{' '}
      {accessToken && (
        <div className="flex mt-4 items-center">
          <input
            type="text"
            value={accessToken}
            className="border border-gray-300 px-8 py-2 rounded-md mr-2 w-96"
            readOnly
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={handleCopyToken}
          >
            {t('copyToken')}
          </button>
        </div>
      )}
    </div>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default TokenGeneration
