import { get } from 'lodash'

export function populateAsset ({ asset, usersById, categoriesById, assetTypesById }) {
  const newAsset = Object.assign({}, asset)
  newAsset.owner = usersById[asset.ownerId]
  newAsset.category = categoriesById[asset.categoryId]
  newAsset.assetType = assetTypesById[asset.assetTypeId]

  newAsset.timeUnit = get(newAsset, 'assetType.timing.timeUnit', '')

  return newAsset
}
