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
    <div className="w-full">
      <div className="overflow-hidden rounded-lg">
        <div className="bg-ming-blue p-3.5 w-full"></div>
        <div className="bg-white">
          <div className="p-4 flex justify-start space-x-1 sm:space-x-4 mb-2 border-b">
            <Link
              href={`/${lng}/projects`}
              className="text-gray-400 hover:text-gray-500 inline-flex items-center text-sm"
            >
              <LeftArrow className="h-4 w-4 mr-1" />
              <span className="hidden sm:block">{t('projects')}</span>
            </Link>
            <h2 className="text-base sm:text-lg font-bold pl-0 sm:pl-3 border-0 sm:border-l">
              {t('tokens')}
            </h2>
          </div>
          <div className="gap-4 p-4">
            <div className="flex flex-col items-start sm:items-center sm:flex-row mb-4 w-full space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                placeholder={t('tokenName')}
                className="w-full sm:w-auto sm:flex-grow input"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
              />
              <button
                className="button-primary button-base"
                onClick={handleGenerateToken}
              >
                {t('generateToken')}
              </button>
            </div>

            {token.token && (
              <>
                <div className="text-sm text-red-500 my-2 text-left sm:text-left sm:mb-2">
                  {t('tokenWarning')}
                </div>
                <div className="mb-4 w-full">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-start">
                    <input
                      type="text"
                      value={token.token}
                      className="input sm:flex-grow w-full sm:w-auto"
                      readOnly
                    />
                    <button
                      className="button-primary button-base"
                      onClick={handleCopyToken}
                    >
                      {t('copyToken')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {areTokensExist && (
            <div className="overflow-x-auto">
              <table className="min-w-full border-t sm:border-t-0 bg-white text-sm mb-20">
                <thead>
                  <tr className=" border-b text-left">
                    <th className="p-2 sm:p-4">{t('name')}</th>
                    <th className="hidden md:table-cell p-4">{t('dateCreation')}</th>
                    <th className="p-2 sm:p-4 w-10 sm:w-auto"></th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.name} className="border-b sm:hover:bg-ming-blue/10">
                      <td className="p-2 sm:p-4 border-r sm:border-r-0">{token.name}</td>
                      <td className="hidden md:table-cell p-4">
                        {new Date(token.created_at).toLocaleString()}
                      </td>
                      <td className="p-2 sm:p-4 border-r sm:border-r-0 flex justify-center sm:justify-end">
                        <div
                          onClick={() => handleDeleteToken(token.name)}
                          className="text-red-500 bg-bright-gray px-2 py-1 rounded-md text-sm font-medium focus:outline-none cursor-pointer sm:bg-red-500 sm:hover:bg-red-600 sm:text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            onClick={() => handleDeleteToken(token.name)}
                            className="block sm:hidden h-4 w-4 cursor-pointer"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>

                          <span className="hidden sm:block">{t('delete')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TokenGeneration
