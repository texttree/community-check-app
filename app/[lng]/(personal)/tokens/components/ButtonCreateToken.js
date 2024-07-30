'use client'

import { useTranslation } from '@/app/i18n/client'
import { useFormStatus } from 'react-dom'

function ButtonCreateToken({ lng }) {
  const { pending } = useFormStatus()
  const { t } = useTranslation(lng, 'common')
  return (
    <button className="button-primary button-base" disabled={pending}>
      {t('generateToken')}
    </button>
  )
}

export default ButtonCreateToken
