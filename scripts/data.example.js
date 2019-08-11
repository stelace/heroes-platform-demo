// This file is used to seed database with data exported below,
// using init-data.js script.

// Object type keys like 'assetTypes' map to objects to create.
// Corresponding object keys are only used by init-data script to enable references
// like where ids are expected, so that you can use 'assetTypes::someName'
// instead of an id you don’t know (that will look like 'ast_xx…').

const ms = require('ms')

function computeDate (isoDate, duration, pastOrFuture = 'future') {
  const addOrSubtract = pastOrFuture === 'past' ? -1 : 1
  return new Date(new Date(isoDate).getTime() + addOrSubtract * ms(duration)).toISOString()
}
const nycBounds = {
  sw: { latitude: 40.632256, longitude: -73.886490 }, // south-west
  ne: { latitude: 40.813502, longitude: -74.013432 } // north-east
}
const dailyMissions = process.env.LIVE_DEMO_VERSION !== 'true'
const longMissionDurationInHours = dailyMissions ? 24 : 1

module.exports = {
  randomLocationBounds: nycBounds,
  assetTypes: {
    hero: {
      name: 'Hero',
      timeBased: true, // availabilities use variable time windows
      infiniteStock: false,
      timing: {
        timeUnit: 'm', // minute
        minDuration: { m: 1 }
      },
      active: true,
      isDefault: true
    },
    // Imagine we can create mission listings for heroes to pick some
    mission: {
      name: 'Mission',
      timeBased: false, // fixed time window: it’s all or nothing
      infiniteStock: false,
      timing: {
        timeUnit: 'm', // minute
        minDuration: { m: 1 }
      },
      active: false
    }
  },
  assets: {
    // All other heroes are created via heroes.csv loaded in init-data script
    nausicaa: {
      name: 'Nausicaä',
      description: `From the Valley of the Wind (Japanese: 風の谷のナウシカ).
One thousand years have passed since the Seven Days of Fire, an apocalyptic war that destroyed civilization and created the vast Toxic Jungle, a poisonous forest swarming with giant mutant insects. In the kingdom of the Valley of the Wind, a prophecy predicts a saviour "clothed in blue robes, descending onto a golden field". Nausicaä, the princess of the Valley of the Wind, explores the jungle and communicates with its creatures, including the gigantic, trilobite-like armored Ohm. She hopes to understand the jungle and find a way for it and humans to co-exist.
`,
      assetTypeId: 'assetTypes::hero',
      categoryId: 'categories::Inspiring Heroes',
      ownerId: 'Ghibli',
      price: 0, // Some heroes may want to be paid for their effort, surprisingly
      locations: [{
        latitude: 40.775673, // required
        longitude: -73.970904, // required
        shortDisplayName: 'Central Park - NYC' // arbitrary data accepted
      }],
      validated: true,
      active: true,
      customAttributes: {
        speed: 70,
        gender: 'Female',
        abilities: ['Life awareness', 'Stamina', 'Flight', 'Communication with animals'],
        stelaceStaffPick: true,
        environmentHero: true
      },
      metadata: {
        images: [
          { url: 'https://cdn.instant.stelace.com/p/238380/live/images/f36480ceb103ee38c3974832f9a427e6-Nausicaa_1.jpeg' },
          { url: 'https://stelace-instant-files.s3.amazonaws.com/p/238380/live/images/27c13dc286dccc909a970a6734b48e83-Nausicaa_2.gif' }
        ]
      }
    },
  },
  categories: {
    'Super Powers': {
      name: 'Super Powers'
    },
    'Inspiring Heroes': {
      name: 'Inspiring Heroes'
    }
  },
  config: {
    default: {
      custom: {
        isDemoMode: true
      },
      stelace: {
        instant: {
          serviceName: process.env.VUE_APP_SERVICE_NAME,
          locale: 'en',
          currency: 'USD',
          longMissionDurationInHours,
          assetTypes: { // asset types available for asset creation
            'assetTypes::hero': {
              customAttributes: [ // attributes to set in editor
                'speed',
                'abilities',
                'gender',
                'stelaceStaffPick',
                'environmentHero'
              ]
            }
          },
          searchOptions: {
            // This object can enable several search UIs depending on context and user needs
            modes: {
              default: {
                assetTypesIds: ['assetTypes::hero'],
                customAttributes: [ // attributes displayed in search
                  'speed',
                  'abilities',
                  'gender',
                  'stelaceStaffPick',
                  'environmentHero'
                ],
                isActiveFor: [ // we could restrict any search mode to some types of visitors
                  'public',
                  'user',
                  'provider'
                ]
              },
              reversed: {
                assetTypesIds: ['assetTypes::mission']
              }
            }
          },
          countriesCovered: ['usa'], // could be used to restrict the map to some area
          countriesCoveredActive: true,
          googleAnalyticsTrackingActive: true,
          googleAnalyticsTrackingId: 'UA-XXXXXX-1', // for development
        }
      }
    }
  },
  customAttributes: {
    speed: {
      name: 'speed',
      type: 'number',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.speed_label',
              default: 'Speed' // in case translation is missing
              // Generally in the default language of the platform
            },
            description: {}
          },
          materialIcon: 'fast_forward', // example of UI customization with metadata
          priority: 50 // can be used to order custom attributes in search UI
        }
      }
    },
    abilities: {
      name: 'abilities',
      type: 'tags',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.abilities_label',
              default: 'Abilities'
            },
            description: {}
          },
          materialIcon: 'flash_on',
          priority: 10, // can be used to order custom attributes in search UI
          suggestedValues: [
            'Flight',
            'Communication with animals',
            'Magic',
            'Mutant',
            'Human',
            'Hobbit',
            'Elf',
            'Animal powers',
            'Super Intelligence',
            'Weapon-based powers',
            'Spy'
          ]
        }
      }
    },
    gender: {
      name: 'gender',
      type: 'select',
      listValues: ['Male', 'Female', 'Other'],
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.gender_label',
              default: 'Gender'
            },
            description: {}
          },
          materialIcon: 'wc',
          priority: 0 // used to order custom attributes in search UI
        }
      }
    },
    stelaceStaffPick: {
      name: 'stelaceStaffPick',
      type: 'boolean',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.staff_pick_label',
              default: 'Stelace Staff pick'
            },
            description: {}
          },
          materialIcon: 'favorite',
          priority: 80
        }
      }
    },
    environmentHero: {
      name: 'environmentHero',
      type: 'boolean',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.environment_label',
              default: 'Environment Hero'
            },
            description: {}
          },
          materialIcon: 'star',
          priority: 100
        }
      }
    },
    starring: {
      name: 'starring',
      type: 'tags',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.starring_label',
              default: 'Starring'
            },
            description: {}
          },
          materialIcon: 'theaters',
          priority: 2
        }
      }
    },
    history: {
      name: 'history',
      type: 'text',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.history_label',
              default: 'History'
            },
            description: {}
          }
        }
      }
    },
    visitorMissions: {
      name: 'visitorMissions',
      type: 'number',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.visitor_missions_label',
              default: 'Missions assigned by visitors'
            },
            description: {}
          }
        }
      }
    },
    flagged: {
      name: 'flagged',
      type: 'number',
      metadata: {
        instant: {
          i18n: {
            label: {
              entry: 'instant',
              field: 'config.customAttributes.flagged_label',
              default: 'Flagged'
            },
            description: {}
          }
        }
      }
    }
  },
  // Examples of other API resources that can be created with init-data script
  messages: {
    message1: {
      topicId: 'transactions::fightForEnvironment',
      content: 'Hello Nausicaa, we need your help.',
      read: true,
      senderId: 'users::goodCorp',
      receiverId: 'users::nausicaa'
    },
    message2: {
      topicId: 'transactions::fightForEnvironment',
      content: 'I will do my best.',
      conversationId: 'conversations::message1',
      read: true,
      senderId: 'users::nausicaa',
      receiverId: 'users::goodCorp'
    },
  },
  ratings: {
    nausicaaRating1: {
      score: 100,
      authorId: 'users::goodCorp',
      targetId: 'assets::nausicaa',
      transactionId: 'transactions::fightForEnvironment',
      label: 'hero:score'
    },
  },
  transactions: {
    fightForEnvironment: {
      assetId: 'assets::nausicaa',
      startDate: computeDate(new Date().toISOString(), '400d', 'past'),
      duration: { d: 360 },
      quantity: 1,
      takerId: 'users::goodCorp'
    },
  },
  users: {
    // Just an example too
    goodCorp: {
      username: `good.corp@gmail.com`,
      password: 'good.corp@gmail.com',
      email: 'good.corp@gmail.com',
      displayName: 'Good Corp.',
      roles: ['user'],
      metadata: {
        _private: {
          phone: '+33 1 23 45 67 89',
        },
      },
      platformData: {
        instant: {
          accountActive: true,
        }
      },
    },
    // let’s suppose nausicaa hero is also a user
    nausicaa: {
      username: `nausicaa@odyssey.com`,
      password: 'nausicaa@odyssey.com',
      email: 'nausicaa@odyssey.com',
      displayName: 'Nausicaa',
      roles: ['provider'],
      metadata: {
      },
      platformData: {
        superHeroAsset: true,
        assetId: 'assets::nausicaa'
      }
    }
  },
  /* eslint-disable no-template-curly-in-string */
  // '`${computed.var}`' template strings can be used in plain strings in Workflows,
  // and will be evaluated during run.
  // Please note that backticks ` are not needed in endpointUri nor in endpointHeaders,
  // where only strings are expected and parsed as template strings anyway.

  // You can also use Workflow contexts for easier maintenance.
  // Please refer to API reference and docs (https://stelace.com/docs/command/workflows)
  workflows: {
    flagVisitorHero: {
      name: 'flagVisitorHero',
      description: `
        Flags hero using custom Event. Deactivates this Asset if it has already been flagged in the past.
        Final step notifies staff with Slack webhook.
      `,
      event: 'flag_hero', // custom Event name triggering this Workflow
      computed: {
        // Using simple JavaScript expressions and lodash
        shouldFlag: '!asset.platformData.createdByStelace && _.get(asset, "metadata.flags", 0) > 0'
      },
      run: [
        {
          name: 'flag',
          description: 'Deactivates Hero Asset if already flagged before.',
          endpointMethod: 'PATCH',
          endpointUri: '/assets/${asset.id}',
          endpointPayload: {
            active: 'computed.shouldFlag ? false : undefined',
            metadata: {
              flags: '_.get(asset, "metadata.flags", 0) + 1'
            }
          }
        },
        {
          name: 'flagSlackNotif',
          description: 'Notify Team on Slack when some hero is flagged.',
          endpointMethod: 'POST',
          skip: '!env.SLACK_WEBHOOK_URL', // secured environment variable set in Stelace Dashboard
          endpointUri: '${env.SLACK_WEBHOOK_URL}',
          endpointPayload: {
            text: '`${asset.name} [${asset.id}] flagged on <heroes.demo.stelace.com|live demo>.`'
          }
        }
      ]
    },

    removeVisitorHero: {
      name: 'removeVisitorHero',
      description: 'Removes Hero Asset created by visitor, triggered by a Task Event',
      event: 'remove_hero',
      run: [
        {
          endpointMethod: 'DELETE',
          endpointUri: '/assets/${asset.id}'
        }
      ]
    },

    heroSelfRemovalTask: {
      name: 'heroSelfRemovalTask',
      description: 'Create a Task to remove current hero 48 hours after creation by a visitor',
      event: 'asset__created',
      run: [
        {
          endpointMethod: 'POST',
          stop: 'asset.platformData.createdByStelace',
          endpointUri: '/tasks',
          endpointPayload: {
            executionDate: 'new Date(new Date().getTime() + 48 * 3600 * 1000).toISOString()',
            eventType: '"remove_hero"',
            eventObjectId: 'asset.id'
          }
        }
      ]
    },

    missionRefreshTask: {
      name: 'missionRefreshTask',
      description: 'Create a Task to randomly assign a new mission to current hero when idle',
      event: 'asset__created',
      run: [
        {
          description: 'Task Event triggered every minute',
          endpointMethod: 'POST',
          endpointUri: '/tasks',
          endpointPayload: {
            recurringPattern: `"${ // Mind the quotes
              dailyMissions
                ? `* ${new Date().getUTCHours() + 1} * * *` // at next rounded hour, on every day
                : '* * * * *' // every minute
            }"`,
            eventType: '"assign_mission"',
            eventObjectId: 'asset.id'
          }
        }
      ]
    },

    assignRandomMissionToHero: {
      name: 'assignRandomMissionToHero',
      description: 'Randomly assign a mission to idle hero and update their location.',
      event: 'assign_mission',
      computed: {
        // Can only use string literals to evaluate in computed currently, not objects
        sw: JSON.stringify(nycBounds.sw),
        ne: JSON.stringify(nycBounds.ne),
        // TODO: showcase more complex use case with transactions and availabilities
        isVisitorMission: '!!metadata.visitorMission',
        // roll a dice before assigning random missions (say to heroes getting 5 or 6)
        hasNewMission: '!!metadata.visitorMission || Math.floor(Math.random() * 6) <= 1',
        longMissionEndDate: `new Date().getTime() + ${longMissionDurationInHours} * 60 * 60 * 1000`,
        shortMissionEndDate: `new Date().getTime() + 30 * 1000 * ${dailyMissions ? 60 : 1}`,
        now: 'new Date().getTime()'
      },
      run: [
        {
          // named step for easier reference below using responses.assignMission
          name: 'assignMission',
          description: `
            Only assigns a new mission if mission previously assigned by visitor has ended.
            Visitor missions have highest priority and are assigned ignoring current short missions.
          `,
          stop: '!computed.missionEnded || _.isEmpty(asset)', // asset can be removed before receiving some event
          skip: '!computed.hasNewMission',
          computed: {
            // Can only use string literals to evaluate in computed currently, not objects
            latitude: 'computed.sw.latitude + Math.random() * (computed.ne.latitude - computed.sw.latitude)',
            longitude: 'computed.ne.longitude + Math.random() * (computed.sw.longitude - computed.ne.longitude)',
            end: '_.get(asset, "metadata.endOfMission", 0)',
            // visitor mission has highest priority
            missionEnded: 'computed.isVisitorMission || !computed.end || computed.now > computed.end',
            newEndOfMission: 'computed.isVisitorMission ? computed.longMissionEndDate : computed.shortMissionEndDate'
          },
          endpointMethod: 'PATCH',
          endpointUri: '/assets/${asset.id}',
          endpointPayload: {
            locations: '[{ latitude: computed.latitude, longitude: computed.longitude }]',
            customAttributes: {
              // Don’t increment if it’s not a visitor mission, using undefined (ignored)
              visitorMissions: 'computed.isVisitorMission ? _.get(asset, "customAttributes.visitorMissions", 0) + 1 : undefined'
            },
            metadata: {
              endOfMission: 'computed.newEndOfMission',
              visitorMission: 'computed.isVisitorMission',
              requesterName: 'metadata.requesterName || null'
            }
          }
        },
        {
          name: 'signalHeroStatus',
          description: 'Send signal to refresh UI',
          skip: '!computed.missionEnded && !computed.hasNewMission',
          endpointMethod: 'POST',
          endpointUri: '/signal',
          endpointPayload: {
            message: {
              heroId: 'asset.id',
              hero: 'responses.assignMission || asset',
              visitorMission: 'computed.isVisitorMission',
              requesterName: 'metadata.requesterName'
            },
            // destination: '', // broadcast to all channels by default when no destination is specified
            event: '"hero_status"'
          }
        }
      ]
    },
  }
  /* eslint-enable no-template-curly-in-string */
}
