import stelace from './stelace'

// Use this synchronous function to know if the current user is authenticated
// without a network request
// e.g. to display login modal for unauthenticated users when they arrive in the app
export function getCurrentUserId () {
  const { userId } = stelace.auth.info()
  return userId
}

export function getAuthToken () {
  const tokenStore = stelace.getTokenStore()
  const tokens = tokenStore.getTokens()

  return tokens && tokens.accessToken
}

export function getSSOLoginUrl (provider) {
  const publicPlatformId = process.env.STELACE_PUBLIC_PLATFORM_ID

  return `${process.env.STELACE_API_URL}/auth/sso/${publicPlatformId}/${provider}`
}
