import React, { useState, useEffect, useRef } from 'react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import SwitchLanguage from './SwitchLanguage'
import Bar from 'public/bar.svg'

const AppBar = () => {
  const { t } = useTranslation()
  const user = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-blue-500 p-4 flex justify-between items-center rounded-t-lg">
      <Link href={'/'} className="text-white cursor-pointer text-2xl font-bold">
        Community Check
      </Link>

      <div className="relative inline-block text-left">
        <div>
          <button
            className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(true)}
          >
            <Bar className="h-7 w-7" />
          </button>
        </div>
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-56 p-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <SwitchLanguage />
            {user ? (
              <div
                className="py-1 text-center px-2 mt-2 bg-gray-200 rounded-md hover:bg-red-500"
                onClick={handleLogout}
              >
                <a href="#" className="text-gray-700 block px-4 py-2 text-sm">
                  {t('signOut')}
                </a>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  )
}

export default AppBar
