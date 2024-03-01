function createAccessTokenManager() {
  let accessToken

  function setAccessToken(token) {
    accessToken = token
  }

  function getAccessToken() {
    return accessToken
  }

  return {
    setAccessToken,
    getAccessToken,
  }
}

const accessTokenManager = createAccessTokenManager()

export { accessTokenManager }
