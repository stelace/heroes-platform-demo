export const state = () => ({
  dialogsOpened: {
    asset: false,
    instant: false,
    search: false,
    event: false,
    workflow: false
  },
  code: {
    asset: `await stelace.assets.create({
  name: 'San',
  description: 'Princess Mononoke (もののけ姫)',
  // you can use external or Stelace ids
  ownerId: 'Ghibli',
  assetTypeId: 'typ_T3ZfQps1I3a1gJYz2I3a',
  locations: [{
    latitude: 40.632245,
    longitude: -73.886554
  }],
  price: 0, // ❤️
  customAttributes: { // indexed for search too
    speed: 55,
    abilities: ['Communication with animals'],
    environmentHero: true
  }
})
`,
    instant: `await stelace.users.create({
  username: 'user@example.com',
  password: 'secretPassword'
})

// or OAuth2 with Github, Google, Facebook…
await stelace.auth.getTokens({
  grantType: 'authorizationCode',
  code: 'O_AUTH_2_CODE'
})
const { userId } = stelace.auth.info()

await stelace.assets.create({
  name: 'San',
  description: 'Princess Mononoke (もののけ姫)',
  ownerId: userId,
  assetTypeId: 'typ_T3ZfQps1I3a1gJYz2I3a',
  // …
  customAttributes: {
    speed: 55,
    environmentHero: true
  }
})
`,
    search: `
await stelace.search.list({
  //  typo-tolerant search
  query: 'supemax', // superman, maybe?
  filter: 'abilities[Flight] AND gender = Male',
  sort: [
    { speed: 'desc'},
    { visitorMissions: 'desc' }
  ],
  location: {
    latitude: 40.6323,
    longitude: -73.8865
  },
  // time-based availability
  startDate: '${new Date(new Date().getTime() + 3600 * 24 * 1000).toISOString()}'
  // quantity-based availability
  quantity: 1
})
`,
    event: `

await stelace.events.create({
  type: 'assign_mission', // custom event
  objectId: this.missionDialogAssetId,
  metadata: {
    visitorMission: true,
    requesterName: this.auth.requesterName,
    any: {
      thing: true
    }
  }
})
`,
    workflow: `await stelace.workflows.create({
  name: 'starAsset', // let’s give a star, not a flag
  event: 'app_star', // Event triggering this Workflow
  computed: { // using simple JavaScript expressions
    notifyStaff: 'asset.metadata.stars == 100'
  },
  run: [{
    name: 'star',
    endpointMethod: 'PATCH',
    endpointUri: '/assets/\${asset.id}',
    endpointPayload: {
      metadata: { // increment safely using lodash
        stars: '_.get(asset, "metadata.stars", 0) + 1'
      }
    }
  }, {
    name: 'slackStarNotif',
    description: 'Notify Platform staff on Slack.',
    endpointMethod: 'POST',
    skip: '!env.SLACK_WEBHOOK_URL',
    // secured env variable set in Dashboard
    endpointUri: '\${env.SLACK_WEBHOOK_URL}',
    endpointPayload: { // Slack message content
      text: '\${asset.name} is becoming very popular.'
    }
  }]
})
`
  }
})

export const mutations = {
  DEMO_DIALOG_OPENED (state, { name }) {
    state.dialogsOpened[name] = true
  }
}

export const actions = {}

export const getters = {}
