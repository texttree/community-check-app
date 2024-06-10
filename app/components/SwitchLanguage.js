'use client'

import { usePathname } from 'next/navigation'
import { languages } from '../i18n/settings'
import Link from 'next/link'
import { MenuItem } from '@headlessui/react'

const SwitchLanguage = ({ lng }) => {
  const pathName = usePathname()
  const redirectedPathName = (locale) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }
  return (
    <div className="flex items-center justify-center space-x-2">
      {languages.map((language) => (
        <MenuItem key={language}>
          <Link
            href={redirectedPathName(language)}
            className={`${
              lng === language ? 'bg-ming-blue text-white' : 'bg-gray-200 text-gray-600'
            } active:bg-deep-space active:text-white hover:bg-deep-space hover:text-white px-2 py-1 rounded-md`}
          >
            {language}
          </Link>
        </MenuItem>
      ))}
    </div>
  )
}

export default SwitchLanguage
