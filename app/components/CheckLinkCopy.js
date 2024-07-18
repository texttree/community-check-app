'use client'
import { forwardRef } from 'react'
import Link from 'next/link'

const CheckPageLink = forwardRef(
  ({ lng, checkId, chapterNumber, currentDomain, copyToClipboard, t }, ref) => {
    const link = `${currentDomain}/${lng}/checks/${checkId}/${chapterNumber}`
    return (
    )
  }
)

CheckPageLink.displayName = 'CheckPageLink'

export default CheckPageLink
