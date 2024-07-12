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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  if (isMobile) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-full p-4 bg-white shadow-lg rounded-lg md:ml-64 md:w-80 md:h-auto md:translate-y-0 md:shadow-none mb-8 md:mb-0 mt-8 md:mt-0">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
            {t('signAccount')}
          </h2>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                {t('email')}
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={({ target: { value } }) => setEmail(value)}
                  className="block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                {t('password')}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={({ target: { value } }) => setPassword(value)}
                  className="block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-ming-blue hover:bg-dark-slate-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4 md:mt-0"
                disabled={loading}
              >
                {t('signIn')}
              </button>
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-ming-blue bg-smoky-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mt-4 md:mt-0 md:ml-2"
                onClick={handleRegister}
                disabled={loading}
              >
                {t('register')}
              </button>
            </div>
          </form>
          {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative flex items-center justify-center">
        <Image
          src="/Paul.png"
          alt="Paul"
          width={400}
          height={400}
          className="hidden md:block absolute md:-left-32 md:top-40 md:transform md:-translate-y-2/3"
        />
        <div className="w-full p-4 bg-white shadow-lg rounded-lg md:ml-64 md:w-80 md:h-auto md:translate-y-0 md:shadow-none mb-8 md:mb-0 mt-8 md:mt-0">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
            {t('signAccount')}
          </h2>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                {t('email')}
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={({ target: { value } }) => setEmail(value)}
                  className="block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">
                {t('password')}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={({ target: { value } }) => setPassword(value)}
                  className="block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-ming-blue hover:bg-dark-slate-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4 md:mt-0"
                disabled={loading}
              >
                {t('signIn')}
              </button>
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-ming-blue bg-smoky-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mt-4 md:mt-0 md:ml-2"
                onClick={handleRegister}
                disabled={loading}
              >
                {t('register')}
              </button>
            </div>
          </form>
          {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}
