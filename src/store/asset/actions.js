import stelace from 'src/utils/stelace'
import * as types from 'src/store/mutation-types'
import { get, isEmpty, values } from 'lodash'

import { populateAsset } from 'src/utils/asset'
import { roundUpPower10 } from 'src/utils/number'

export async function initEditAssetPage ({ state, commit, dispatch }, { assetId } = {}) {
  const [
    asset,
    availabilities,
  ] = await Promise.all([
    assetId ? stelace.assets.read(assetId) : null,
    assetId ? stelace.availabilities.list({ assetId }) : [],
    dispatch('fetchCategories'),
    dispatch('fetchAssetsRelatedResources'),
  ])

  commit({
    type: types.SET_ASSET,
    asset
  })
  commit({
    type: types.SET_AVAILABILITIES,
    availabilities
  })

  return { asset }
}

// Show currentUser assets if userId is not specified
export async function fetchUserAssets ({ commit, dispatch, rootState, rootGetters }, { userId } = {}) {
  const {
    categoriesById,
    assetTypesById,
  } = rootState.common

  const ownerId = userId || (rootGetters.currentUser || {}).id

  if (!ownerId) return []

  const maxNbResultsPerPage = 100 // retrieve all assets at once

  const assets = await stelace.assets.list({ ownerId, nbResultsPerPage: maxNbResultsPerPage })

  commit({
    type: types.SET_USER_ASSETS,
    ownerId,
    assets
  })

  return assets.map(asset => {
    return populateAsset({
      asset,
      usersById: {},
      categoriesById,
      assetTypesById
    })
  })
}

export async function getHighestPrice ({ rootState, commit }, { setPriceRange = true } = {}) {
  const assetTypeIds = rootState.search.assetTypesIds
  const params = {
    nbResultsPerPage: 1,
    orderBy: 'price',
    order: 'desc'
  }
  if (!isEmpty(assetTypeIds)) params.assetTypeId = assetTypeIds

  const assets = await stelace.assets.list(params)
  const max = get(assets, '[0].price')

  if (Number.isFinite(max) && setPriceRange) {
    commit({
      type: types.SET_PRICE_RANGE,
      min: rootState.search.priceRange.min,
      max: roundUpPower10(max),
      defaults: true
    })
  }
  return max
}

export async function createAsset ({ commit }, { attrs }) {
  const asset = await stelace.assets.create(attrs)

  commit({
    type: types.SET_ASSET,
    asset
  })

  return asset
}

export async function updateAsset ({ commit }, { assetId, attrs }) {
  const asset = await stelace.assets.update(assetId, attrs)

  commit({
    type: types.SET_ASSET,
    asset
  })

  return asset
}

export async function removeAsset ({ commit }, { assetId }) {
  await stelace.assets.remove(assetId)

  commit({
    type: types.SET_ASSET,
    asset: null
  })
}

export async function createAvailability ({ state, commit }, { attrs }) {
  const availability = await stelace.availabilities.create(attrs)

  const availabilitiesById = Object.assign({}, state.availabilitiesById)
  availabilitiesById[availability.id] = availability

  commit({
    type: types.SET_AVAILABILITIES,
    availabilities: values(availabilitiesById)
  })

  return availability
}
