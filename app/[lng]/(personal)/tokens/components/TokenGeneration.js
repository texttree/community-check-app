'use server'

import { getUser } from '@/app/actions/getUser'
import Breadcrumbs from './Breadcrumbs'
import TokenCreate from './TokenCreate'
import TokenList from './TokenList'
import { getTokens } from '../actions/getTokens'

const TokenGeneration = async ({ lng }) => {
  const user = await getUser()
  const tokens = await getTokens(user.id)

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg">
        <div className="bg-ming-blue p-3.5 w-full"></div>
        <div className="bg-white">
          <Breadcrumbs lng={lng} />
          <TokenCreate lng={lng} />
          <TokenList tokens={tokens} lng={lng} />
        </div>
      </div>
    </div>
  )
}

export default TokenGeneration
