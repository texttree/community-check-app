function createAccessTokenManager() {
  let _accessToken

  return {
    set accessToken(token) {
      _accessToken = token
    },

    get accessToken() {
      return _accessToken
    },
  }
}

const accessTokenManager = createAccessTokenManager()

export { accessTokenManager }
