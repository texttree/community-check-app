import dynamic from 'next/dynamic'

const SwaggerUI = dynamic(import('swagger-ui-react'), { ssr: false })

import 'swagger-ui-react/swagger-ui.css'

function ApiDoc() {
  return (
    <>
      <SwaggerUI url="/swagger.json" persistAuthorization={true} />
    </>
  )
}

export default ApiDoc
