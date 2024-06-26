'use client'

import { useState } from 'react'
import axios from 'axios'
import useSWR from 'swr'
import { TabGroup, TabList, Tab } from '@headlessui/react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import LeftArrow from '@/public/left.svg'
import { fetcher } from '@/helpers/fetcher'
import { useTranslation } from '@/app/i18n/client'

const TokenGeneration = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')

  const [token, setToken] = useState({ name: '', token: '' })
  const [tokenName, setTokenName] = useState('')

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

  const handleDeleteToken = async (tokenName) => {
    try {
      if (!tokenName) {
        throw new Error('Token name is required')
      }

      await axios.delete('/api/tokens', {
        data: { tokenName },
      })

      mutateTokens()
      toast.success(t('tokenSuccessDeleted'))
      if (token.name === tokenName) {
        setToken({ name: '', token: '' })
      }
    } catch (error) {
      console.error('Error deleting token:', error.message)
    }
  }

  const areTokensExist = tokens && tokens.length > 0

  return (
    <div className="sm:flex justify-center items-center flex-col mt-4 px-2 sm:px-6 lg:px-8">
      <TabGroup>
        <TabList className="bg-ming-blue flex p-2 w-full border border-th-secondary-300 rounded-xl shadow-md">
          <Tab
            className={({ selected }) =>
              selected
                ? 'bg-ming-blue text-white cursor-pointer text-lg sm:text-2xl font-bold px-4 sm:px-9 py-2 rounded-md'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white px-4 py-2 rounded-md'
            }
          >
            {t('')}
          </Tab>
        </TabList>
        <div className="w-full max-w-7xl mx-auto bg-white shadow-md rounded-lg p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <Link
              href={`/${lng}/projects`}
              className="text-gray-400 hover:text-gray-500 inline-flex items-center text-sm sm:text-base"
            >
              <LeftArrow className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              {t('personalArea')}
            </Link>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('generateToken')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col sm:flex-row mb-4 w-full space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder={t('tokenName')}
                  className="border border-gray-300 px-4 py-2 rounded-md w-full text-sm sm:text-base"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                />
              </div>
              <div className="flex-shrink-0">
                <button
                  className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md text-sm sm:text-base"
                  onClick={handleGenerateToken}
                >
                  {t('generateToken')}
                </button>
              </div>
            </div>

            {token.token && (
              <div className="mb-4 w-full">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-start">
                  <input
                    type="text"
                    value={token.token}
                    className="border border-gray-300 px-4 py-2 rounded-md flex-grow w-full sm:w-auto text-sm sm:text-base"
                    readOnly
                  />
                  <button
                    className="bg-ming-blue hover:bg-deep-space text-white px-4 py-2 rounded-md text-sm sm:text-base"
                    onClick={handleCopyToken}
                  >
                    {t('copyToken')}
                  </button>
                </div>
                <div className="text-sm text-red-500 my-2 text-left sm:text-left sm:mb-0">
                  {t('tokenWarning')}
                </div>
              </div>
            )}
          </div>

          {areTokensExist && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm sm:text-base">
                <thead>
                  <tr>
                    <th className="px-2 sm:px-4 py-2 border-b-2 border-gray-200 text-left leading-4 text-gray-600">
                      {t('name')}
                    </th>
                    <th className="px-2 sm:px-4 py-2 border-b-2 border-gray-200 text-left leading-4 text-gray-600">
                      {t('dateCreation')}
                    </th>
                    <th className="px-2 sm:px-4 py-2 border-b-2 border-gray-200 text-left leading-4 text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.name}>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200">
                        {token.name}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200">
                        {new Date(token.created_at).toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 flex justify-end">
                        <button
                          onClick={() => handleDeleteToken(token.name)}
                          className="hidden sm:block bg-red-500 hover:bg-red-600 text-white px-2 py-1 sm:px-2 sm:py-1 rounded-md"
                        >
                          {t('delete')}
                        </button>
                        <Image
                          key={token.name}
                          src="/delete.svg"
                          alt="Delete Icon"
                          width={24}
                          height={24}
                          onClick={() => handleDeleteToken(token.name)}
                          className="block sm:hidden h-5 w-5 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
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
