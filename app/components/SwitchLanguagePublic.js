'use client'

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { languages } from '@/app/i18n/settings'

function SwitchLanguagePublic({ lng }) {
  const { t } = useTranslation(lng, 'common')
  const [isOpen, setIsOpen] = useState(false)
  const pathName = usePathname()

  const redirectedPathName = (locale) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }
  return (
    <div className={`flex items-center justify-between`}>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton
            className={`ml-8 ${
              isOpen ? 'bg-ghost-white' : 'bg-smoky-white'
            }  hover:bg-ghost-white text-ming-blue px-2 py-1 rounded-md flex items-center`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={`inline-block mr-2`}>{lng}</span>
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            )}
          </MenuButton>
        </div>
        <Transition
          show={isOpen}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 mt-2 text-sm bg-platinum-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
            {languages.map((language) => (
              <MenuItem key={language}>
                <Link
                  href={redirectedPathName(language)}
                  className="bg-platinum-white hover:bg-bright-gray text-raisin-black block px-4 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t(language)}
                </Link>
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  )
}

export default SwitchLanguagePublic
