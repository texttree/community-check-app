'use client'

import { useTranslation } from '@/app/i18n/client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { createToken } from '../lib/actions'
import ButtonCreateToken from './ButtonCreateToken'

function TokenCreate({ lng }) {
  const [tokenName, setTokenName] = useState('')
  const [token, setToken] = useState({ name: '', token: '' })
  const { t } = useTranslation(lng, 'common')

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token.token)
    toast.success(t('tokenSuccessCopy'))
  }
  return (
    <div className="gap-4 p-4">
      <form
        className="flex flex-col items-start sm:items-center sm:flex-row mb-4 w-full space-y-2 sm:space-y-0 sm:space-x-2"
        action={async (formdata) => {
          const { success, token: tokenData } = await createToken(formdata)
          if (success) {
            setToken({ name: tokenName.trim(), token: tokenData.id })
            setTokenName('')
            toast.success(t('tokenSuccessCreated'))
          } else {
            toast.error(t('tokenErrorCreated'))
          }
        }}
      >
        <input
          type="text"
          placeholder={t('tokenName')}
          className="w-full sm:w-auto sm:flex-grow input"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          name={'tokenName'}
        />
        <ButtonCreateToken lng={lng} />
      </form>

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
              <button className="button-primary button-base" onClick={handleCopyToken}>
                {t('copyToken')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TokenCreate
