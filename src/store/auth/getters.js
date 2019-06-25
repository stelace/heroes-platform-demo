import { isNil } from 'lodash'

import { populateUser } from 'src/utils/user'

export function currentUser (state, getters, rootState, rootGetters) {
  const user = Object.assign({}, state.user)

  const { categoriesById } = rootState.common

  if (user.id) {
    populateUser(user, { categoriesById, isCurrentUser: true })
  }

  return user
}

export function selectedUserIsCurrentUser (state, getters, rootState, rootGetters) {
  const selectedUser = rootGetters.selectedUser
  const currentUser = rootGetters.currentUser

  return [selectedUser.id, currentUser.id].every(id => !isNil(id)) &&
    selectedUser.id === currentUser.id
}
