'use client'

import { useState } from 'react'

import axios from 'axios'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'
import { useTranslation } from '@/app/i18n/client'

import toast from 'react-hot-toast'

import LeftArrow from '@/public/left.svg'
import Link from 'next/link'
import { TabGroup, TabList, Tab } from '@headlessui/react'

const TokenGeneration = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')

  const [token, setToken] = useState({ name: '', token: '' })
  const [tokenName, setTokenName] = useState('')
  const [showWarning, setShowWarning] = useState(false)

  const { data: tokens, mutate: mutateTokens } = useSWR(`/api/tokens`, fetcher)
  const handleGenerateToken = async () => {
    if (tokenName.trim() === '') {
      toast.error(t('tokenEmpty'))
      return
    }
    try {
      const { data: token, error } = await axios.post('/api/tokens', {
        tokenName: tokenName.trim(),
      })

      if (error) {
        throw new Error(`Failed to store token in the database: ${error.message}`)
      }

      setToken({ name: tokenName.trim(), token })
      setShowWarning(true)
      mutateTokens()
      toast.success(t('tokenSuccessCreated'))
    } catch (error) {
      console.error('Error generating or storing tokens:', error.message)
      toast.error(t('tokenErrorCreated'))
    }
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token.token)
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
      if (token.name === token_name) {
        setToken({ name: '', token: '' })
      }
    } catch (error) {
      console.error('Error deleting token:', error.message)
    }
  }

  const areTokensExist = tokens && tokens.length > 0

  return (
    <div className="flex justify-center items-center flex-col mt-4">
      <TabGroup>
        <TabList className="bg-ming-blue flex p-2 w-full border border-th-secondary-300 rounded-xl shadow-md">
          <Tab
            className={({ selected }) =>
              selected
                ? 'bg-ming-blue text-white cursor-pointer text-2xl font-bold px-9 py-2 rounded-md'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white px-4 py-2 rounded-md'
            }
          >
            {t('')}
          </Tab>
        </TabList>
        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Link
              href={`/${lng}/projects`}
              className="text-gray-400 hover:text-gray-500 inline-flex items-center"
            >
              <LeftArrow className="h-5 w-5 mr-1" />
              {t('personalArea')}
            </Link>
          </div>
          <h2 className="text-2xl font-bold mb-4">{t('generateToken')}</h2>

          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder={t('tokenName')}
              className="border border-gray-300 px-4 py-2 rounded-md mr-2 flex-grow"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
            />
            <button
              className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
              onClick={handleGenerateToken}
            >
              {t('generateToken')}
            </button>
          </div>

          {token.token && (
            <>
              <div className="flex items-center mb-4">
                <input
                  type="text"
                  value={token.token}
                  className="border border-gray-300 px-4 py-2 rounded-md mr-2 flex-grow"
                  readOnly
                />
                <button
                  className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md"
                  onClick={handleCopyToken}
                >
                  {t('copyToken')}
                </button>
              </div>
              {showWarning && (
                <div className="text-sm text-red-500 mb-4">
                  После обновления страницы токен будет недоступен. Пожалуйста, скопируйте
                  токен.
                </div>
              )}
            </>
          )}

          {areTokensExist && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs leading-4 text-gray-600">
                      {t('name')}
                    </th>
                    <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs leading-4 text-gray-600">
                      {t('dateCreation')}
                    </th>
                    <th className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs leading-4 text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => {
                    return (
                      <tr key={token.name}>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {token.name}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
                          {new Date(token.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border-b border-gray-200">
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
      </TabGroup>
    </div>
  )
}

export default TokenGeneration
