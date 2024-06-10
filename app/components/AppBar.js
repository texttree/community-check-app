'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Bar from '@/public/bar.svg'
import { useTranslation } from '@/app/i18n/client'
import SwitchLanguage from './SwitchLanguage'
import { createClient } from '@/app/supabase/client'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const AppBar = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const supabaseClient = createClient()
  const [user, setUser] = useState(null)
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getUser()
        setUser(data?.user ?? null)
        if (error) {
          throw error
        }
      } catch (error) {
        setUser(null)
      }
    }
    getUser()
  }, [supabaseClient.auth])

  const router = useRouter()

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
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <Bar className="h-7 w-7" />
        </MenuButton>
        <MenuItems className="absolute mt-2 w-56 p-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <MenuItem>
            <SwitchLanguage lng={lng} className="hover:bg-blue-500" />
          </MenuItem>
          {user ? (
            <MenuItem>
              <div
                className="py-1 text-center px-2 mt-2 bg-gray-200 rounded-md hover:bg-red-500"
                onClick={handleLogout}
              >
                <a href="#" className="text-gray-700 block px-4 py-2 text-sm">
                  {t('signOut')}
                </a>
              </div>
            </MenuItem>
          ) : (
            <MenuItem>
              <Link
                href={`/${lng}/login`}
                className="text-gray-700 block px-4 py-2 text-sm text-center mt-2 bg-gray-200 rounded-md hover:bg-deep-space hover:text-white"
              >
                {t('signIn')}
              </Link>
            </MenuItem>
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
