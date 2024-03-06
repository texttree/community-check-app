import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useState } from 'react'

const TokenGeneration = () => {
  const [accessToken, setAccessToken] = useState('')
  const [isTokenGenerated, setIsTokenGenerated] = useState(false)
  const [errorText, setErrorText] = useState('')
  const supabase = useSupabaseClient()

  const handleGenerateToken = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user.id

      const response = await fetch('/api/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate tokens')
      }

      const accessTokenNew = await response.json()

      setAccessToken(accessTokenNew)
      setIsTokenGenerated(true)
      setErrorText('')
    } catch (error) {
      console.error('Error generating tokens:', error.message)
      setIsTokenGenerated(false)
      setErrorText('Failed to generate tokens')
    }
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(accessToken)
  }

  const hideToken = (token) => {
    return '*'.repeat(token.length)
  }

  return (
    <div className="flex ml-32 mt-4">
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 inline-block rounded-md"
          onClick={handleGenerateToken}
        >
          Generate Token
        </button>
        {isTokenGenerated && (
          <p className="text-green-500">Token generated successfully!</p>
        )}
        {errorText && <p className="text-red-500">{errorText}</p>}{' '}
      </div>
      <div>
        {accessToken && (
          <div className="flex mt-4">
            <input
              type="password"
              value={hideToken(accessToken)}
              className="border border-gray-300 ml-2 px-4 py-2  rounded-md"
              readOnly
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 ml-2 rounded-md"
              onClick={handleCopyToken}
            >
              Copy Token
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TokenGeneration