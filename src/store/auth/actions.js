import stelace from 'src/utils/stelace'
import * as types from 'src/store/mutation-types'

import {
  getCurrentUserId,
} from 'src/utils/auth'

export async function fetchCurrentUser ({ commit, dispatch, state, rootState, rootGetters }, { forceRefresh = false } = {}) {
  // only fetch current user data in browser environment
  // because the authentication tokens are stored in local storage
  // so they aren't available in server-side
  const isBrowser = typeof window === 'object'
  if (!isBrowser) return

  const currentUser = state.user || {}
  const userId = getCurrentUserId()

  if (!forceRefresh && currentUser.id === userId) return currentUser

  if (userId) {
    commit({
      type: types.SET_CURRENT_USER,
      user: currentUser
    })
    try {
      const user = await stelace.users.read(userId)

      commit({
        type: types.SET_CURRENT_USER,
        user
      })
    } catch (err) {
      commit({
        type: types.SET_CURRENT_USER,
        user: null
      })

      // the current user no longer exists, so we remove the auth token
      if (err.statusCode === 404) {
        const tokenStore = stelace.getTokenStore()
        tokenStore.removeTokens()
      } else {
        throw err
      }
    }
  } else {
    commit({
      type: types.SET_CURRENT_USER,
      user: null
    })
  }
}

export async function login ({ dispatch }, { username, password }) {
  await stelace.auth.login({
    username,
    password
  })

  await dispatch('fetchCurrentUser')
}

export async function signup ({ commit, dispatch }, { userAttrs, noLogin = false }) {
  await stelace.users.create(userAttrs)

  // add timeout to background operations to be completed on the new user
  await new Promise(resolve => setTimeout(resolve, 1000))

  if (noLogin) return

  const { username, password } = userAttrs

  await stelace.auth.login({
    username,
    password
  })

  await dispatch('fetchCurrentUser')
}

export async function logout ({ commit }) {
  await stelace.auth.logout()

  commit({
    type: types.SET_CURRENT_USER,
    user: null
  })
}

export async function sendResetPasswordRequest ({ commit }, { username }) {
  await stelace.password.resetRequest({ username })
}

export async function sendResetPasswordConfirmation ({ commit }, { resetToken, newPassword }) {
  await stelace.password.resetConfirm({ resetToken, newPassword })
}

export async function changePassword ({ commit }, { currentPassword, newPassword }) {
  await stelace.password.change({
    currentPassword,
    newPassword
  })
}
