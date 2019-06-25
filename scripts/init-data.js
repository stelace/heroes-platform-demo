const stelace = require('./admin-sdk')
const { get, keyBy } = require('lodash')
const pMap = require('p-map')
const csv = require('csvtojson')
const path = require('path')

const data = require('./data')
const createdData = {
  assets: {},
  assetTypes: {},
  categories: {},
  config: {},
  customAttributes: {},
  messages: {},
  ratings: {},
  transactions: {},
  users: {},
  workflows: {},
}

let heroesJson
const nycBounds = {
  sw: { latitude: 40.632256, longitude: -73.886490 },
  ne: { latitude: 40.813502, longitude: -74.013432 }
}

const devWorkspace = 'devWorkspace'

// Useful to avoid removing resources not created by this script
// Set this to false to override (to use with caution)
const shouldOnlyRemoveDevResources = true

async function run () {
  await cancelTransactions() // cannot remove transactions, so we cancel them instead
  await removeRatings()
  await removeMessages()
  await removeAssets()
  await removeUsers()
  await removeWorkflows()
  await removeCustomAttributes()
  await removeCategories()
  await removeAssetTypes()

  const parseTags = col => col ? col.split(',').map(a => a.trim()) : []
  const parseImages = col => col ? col.split(',').map(a => ({ url: a.trim() })) : []
  heroesJson = await csv({
    delimiter: ',',
    checkType: true, // parse numbers
    colParser: {
      'customAttributes.abilities': parseTags,
      'customAttributes.environmentHero': (item) => item === 'true',
      'customAttributes.stelaceStaffPick': (item) => item === 'true',
      'customAttributes.starring': parseTags,
      'metadata.images': parseImages
    }
  }).fromFile(path.join(__dirname, 'heroes.csv'))
  // console.log(JSON.stringify(heroesJson[0], null, 2))

  if (data.assetTypes) {
    const keys = Object.keys(data.assetTypes)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.assetTypes[key]

      const metadata = Object.assign({}, payload.metadata, { devWorkspace })
      payload.metadata = metadata

      createdData.assetTypes[key] = await stelace.assetTypes.create(payload)
    }
  }
  if (data.config && data.config.default) {
    const payload = data.config.default

    await stelace.config.update(payload)

    const assetTypesConfig = get(data.config.default, 'stelace.instant.assetTypes')
    if (assetTypesConfig) {
      const assetTypesIds = Object.keys(assetTypesConfig)
      assetTypesIds.forEach(assetTypeId => {
        const assetTypeConfig = assetTypesConfig[assetTypeId]

        getRealIdentifier('assetType', assetTypeId, realId => {
          assetTypesConfig[realId] = assetTypeConfig
          delete assetTypesConfig[assetTypeId]
        })
      })

      // clean existing config, we have to clean because of API object merging strategy
      await stelace.config.update({
        stelace: {
          instant: {
            assetTypes: null
          }
        }
      })
      await stelace.config.update({
        stelace: {
          instant: {
            assetTypes: assetTypesConfig
          }
        }
      })
    }

    const searchOptions = get(data.config.default, 'stelace.instant.searchOptions')
    if (searchOptions) {
      const newSearchOptions = {
        modes: {}
      }

      const searchModes = Object.keys(searchOptions.modes)
      searchModes.forEach(searchMode => {
        const config = searchOptions.modes[searchMode]

        const newAssetTypesIds = config.assetTypesIds.map(assetTypeId => {
          let id = assetTypeId
          getRealIdentifier('assetType', assetTypeId, realId => { id = realId })
          return id
        })

        newSearchOptions.modes[searchMode] = Object.assign({}, config, {
          assetTypesIds: newAssetTypesIds
        })
      })

      // clean existing config, we have to clean because of API object merging strategy
      await stelace.config.update({
        stelace: {
          instant: {
            searchOptions: null
          }
        }
      })
      await stelace.config.update({
        stelace: {
          instant: {
            searchOptions: newSearchOptions
          }
        }
      })
    }
  }
  if (data.categories) {
    const keys = Object.keys(data.categories)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.categories[key]

      const metadata = Object.assign({}, payload.metadata, { devWorkspace })
      payload.metadata = metadata

      createdData.categories[key] = await stelace.categories.create(payload)
    }
  }
  if (data.customAttributes) {
    const keys = Object.keys(data.customAttributes)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.customAttributes[key]

      const metadata = Object.assign({}, payload.metadata, { devWorkspace })
      payload.metadata = metadata

      createdData.customAttributes[key] = await stelace.customAttributes.create(payload)
    }
  }
  if (data.workflows) {
    const keys = Object.keys(data.workflows)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.workflows[key]

      Object.keys(payload.computed || {}).forEach(key => {
        const value = payload.computed[key]
        if (typeof value === 'string') {
          const valueBetweenQuotes = getValueBetweenQuotes(value)
          if (valueBetweenQuotes) {
            getRealIdentifier('assetType', valueBetweenQuotes, realId => {
              payload.computed[key] = `"${realId}"`
            })
            getRealIdentifier('category', valueBetweenQuotes, realId => {
              payload.computed[key] = `"${realId}"`
            })
            getRealIdentifier('customAttribute', valueBetweenQuotes, realId => {
              payload.computed[key] = `"${realId}"`
            })
          }
        }
      })

      const metadata = Object.assign({}, payload.metadata, { devWorkspace })
      payload.metadata = metadata

      createdData.workflows[key] = await stelace.workflows.create(payload)
    }
  }
  if (data.users) {
    const keys = Object.keys(data.users)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.users[key]

      const metadata = Object.assign({}, payload.metadata, { devWorkspace })
      payload.metadata = metadata

      createdData.users[key] = await stelace.users.create(payload)
    }

    // wait for user workflows to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    const usersIds = keys.map(key => createdData.users[key].id)

    const users = await stelace.users.list({
      id: usersIds,
      nbResultsPerPage: 100
    })

    const usersById = keyBy(users, 'id')
    keys.forEach(key => {
      createdData.users[key] = usersById[createdData.users[key].id]
    })
  }

  // Hero assets
  if (Array.isArray(heroesJson) && heroesJson.length) {
    console.log('Ready to save the world:')
    await pMap(heroesJson, async (h) => {
      const payload = Object.assign({}, h, {
        price: parseFloat(h.price) || 0,
        metadata: {
          devWorkspace,
          images: h.metadata.images
        },
        platformData: {
          createdByStelace: true
        },
        locations: [{
          latitude: nycBounds.sw.latitude + Math.random() * (nycBounds.ne.latitude - nycBounds.sw.latitude),
          longitude: nycBounds.ne.longitude + Math.random() * (nycBounds.sw.longitude - nycBounds.ne.longitude)
        }],
      })
      getRealIdentifier('category', `categories::${h.category}`, realId => {
        payload.categoryId = realId
      })
      delete payload.category

      await stelace.assets.create(payload)
      console.log(h.name)
    }, { concurrency: 4 })
  }
  if (data.assets) {
    const keys = Object.keys(data.assets)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.assets[key]

      getRealIdentifier('user', payload.ownerId, realId => {
        payload.ownerId = realId
      })
      getRealIdentifier('category', payload.categoryId, realId => {
        payload.categoryId = realId
      })
      getRealIdentifier('assetType', payload.assetTypeId, realId => {
        payload.assetTypeId = realId
      })

      const metadata = Object.assign({}, payload.metadata, { devWorkspace })
      const platformData = Object.assign({}, payload.platformData, {
        createdByStelace: true
        // can’t be tampered with by users without 'platformData:edit:all' permission
      })
      payload.metadata = metadata
      payload.platformData = platformData

      createdData.assets[key] = await stelace.assets.create(payload)
    }
  }

  if (data.transactions) {
    const keys = Object.keys(data.transactions)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.transactions[key]

      getRealIdentifier('asset', payload.assetId, realId => {
        payload.assetId = realId
      })
      getRealIdentifier('user', payload.takerId, realId => {
        payload.takerId = realId
      })

      const metadata = Object.assign({}, payload.metadata, { devWorkspace })
      payload.metadata = metadata

      createdData.transactions[key] = await stelace.transactions.create(payload)
    }
  }
  if (data.messages) {
    const keys = Object.keys(data.messages)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.messages[key]

      getRealIdentifier('asset', payload.topicId, realId => {
        payload.topicId = realId
      })
      getRealIdentifier('transaction', payload.topicId, realId => {
        payload.topicId = realId
      })
      getRealIdentifier('user', payload.senderId, realId => {
        payload.senderId = realId
      })
      getRealIdentifier('user', payload.receiverId, realId => {
        payload.receiverId = realId
      })
      getRealIdentifier('conversation', payload.conversationId, realId => {
        payload.conversationId = realId
      })

      const metadata = Object.assign({}, payload.metadata, { devWorkspace })
      payload.metadata = metadata

      createdData.messages[key] = await stelace.messages.create(payload)
    }
    if (data.ratings) {
      const keys = Object.keys(data.ratings)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const payload = data.ratings[key]

        getRealIdentifier('user', payload.authorId, realId => {
          payload.authorId = realId
        })
        getRealIdentifier('user', payload.targetId, realId => {
          payload.targetId = realId
        })
        getRealIdentifier('asset', payload.assetId, realId => {
          payload.assetId = realId
        })
        getRealIdentifier('transaction', payload.transactionId, realId => {
          payload.transactionId = realId
        })

        const metadata = Object.assign({}, payload.metadata, { devWorkspace })
        payload.metadata = metadata

        createdData.ratings[key] = await stelace.ratings.create(payload)
      }
    }
  }
}

async function removeAssets () {
  const assets = await stelace.assets.list({ nbResultsPerPage: 100 })

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]
    if (!shouldOnlyRemoveDevResources || asset.metadata[devWorkspace]) {
      await stelace.assets.remove(asset.id)
    }
  }
}

async function removeUsers () {
  const users = await stelace.users.list({ nbResultsPerPage: 100 })

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    if (!shouldOnlyRemoveDevResources || user.metadata[devWorkspace]) {
      const organizationsIds = Object.keys(user.organizations)

      for (let j = 0; j < organizationsIds.length; j++) {
        const organizationId = organizationsIds[j]
        await stelace.users.remove(organizationId)
      }

      await stelace.users.remove(user.id)
    }
  }
}

async function removeAssetTypes () {
  const assetTypes = await stelace.assetTypes.list({ nbResultsPerPage: 100 })

  for (let i = 0; i < assetTypes.length; i++) {
    const user = assetTypes[i]
    if (!shouldOnlyRemoveDevResources || user.metadata[devWorkspace]) {
      await stelace.assetTypes.remove(user.id)
    }
  }
}

async function removeCategories () {
  const categories = await stelace.categories.list({ nbResultsPerPage: 100 })

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    if (!shouldOnlyRemoveDevResources || category.metadata[devWorkspace]) {
      await stelace.categories.remove(category.id)
    }
  }
}

async function removeMessages () {
  const messages = await stelace.messages.list({ nbResultsPerPage: 100 })

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    if (!shouldOnlyRemoveDevResources || message.metadata[devWorkspace]) {
      await stelace.messages.remove(message.id)
    }
  }
}

async function removeRatings () {
  const ratings = await stelace.ratings.list({ nbResultsPerPage: 100 })

  for (let i = 0; i < ratings.length; i++) {
    const rating = ratings[i]
    if (!shouldOnlyRemoveDevResources || rating.metadata[devWorkspace]) {
      await stelace.ratings.remove(rating.id)
    }
  }
}

async function cancelTransactions () {
  const transactions = await stelace.transactions.list({ nbResultsPerPage: 100 })

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i]
    if (!shouldOnlyRemoveDevResources || transaction.metadata[devWorkspace]) {
      await stelace.transactions.createTransition(transaction.id, { name: 'cancel', data: { cancellationReason: 'forceCancel' } })
    }
  }
}

async function removeCustomAttributes () {
  const customAttributes = await stelace.customAttributes.list()

  for (let i = 0; i < customAttributes.length; i++) {
    const customAttribute = customAttributes[i]
    if (!shouldOnlyRemoveDevResources || customAttribute.metadata[devWorkspace]) {
      await stelace.customAttributes.remove(customAttribute.id)
    }
  }
}

async function removeWorkflows () {
  const workflows = await stelace.workflows.list()

  for (let i = 0; i < workflows.length; i++) {
    const workflow = workflows[i]
    if (!shouldOnlyRemoveDevResources || workflow.metadata[devWorkspace]) {
      await stelace.workflows.remove(workflow.id)
    }
  }
}

function getValueBetweenQuotes (str) {
  if (typeof str !== 'string') return null

  const quotesRegex = /^["'](.+)["']$/
  const matched = str.match(quotesRegex)

  return matched ? matched[1] : null
}

function getRealIdentifier (type, id, handler) {
  let prefix
  let resourceNamespace
  let resourceHandler

  if (type === 'assetType') {
    prefix = 'assetTypes::'
    resourceNamespace = 'assetTypes'
  } else if (type === 'category') {
    prefix = 'categories::'
    resourceNamespace = 'categories'
  } else if (type === 'customAttribute') {
    prefix = 'customAttributes::'
    resourceNamespace = 'customAttributes'
  } else if (type === 'user') {
    prefix = 'users::'
    resourceNamespace = 'users'
  } else if (type === 'asset') {
    prefix = 'assets::'
    resourceNamespace = 'assets'
  } else if (type === 'transaction') {
    prefix = 'transactions::'
    resourceNamespace = 'transactions'
  } else if (type === 'conversation') {
    prefix = 'conversations::'
    resourceHandler = (resourceNamespace, key) => {
      return createdData.messages[key] && createdData.messages[key].conversationId
    }
  } else {
    throw new Error(`Unknown type: ${type}`)
  }

  if (typeof id === 'string' && id.startsWith(prefix)) {
    const key = id.slice(prefix.length)
    let realId

    if (typeof resourceHandler === 'function') {
      realId = resourceHandler(resourceNamespace, key)
    } else {
      realId = createdData[resourceNamespace][key] && createdData[resourceNamespace][key].id
    }

    if (realId) {
      handler(realId)
    }
  }
}

run()
  .then(() => console.log('\nSuccess'))
  .catch(console.warn)
