import { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import axios from 'axios'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'

import toast, { Toaster } from 'react-hot-toast'

const TokenGeneration = () => {
  const { t } = useTranslation()

  const [token, setToken] = useState('')
  const [tokenName, setTokenName] = useState('')

  const { data: tokens, mutate: mutateTokens } = useSWR(`/api/tokens`, fetcher)
  const handleGenerateToken = async () => {
    if (tokenName.trim() === '') {
      toast.error(t('tokenEmpty'))
      return
    }
    try {
      const { data, error } = await axios.post('/api/tokens', {
        tokenName: tokenName.trim(),
      })

      if (error) {
        throw new Error(`Failed to store token in the database: ${error.message}`)
      }

      setToken(data)
      mutateTokens()
      toast.success(t('tokenSuccessCreated'))
    } catch (error) {
      console.error('Error generating or storing tokens:', error.message)
      toast.error(t('tokenErrorCreated'))
    }
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token)
    toast.success(t('tokenSuccessCopy'))
  }

  const handleDeleteToken = async (token_name) => {
    try {
      if (!token_name) {
        throw new Error('Token name is required')
      }

      await axios.delete('/api/tokens', {
        data: { tokenName: token_name },
      })

      mutateTokens()
      toast.success(t('tokenSuccessDeleted'))
    } catch (error) {
      console.error('Error deleting token:', error.message)
    }
  }

  const areTokensExist = tokens && tokens.length > 0

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

      {areTokensExist && (
        <div className="mt-4">
          <table className="mt-2 w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-2 border border-gray-300">{t('name')}</th>
                <th className="px-4 py-2 border border-gray-300">{t('dateCreation')}</th>
                <th className="px-4 py-2 border border-gray-300">{''}</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => {
                return (
                  <tr key={token.name} className="bg-white">
                    <td className="px-4 py-2 border border-gray-300">{token.name}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      {new Date(token.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button
                        onClick={() => handleDeleteToken(token.name)}
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
