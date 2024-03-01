import { getCookie } from './cookiesHelper'
import { accessTokenManager } from '@/helpers/accessTokenManager'

export const refreshAccessToken = async () => {
  try {
    const refreshToken = getCookie('refreshTokenCookie')
    if (!refreshToken) {
      console.error('Refresh token not found')
      return false
    }

    const refreshResponse = await fetch('/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (refreshResponse.ok) {
      const { newAccessToken } = await refreshResponse.json()
      updateAccessToken(newAccessToken)
      console.log('Access token refreshed successfully')
      return true
    } else {
      console.error('Error refreshing access token')
      return false
    }
  } catch (error) {
    console.error('Error refreshing access token:', error.message)
    return false
  }
}

const updateAccessToken = (newAccessToken) => {
  accessTokenManager.accessToken = newAccessToken
}
