'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/app/i18n/client'
import { createClient } from '@/app/supabase/client'
import axios from 'axios'

export default function FormComponent({ lng, redirectedFrom }) {
  const supabaseClient = createClient()
  const router = useRouter()
  const { t } = useTranslation(lng, 'common')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setError(null)
      router.push(redirectedFrom ?? '/' + lng + '/projects')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post('/api/register', { email, password })
      const { error } = response.data

      if (error) {
        throw error
      }

      setError(null)
      router.push('/' + lng + '/projects')
    } catch (error) {
      console.error({ error })
      setError(error?.response?.data?.error?.message ?? 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="relative flex items-center justify-center m-4">
        <Image
          src="/Paul.png"
          alt="Paul"
          width={512}
          height={499}
          className="hidden md:block"
        />
        <div className="w-full p-8 min-w-80 bg-white shadow-lg rounded-lg md:w-96 md:-ml-8">
          <h2 className="text-2xl font-bold mb-4">{t('signIn')}</h2>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-normal text-raisin-black">
                {t('email')}
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={({ target: { value } }) => setEmail(value)}
                  className="block w-full bg-neutral-100 p-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:border-neutral-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-normal text-raisin-black">
                {t('password')}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  value={password}
                  onChange={({ target: { value } }) => setPassword(value)}
                  className="block w-full bg-neutral-100 p-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-row justify-between space-x-2">
              <button
                type="submit"
                className="w-full button-primary button-base mt-4 md:mt-0"
                disabled={loading}
              >
                {t('signIn')}
              </button>
              <button
                type="button"
                className="w-full button-secondary button-base mt-4 md:mt-0 md:ml-2"
                onClick={handleRegister}
                disabled={loading}
              >
                {t('register')}
              </button>
            </div>
          </form>
          {error && <p className="mt-6 text-center text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}
