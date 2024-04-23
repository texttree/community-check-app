'use client'

import { usePathname } from 'next/navigation'
import { languages } from '../app/i18n/settings'
import Link from 'next/link'

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
        <Link
          key={language}
          href={redirectedPathName(language)}
          className={`${
            lng === language ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          } hover:bg-blue-600 hover:text-white px-2 py-1 rounded-md`}
        >
          {language}
        </Link>
      ))}
    </div>
  )
}

export default SwitchLanguage
