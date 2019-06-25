import stelace from 'src/utils/stelace'
import { isNil, isEmpty, isPlainObject, forEach, flatten } from 'lodash'

const defaultAvailabilityFilter = {
  enabled: true,
  fullPeriod: false
}

export const searchAssets = async ({
  page,
  nbResultsPerPage,
  orderBy, // can be an array for multiple sorting steps
  order = 'desc', // can be an array expected to have the same length as orderBy
  location,
  filters = {},
  customAttributesFilters = {},
  query,
  availabilityFilter = defaultAvailabilityFilter
} = {}) => {
  let filter = filters.filter || ''
  const addToFilter = (expression, operator = '&&') => {
    filter += (filter ? ` ${operator} ${expression}` : expression)
  }

  const sortableBuiltIntAttributes = [
    'name',
    'validated',
    'createdDate',
    'price'
  ]

  const searchParams = {
    page,
    nbResultsPerPage,
    availabilityFilter
  }

  if (orderBy) {
    const sortingOrders = flatten([order])
    const transformedSortVarName = n => sortableBuiltIntAttributes.includes(n) ? `_${n}` : n
    searchParams.sort = flatten([orderBy])
      .map((by, i) => ({
        [transformedSortVarName(by)]: sortingOrders[i] || sortingOrders[0] // fallback
      }))
  }

  if (typeof filters.active === 'boolean' || filters.active === null) {
    searchParams.active = filters.active // can disable active filter with null (defaults to true)
  }
  if (filters.validated) searchParams.validated = filters.validated

  if (query) searchParams.query = query
  if (filters.categoryId) searchParams.categoryId = flatten([filters.categoryId])
  if (filters.assetTypeId) searchParams.assetTypeId = flatten([filters.assetTypeId])
  if (filters.similarTo) searchParams.similarTo = flatten([filters.similarTo])
  if (filters.without) searchParams.without = flatten([filters.without])
  if (filters.startDate) searchParams.startDate = filters.startDate
  if (filters.endDate) searchParams.endDate = filters.endDate
  if (Number.isFinite(filters.quantity)) searchParams.quantity = filters.quantity

  if (location && [location.longitude, location.latitude].every(Number.isFinite)) {
    searchParams.location = location
  }

  if (!isEmpty(filters.price)) {
    if (!isNil(filters.price.gte)) addToFilter(`_price >= ${filters.price.gte}`)
    if (!isNil(filters.price.lte)) addToFilter(`_price <= ${filters.price.lte}`)
  }

  // Implicitly joining equality expression with AND.
  // Feel free to improve this to support more Stelace Search filter expressions
  forEach(customAttributesFilters, (value, name) => {
    const isRange = isPlainObject(value) && (value.gte || value.lte)
    const isValid = !isNil(value) && (isRange || !isPlainObject(value))
    if (!isValid) return

    if (isRange) {
      if (!isNil(value.gte)) addToFilter(`${name} >= ${value.gte}`)
      if (!isNil(value.lte)) addToFilter(`${name} <= ${value.lte}`)
    } else if (Array.isArray(value) && value.length) {
      // we expect a full match of tags, but we could only expect _some_ tags to match
      // by setting a lower right-hand side number.
      addToFilter(`${name}['${value.join("','")}'] >= ${value.length}`)
    } else if (['string', 'boolean'].includes(typeof value) || Number.isFinite(value)) {
      addToFilter(`${name} == ${value}`)
    }
  })

  if (filter) searchParams.filter = filter

  return stelace.search.list(searchParams)
}
