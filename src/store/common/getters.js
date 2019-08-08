import { get, pick, values } from 'lodash'

export function countriesCovered (state) {
  const countriesCovered = get(state.config, 'stelace.instant.countriesCovered')
  const countriesCoveredActive = get(state.config, 'stelace.instant.countriesCoveredActive', false)

  if (!countriesCoveredActive) return []
  return countriesCovered
}

export function socialInfo (state) {
  const d = get(state.config, 'stelace.instant', {})

  return pick(d, [
    'facebookUrl',
    'twitterUsername',
    'instagramUsername'
  ])
}

export function searchOptions (state) {
  const searchOptions = get(state.config, 'stelace.instant.searchOptions', {})
  if (!searchOptions.modes) {
    searchOptions.modes = {}
  }

  return searchOptions
}

export function ratingsOptions (state) {
  const ratingsOptions = get(state.config, 'stelace.instant.ratingsOptions', {})
  if (!ratingsOptions.stats) {
    ratingsOptions.stats = {}
  }
  if (!ratingsOptions.types) {
    ratingsOptions.types = {}
  }

  return ratingsOptions
}

export function isDemoMode (state) {
  return state.config.custom && state.config.custom.isDemoMode
}

export function activeAssetTypes (state) {
  const { assetTypesById, config } = state

  let assetTypes = values(assetTypesById)
    .filter(assetType => assetType.active)

  const assetTypesConfig = get(config, 'stelace.instant.assetTypes')
  if (assetTypesConfig) {
    const enabledIds = Object.keys(assetTypesConfig)
    if (enabledIds.length) {
      assetTypes = assetTypes.filter(assetType => enabledIds.includes(assetType.id))
    }
  }

  return assetTypes
}

export function defaultActiveAssetType (state, getters) {
  const { activeAssetTypes } = getters
  if (activeAssetTypes.length === 1) return activeAssetTypes[0]
  else return activeAssetTypes.find(assetType => assetType.isDefault)
}
