'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
  const pathname = usePathname()

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

    const authListener = supabaseClient.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.data.subscription.unsubscribe()
    }
  }, [supabaseClient.auth])

  useEffect(() => {
    setIsCheckPage(pathname.includes('/checks/'))
    setIsLoginPage(pathname.includes('/login'))
  }, [pathname])

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
    <header className="flex justify-start items-center relative z-10 max-w-6xl mx-auto">
      <Menu as="div" className="relative inline-block text-left mr-2">
        <MenuButton className="inline-flex items-center justify-center gap-x-1.5 bg-transparent px-3 py-1 text-sm font-semibold text-white">
          <div className="flex items-center justify-center w-7 h-7">
            <Bar />
          </div>
        </MenuButton>
        <MenuItems className="absolute mt-2 p-4 origin-top-right min-w-24 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
          {user && !isCheckPage && (
            <MenuItem
              as="div"
              className="flex items-center space-x-4 p-2 border-b border-b-bright-gray"
            >
              <div>
                <p className="text-raisin-black font-bold">{user.email}</p>
              </div>
            </MenuItem>
          )}
          <MenuItem as="div" className="mb-2">
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
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5 stroke-th-text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>

                    <p className="text-raisin-black py-2 ml-3 text-sm">{t('API')}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${currentDomain}/doc`)
                      toast.success(t('apiLinkCopied'))
                    }}
                    className="bg-smoky-white hover:bg-ghost-white text-ming-blue ml-4 px-2 py-1 rounded-md"
                  >
                    {t('copy')}
                  </button>
                </div>
              </MenuItem>
              {user ? (
                <MenuItem as="div">
                  {({ close }) => (
                    <div
                      className="text-raisin-black hover:text-white block px-4 py-2 rounded-md text-sm text-center mt-6 bg-bright-gray hover:bg-deep-space font-bold cursor-pointer"
                      onClick={() => {
                        handleLogout()
                        close()
                      }}
                    >
                      {t('signOut')}
                    </div>
                  )}
                </MenuItem>
              ) : (
                <MenuItem as="div">
                  {({ close }) => (
                    <Link
                      href={`/${lng}/login`}
                      onClick={close}
                      className="text-raisin-black hover:text-white block px-4 py-2 rounded-md text-sm text-center mt-6 bg-bright-gray hover:bg-deep-space font-bold cursor-pointer"
                    >
                      {t('signIn')}
                    </Link>
                  )}
                </MenuItem>
              )}
            </>
          )}
        </MenuItems>
      </Menu>
      <Link
        href={'/' + lng}
        className="text-white cursor-pointer text-xl font-[600] font-montserrat"
      >
        Community Check
      </Link>
    </header>
  )
}

export default AppBar
