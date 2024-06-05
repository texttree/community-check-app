import { Toaster } from 'react-hot-toast'
import { dir } from 'i18next'

import AppBar from '@/app/components/AppBar'
import { languages } from '@/app/i18n/settings'

import '@/styles/globals.css'

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export const metadata = {
  title: 'Community Check',
  description: 'Application for Community Checking',
}

export default function RootLayout({ children, params: { lng } }) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <body>
        <div>
          <div className="w-full">
            <AppBar lng={lng} />
          </div>
          <main>
            <div className="pt-5 px-5 lg:px-8 mt-14 sm:mt-auto">{children}</div>
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
