'use client'

import DeleteModal from '@/app/components/DeleteModal'
import Loader from '@/app/components/Loader'
import { useTranslation } from '@/app/i18n/client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { deleteToken } from '../actions/deleteToken'

function TokenList({ isLoading, tokens, lng }) {
  const { t } = useTranslation(lng, 'common')
  const [token, setToken] = useState({ name: '', token: '' })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletedTokenName, setDeletedTokenName] = useState('')

  const handleDeleteToken = async (tokenName) => {
    try {
      if (!tokenName) {
        throw new Error('Token name is required')
      }

      const response = await deleteToken(tokenName)
      if (response.error) {
        throw new Error(response.error)
      }
      toast.success(t('tokenSuccessDeleted'))
      if (token.name === tokenName) {
        setToken({ name: '', token: '' })
      }
    } catch (error) {
      console.error('Error deleting token:', error.message)
      toast.error(t('tokenErrorDeleted'))
    }
  }

  return (
    <>
      {isLoading ? (
        <Loader
          className="flex flex-col gap-4 pb-4 px-4"
          line={['h-5 w-full', 'h-5 w-full', 'h-5 w-full']}
        />
      ) : tokens && tokens.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-t sm:border-t-0 bg-white text-sm mb-8">
            <thead>
              <tr className="border-b text-left">
                <th className="pl-4 py-2 pr-2 sm:pr-4 sm:py-4">{t('name')}</th>
                <th className="hidden md:table-cell p-4">{t('dateCreation')}</th>
                <th className="pr-4 py-2 pl-2 sm:pl-4 sm:py-4 w-10 sm:w-auto"></th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.name} className="border-b sm:hover:bg-ming-blue/10">
                  <td className="pl-4 py-2 pr-2 sm:pr-4 sm:py-4 border-r sm:border-r-0">
                    <span className="text-cell">{token.name}</span>
                  </td>
                  <td className="hidden md:table-cell p-4">
                    <span className="text-cell">
                      {new Date(token.created_at).toLocaleString()}
                    </span>
                  </td>
                  <td className="pr-4 py-2 pl-2 sm:pl-4 sm:py-4 flex justify-center sm:justify-end">
                    <div
                      onClick={() => {
                        setShowDeleteModal(true)
                        setDeletedTokenName(token.name)
                      }}
                      className="text-red-500 bg-bright-gray px-2 py-1 rounded-md text-sm font-normal focus:outline-none cursor-pointer sm:bg-red-500 sm:hover:bg-red-600 sm:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
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
      ) : (
        <p className="py-6 px-4">{t('noTokens')}</p>
      )}
      <DeleteModal
        lng={lng}
        isOpen={showDeleteModal}
        message={`${t('confirmDeleteToken', { name: deletedTokenName })}`}
        onConfirm={() => {
          handleDeleteToken(deletedTokenName)
          setShowDeleteModal(false)
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  )
}

export default TokenList
