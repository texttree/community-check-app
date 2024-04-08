import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import toast, { Toaster } from 'react-hot-toast'

const TokenGeneration = () => {
  const supabase = useSupabaseClient()
  const { t } = useTranslation()

  const [token, setToken] = useState('')
  const [tokens, setTokens] = useState([])
  const [tokenName, setTokenName] = useState('')

  useEffect(() => {
    fetchTokens()
  }, [])

  const handleGenerateToken = async () => {
    if (tokenName.trim() === '') {
      toast.error(t('tokenErrorEmpty'))
      return
    }
    try {
      const { data, error } = await supabase.rpc('add_token', { p_name: tokenName })

      if (error) {
        throw new Error(`Failed to store token in the database: ${error.message}`)
      }

      setToken(data)
      fetchTokens()

      toast.success(t('tokenSuccessCreated'))
    } catch (error) {
      console.error('Error generating or storing tokens:', error.message)
      toast.error(t('tokenErrorCreated'))
    }
  }

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase.rpc('get_tokens')

      if (error) {
        throw new Error(`Failed to fetch tokens: ${error.message}`)
      }

      setTokens(data)
    } catch (error) {
      console.error('Error fetching tokens:', error.message)
    }
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token)
  }

  const handleDeleteToken = async (token_id) => {
    try {
      const { error } = await supabase.rpc('delete_token', { token_id })

      if (error) {
        throw new Error(`Failed to delete token: ${error.message}`)
      }

      fetchTokens()
      toast.success('Token deleted successfully!')
    } catch (error) {
      console.error('Error deleting token:', error.message)
    }
  }

  return (
    <div className="flex justify-center items-center flex-col mt-4">
      <Toaster />
      <div className="flex items-center">
        <input
          type="text"
          placeholder={t('tokenName')}
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

      {token && (
        <div className="flex mt-4 items-center">
          <input
            type="text"
            value={token}
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

      {tokens.length > 0 && (
        <div className="mt-4">
          <table className="mt-2 w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-2 border border-gray-300">{t('name')}</th>
                <th className="px-4 py-2 border border-gray-300">{t('token')}</th>
                <th className="px-4 py-2 border border-gray-300">{t('dateCreation')}</th>
                <th className="px-4 py-2 border border-gray-300">{''}</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => {
                const id = token.id
                const visibleChars = 4
                const hiddenChars = id.length - visibleChars * 2
                const hiddenPart = hiddenChars > 0 ? '.'.repeat(hiddenChars) : ''
                const maskedId =
                  id.substring(0, visibleChars) +
                  hiddenPart +
                  id.substring(id.length - visibleChars)

                return (
                  <tr key={token.id} className="bg-white">
                    <td className="px-4 py-2 border border-gray-300">{token.name}</td>
                    <td className="px-4 py-2 border border-gray-300">{maskedId}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      {new Date(token.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button
                        onClick={() => handleDeleteToken(token.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
