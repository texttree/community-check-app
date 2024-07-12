'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Bar from '@/public/bar.svg'
import { useTranslation } from '@/app/i18n/client'
import SwitchLanguage from './SwitchLanguage'
import { createClient } from '@/app/supabase/client'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import toast from 'react-hot-toast'

const AppBar = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const supabaseClient = createClient()
  const [user, setUser] = useState(null)
  const router = useRouter()

  const [currentDomain, setCurrentDomain] = useState(
    'https://community-check-app.netlify.app'
  )
  const [isCheckPage, setIsCheckPage] = useState(false)
  const [isLoginPage, setIsLoginPage] = useState(false)

  useEffect(() => {
    setCurrentDomain(window.location.origin)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getUser()
        setUser(data?.user ?? null)
        if (error) {
          throw error
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      }
    }
    getUser()

    const authListener = supabaseClient.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.data.subscription.unsubscribe()
    }
  }, [supabaseClient.auth])

  useEffect(() => {
    const { pathname } = window.location
    setIsCheckPage(pathname.includes('/checks/'))
    setIsLoginPage(pathname.includes('/login'))
  }, [])

  const handleLogout = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut()
      if (error) throw error
      router.push('/' + lng + '/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-ming-blue p-4 flex justify-start items-center">
      <Menu as="div" className="relative inline-block text-left mr-4">
        <MenuButton className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-ming-blue px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-ming-blue">
          <div className="flex items-center justify-center w-7 h-7">
            <Bar />
          </div>
        </MenuButton>
        <MenuItems className="absolute mt-2 w-56 p-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {user && !isCheckPage && (
            <MenuItem as="div" className="flex items-center space-x-4 p-2">
              <div>
                <p className="text-gray-900 font-bold">{user.email}</p>
              </div>
            </MenuItem>
          )}
          <MenuItem as="div" className="my-2">
            <SwitchLanguage lng={lng} />
          </MenuItem>
          {!isCheckPage && !isLoginPage && (
            <>
              <MenuItem as="div">
                <div className="flex items-center justify-between py-1 text-center mt-2">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 stroke-th-text-primary mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                      ></path>
                    </svg>
                    <p className="text-gray-700 py-2 text-sm">{t('API')}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${currentDomain}/doc`)
                      toast.success(t('apiLinkCopied'))
                    }}
                    className="bg-gray-200 rounded-md hover:bg-deep-space hover:text-white text-gray-700 ml-4 px-2 py-1 text-xs"
                  >
                    {t('copy')}
                  </button>
                </div>
              </MenuItem>
              {user ? (
                <MenuItem as="div">
                  <div
                    className="py-1 text-center px-2 mt-2 bg-gray-200 rounded-md hover:bg-red-500 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <p className="text-gray-700 block px-4 py-2 text-sm">
                      {t('signOut')}
                    </p>
                  </div>
                </MenuItem>
              ) : (
                <MenuItem as="div">
                  <Link
                    href={`/${lng}/login`}
                    className="text-gray-700 block px-4 py-2 text-sm text-center mt-2 bg-gray-200 rounded-md hover:bg-deep-space hover:text-white"
                  >
                    {t('signIn')}
                  </Link>
                </MenuItem>
              )}
            </>
          )}
        </MenuItems>
      </Menu>
      <Link href={'/' + lng} className="text-white cursor-pointer text-2xl font-bold">
        Community Check
      </Link>
    </header>
  )
}

export default AppBar
