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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative flex flex-col items-center">
        <Image src="/Paul.svg" alt="login illustration" width={500} height={500} />
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-6">
            {t('signAccount')}
          </h2>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={({ target: { value } }) => setEmail(value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Пароль</label>
              <div className="mt-1">
                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={({ target: { value } }) => setPassword(value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                disabled={loading}
              >
                {loading ? 'Загрузка...' : 'Войти'}
              </button>
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? 'Загрузка...' : 'Регистрация'}
              </button>
            </div>
          </form>
          {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}
