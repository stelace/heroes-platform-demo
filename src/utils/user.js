import { get } from 'lodash'

// Getting user.categoryId from user.metadata.metadata.instant.categoryId
// Advice: use lodash get to safely access values
export const userMetadataMapping = {
  categoryId: 'metadata.instant.categoryId',
  avatarUrl: 'metadata.instant.avatarUrl',
  publicName: 'metadata.instant.publicName',
  locations: 'metadata.instant.locations',

  images: 'metadata.images',

  averageRating: 'metadata.instant.averageRating',
  score: 'metadata.instant.score',

  firstName: 'metadata._premium.firstname',
  lastName: 'metadata._premium.lastname',

  availabilityId: 'platformData.instant.availabilityId',

}

export function isProvider (user) {
  const u = user // assign here to enable VueJS reactivity
  const roles = get(u, 'roles', [])
  return roles.includes('provider')
}

export function isUser (user) {
  const u = user // assign here to enable VueJS reactivity
  const roles = get(u, 'roles', [])
  return roles.includes('user')
}

export function populateUser (user, {
  categoriesById,
  isCurrentUser
} = {}) {
  // user can select a category on platform to get appropriate suggestion and offers
  user.categoryId = get(user, userMetadataMapping.categoryId, '')
  if (categoriesById && user.categoryId) {
    user.category = categoriesById[user.categoryId] || '' // categories can be missing in store
    user.categoryName = user.category ? user.category.name : ''
  }

  user.avatarUrl = get(user, userMetadataMapping.avatarUrl, '')
  user.publicName = get(user, userMetadataMapping.publicName, '')
  user.locations = get(user, userMetadataMapping.locations) || []
  user.locationName = get(user.locations, '[0].shortDisplayName', '')

  user.images = get(user, userMetadataMapping.images, [])

  user.availabilityId = get(user, userMetadataMapping.availabilityId, '')

  // Visibility can depend on viewing user access rights
  if (isCurrentUser) {
    user.firstName = user.firstname
    user.lastName = user.lastname
  } else {
    user.firstName = get(user, userMetadataMapping.firstName, '')
    user.lastName = get(user, userMetadataMapping.lastName, '')
  }
}

export function getDisplayName (firstname, lastname) {
  if (!firstname) return ''

  let displayName = firstname
  if (lastname) {
    displayName += ` ${(lastname || '').charAt(0)}.`
  }

  return displayName
}
