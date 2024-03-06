import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const TokenGeneration = () => {
  const [accessToken, setAccessToken] = useState('')
  const [isTokenGenerated, setIsTokenGenerated] = useState(false)
  const [errorText, setErrorText] = useState('')
  const supabase = useSupabaseClient()
  const { t } = useTranslation()

  const handleGenerateToken = async () => {
    try {
      const response = await fetch('/api/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate tokens')
      }

      const accessTokenNew = await response.json()

      const { error } = await supabase.rpc('add_token', {
        p_access_token: accessTokenNew,
      })

      if (error) {
        throw new Error(`Failed to store token in the database: ${error.message}`)
      }

      setAccessToken(accessTokenNew)
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

  const hideToken = (token) => {
    return '*'.repeat(token.length)
  }

  return (
    <div className="flex ml-32 mt-4">
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
          onClick={handleGenerateToken}
        >
          {t('generateToken')}
        </button>
        {isTokenGenerated && (
          <p className="text-green-500">Token generated successfully!</p>
        )}
        {errorText && <p className="text-red-500">{errorText}</p>}{' '}
      </div>
      <div>
        {accessToken && (
          <div className="flex mt-4">
            <input
              type="password"
              value={hideToken(accessToken)}
              className="border border-gray-300 ml-2 px-4 py-2  rounded-md"
              readOnly
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 ml-2 rounded-md"
              onClick={handleCopyToken}
            >
              {t('copyToken')}
            </button>
          </div>
        )}
      </div>
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
