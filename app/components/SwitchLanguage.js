'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/app/i18n/client'

import { languages } from '../i18n/settings'
import Link from 'next/link'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'

const SwitchLanguage = ({ lng }) => {
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
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          className="w-5 h-5 stroke-th-text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
          ></path>
        </svg>
        <span className="ml-3 text-sm text-gray-600">{t('language')}</span>
      </div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton
            className={`bg-gray-200 ml-8 mt-2 ${
              isOpen ? 'bg-ming-blue text-white' : 'bg-gray-200 text-gray-600'
            } active:bg-deep-space active:text-white hover:bg-deep-space hover:text-white px-2 py-1 rounded-md flex items-center`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {lng}
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
          <MenuItems className="absolute right-0 mt-2 text-sm bg-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {languages.map((language) => (
              <MenuItem key={language}>
                <Link
                  href={redirectedPathName(language)}
                  className={`${
                    redirectedPathName(language) === pathName
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700'
                  } block px-4 py-2 hover:bg-gray-100 hover:text-gray-900 rounded-md`}
                  onClick={() => setIsOpen(false)}
                >
                  {language}
                </Link>
              </MenuItem>
            ))}
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  )
}

export default SwitchLanguage
