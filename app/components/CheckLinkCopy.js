'use client'
import { forwardRef } from 'react'
import Link from 'next/link'

const CheckPageLink = forwardRef(
  ({ lng, checkId, chapterNumber, currentDomain, copyToClipboard, t }, ref) => (
    <div className="flex my-4">
      <Link
        href={`/${checkId}/${chapterNumber}`}
        ref={ref}
        className="border p-2 rounded-md"
      >
        {currentDomain}/{lng}/checks/{checkId}/{chapterNumber}
      </Link>
      <button
        className="bg-ming-blue hover:bg-deep-space text-white px-3 py-1 rounded-md ml-2 focus:outline-none"
        onClick={copyToClipboard}
      >
        {t('copy')}
      </button>
    </div>
  )
)

CheckPageLink.displayName = 'CheckPageLink'

export default CheckPageLink
