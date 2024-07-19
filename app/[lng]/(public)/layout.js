import { Toaster } from 'react-hot-toast'
import { dir } from 'i18next'

import { languages } from '@/app/i18n/settings'

import '@/styles/globals.css'
import { Montserrat, Roboto } from 'next/font/google'
import Link from 'next/link'

const montserrat = Montserrat({
  weight: ['600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
})

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export const metadata = {
  title: 'Community Check',
  description: 'Application for Community Checking',
}

export default function RootLayout({ children, params: { lng } }) {
  return (
    <html
      lang={lng}
      dir={dir(lng)}
      className={`${montserrat.variable} ${roboto.variable}`}
    >
      <body className="bg-bright-gray min-h-screen h-full flex flex-col text-raisin-black">
        <div className="w-full bg-ming-blue py-4 pl-2 pr-4">
          <header className="max-w-6xl mx-auto pl-4">
            <Link
              href={'/' + lng}
              className="text-white cursor-pointer text-xl font-[600] font-montserrat"
            >
              Community Check
            </Link>
          </header>
        </div>
        <main className="px-5 py-8 flex flex-1 w-full max-w-6xl mx-auto">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
