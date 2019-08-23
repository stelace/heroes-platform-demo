const priceDefaultMin = 0
const priceDefaultMax = 10000

const minSpeed = 0
const maxSpeed = 100

export default {
  showSearchMap: false,
  userShowSearchMap: null, // Boolean means user has explicitly set map visibility
  // for consistent map display status during navigation.
  // Otherwise map could show up again despite showSearchMap previously set to false.
  // These two variables enable to show map dynamically (like screen size detection).

  showFilterDialog: false,
  query: '',

  queryLocation: '',
  latitude: null,
  longitude: null,

  searchMode: null,
  displayCustomAttributes: [],
  assetTypesIds: [],

  startDate: '',
  endDate: '',

  displayPriceRange: {
    min: null,
    max: null
  },
  priceRange: {
    min: null,
    max: null
  },
  priceDefault: {
    min: priceDefaultMin,
    max: priceDefaultMax
  },

  displaySpeedRange: {
    min: minSpeed,
    max: maxSpeed
  },
  minSpeed,
  maxSpeed,

  searchFilters: {
    page: 1,
    nbResultsPerPage: 24,
    defaultOrderBy: 'createdDate', // to use when there is no query to keep sorting by text relevance
    orderBy: null,
    order: ['desc'],
    filters: {},
    customAttributesFilters: {}
  },
  availabilityFilter: {
    enabled: false, // show unavailable assets too, and adds `available` boolean to search results
    fullPeriod: false
  },
  paginationMeta: {
    nbResults: 0,
    nbPages: 1
  },

  assets: [],
  usersById: {},
}
