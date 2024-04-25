'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { useTranslation } from '@/app/i18n/client'
import { createClient } from '@/app/supabase/client'

export default function FormComponent({ lng }) {
  const supabase = createClient()
  const router = useRouter()
  const redirectedFrom = useSearchParams().get('redirectedFrom')
  const { t } = useTranslation(lng, 'common')
  const [email, setEmail] = useState('fox@mail.com')
  const [error, setError] = useState(false)
  const [password, setPassword] = useState('123456')
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setError(false)
      router.push('/login')
    } catch (error) {
      setError(error.message)
    }
  }
  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setError(false)
      router.push(redirectedFrom ?? '/' + lng + '/projects')
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 mb-4 tracking-tight text-gray-900">
            {t('signAccount')}
          </h2>
        </div>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {t('email')}
            </label>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={({ target: { value } }) => setEmail(value)}
              className="block w-full rounded-md px-2 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                {t('password')}
              </label>
            </div>
            <div className="mt-2">
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={({ target: { value } }) => setPassword(value)}
                className="block w-full px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </form>
        <br />
        <p>{error}</p>
        <button
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleLogin}
        >
          {t('signIn')}
        </button>
        <Link
          className="flex mt-6 w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          href={`/${lng}/register`}
        >
          {t('register')}
        </Link>
      </div>
    </div>
  )
}
