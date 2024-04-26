'use client'

import dynamic from 'next/dynamic'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
})

import 'swagger-ui-react/swagger-ui.css'

export default function ReactSwagger({ url }) {
  return (
    <>
      <SwaggerUI url={url} persistAuthorization={true} />
    </>
  )
}
