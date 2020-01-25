
<script>
/* global mapboxgl */
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'

import bezierEasing from 'bezier-easing'
import { debounce, get, keys, set } from 'lodash'
import { event as gaEvent } from 'vue-analytics'
import { matFlag } from '@quasar/extras/material-icons'

import EventBus from 'src/utils/event-bus'
import p from 'src/utils/promise'

import AppMiniLogo from 'src/components/AppMiniLogo'
import AssetCard from 'src/components/AssetCard'

import PageComponentMixin from 'src/mixins/pageComponent'

// This can help: https://easings.net/
const easeInOutCubic = bezierEasing(0.645, 0.045, 0.355, 1)
const debounceMovesDuration = 3000

export default {
  components: {
    AppMap: () => import(/* webpackChunkName: 'mapbox' */ 'mapbox-gl')
      .then(mapbox => {
        if (window && !window.mapboxgl) window.mapboxgl = mapbox.default
        return import(/* webpackChunkName: 'mapbox' */ 'src/components/AppMap')
      }),
    AppMiniLogo,
    DemoIntroDialog: () => import(/* webpackChunkName: 'demo' */ 'src/components/DemoIntroDialog')
  },
  mixins: [
    PageComponentMixin,
  ],
  data () {
    return {
      // map: null, // DON’T keep map object in Vue, this BREAKS the map (probably reactivity)
      mapSized: false,
      populatedMapMarkers: { // Keep track of generated popup contents.
        // assetId: markerDOMElement // to clean up before destroy
      },
      assetCoordinates: { // keep track of [lon,lat] coordinates for animations
        // assetId: [0,0]
      },
      missionDialogAssetId: '',
      descriptionOpened: false,
      openDescriptionTimeout: null,
      debounceMapRefresh: debounce(this.refreshMap, debounceMovesDuration, {
        leading: true,
        trailing: true
      })
    }
  },
  computed: {
    missionDialogAsset () {
      return this.searchedAssets.find(a => a.id === this.missionDialogAssetId)
    },
    missionDuration () {
      const config = this.common.config
      return get(config, 'stelace.instant.longMissionDurationInHours', 1)
    },
    isMissionDialogAssetAvailable () {
      return this.missionDialogAsset.available !== false && this.endedMission(this.missionDialogAsset)
    },
    ...mapState([
      'auth',
      'search',
      'common',
    ]),
    ...mapGetters([
      'getBaseImageUrl',
      'getUnresizedImageUrl',
      'searchedAssets',
      'isDemoMode',
      'isSearchMapVisible',
      'defaultSearchMode',
    ]),
  },
  watch: {
    searchedAssets () {
      this.debounceMapRefresh()
    },
    isSearchMapVisible (visible) {
      if (!visible) this.destroyMarkers()
    }
  },
  beforeMount () {
    if (this.$q.screen.gt.sm) this.$store.commit(mutationTypes.TOGGLE_SEARCH_MAP, { visible: true })

    // keeping track of generated markers, use assetIds as keys
    // We need full mapbox objects, stored outside of vue (reactivity not needed, and even full of bugs)
    window.stlMapMarkers = window.stlMapMarkers || {}

    EventBus.$on('missionRequested', message => {
      this.notify('notification.mission_requested', {
        i18nValues: {
          hero: message.hero.name,
          requester: message.requesterName || undefined
        },
        timeout: 10000
      })
    })
  },
  // Randomly assign short anonymous missions when loading the page using custom Event
  // Same event is also generated every minute by Stelace reccurent Task
  // In a tracking app, each asset could also generate its own custom Events (e.g. position update)
  async mounted () {
    await Promise.all([
      this.$store.dispatch('fetchConfig'),
      this.$store.dispatch('fetchAssetsRelatedResources'),
    ])

    if (!this.$store.state.search.searchMode) {
      await this.$store.dispatch('selectSearchMode', { searchMode: this.$store.getters.defaultSearchMode })
    }

    await this.$store.dispatch('searchAssets')
    this.$store.dispatch('getHighestPrice')

    await new Promise(resolve => setTimeout(resolve, 2000))

    p.map(this.searchedAssets.filter(this.endedMission), async asset => {
      await this.$store.dispatch('sendCustomEvent', {
        type: 'assign_mission',
        objectId: asset.id
      })
    }, { concurrency: 2 })
  },
  beforeDestroy () {
    this.$store.commit(mutationTypes.TOGGLE_FILTER_DIALOG, { visible: false })

    EventBus.$off('missionRequested')

    this.destroyMarkers()
    delete window.stlMapMarkers
  },
  created () {
    this.icons = {
      matFlag,
    }
  },
  methods: {
    async afterAuth () {
      // refresh search results based on current user default search mode
      if (!this.search.searchMode) {
        await this.$store.dispatch('selectSearchMode', { searchMode: this.defaultSearchMode })
      }

      await this.$store.dispatch('searchAssets')
    },
    sendMissionCustomEvent () {
      const objectId = this.missionDialogAssetId
      const requesterName = this.auth.requesterName
      const cb = async () => {
        this.$store.dispatch('sendCustomEvent', {
          type: 'assign_mission',
          objectId,
          metadata: {
            visitorMission: true,
            requesterName
          }
        })
      }

      // Moving on if demo mode is disabled,
      // otherwise suspend action with callback
      if (!this.showDemoIntroDialog('event', cb)) cb()

      gaEvent({
        eventCategory: 'Interaction',
        eventAction: 'heroMission',
        eventLabel: get(this.missionDialogAsset, 'name')
      })
    },
    setRequesterName (name) {
      this.$store.commit({
        type: mutationTypes.SET_REQUESTER_NAME,
        name
      })
    },
    openMissionDialog (assetId) {
      this.showDemoIntroDialog('asset')
      this.missionDialogAssetId = assetId
    },
    onCloseMissionDialog () {
      this.missionDialogAssetId = ''
    },
    mapResized () {
      this.mapSized = true
    },
    async changePage (page) {
      this.$store.commit({
        type: mutationTypes.SEARCH__SET_SEARCH_FILTERS,
        page
      })

      await this.searchAssets({ resetPagination: false })
    },
    async searchAssets ({ resetPagination } = {}) {
      await this.$store.dispatch('searchAssets', { resetPagination })
    },
    getStatusClass (asset) {
      if (get(asset, 'metadata.visitorMission')) return '-visitor-mission'
      else if (!this.endedMission(asset)) return '-busy'
      else return ''
    },
    endedMission (asset) {
      return get(asset, 'metadata.endOfMission', 0) < new Date().getTime()
    },
    getMissionTooltipField (asset) {
      if (this.getStatusClass(asset) === '-visitor-mission') return 'config.customAttributes.on_mission_label'
      else if (this.getStatusClass(asset) === '-busy') return 'config.customAttributes.on_short_mission_label'
      else return 'config.customAttributes.not_on_mission_label'
    },
    getMapFeatures () {
      return this.searchedAssets
        .filter(a => a.locations && a.locations.length)
        .map(a => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [a.locations[0].longitude, a.locations[0].latitude]
          },
          properties: {
            assetId: a.id
          }
        }))
    },
    mapLoaded (map) {
      this.map = map // raw mapbox object
      this.refreshMap()
    },
    refreshMap () {
      if (!this.map || !this.isSearchMapVisible) return

      const mapFeatures = this.getMapFeatures()
      this.destroyMarkers({ keep: this.searchedAssets.map(a => a.id) })

      if (!mapFeatures.length) return

      // Use this to fit map bounds around markers
      // Map is currently fixed

      // const firstCoordinates = mapFeatures[0].geometry.coordinates

      // Pass the first coordinates & wrap each coordinate pair in `extend` to include them in the bounds result.
      // A variation of this technique could be applied to zooming to the bounds of multiple Points or Polygon geomteries
      // - it just requires wrapping all the coordinates with the extend method.

      /* const bounds = mapFeatures.reduce(function (bounds, f) {
        return bounds.extend(f.geometry.coordinates)
      }, new mapboxgl.LngLatBounds(firstCoordinates, firstCoordinates))

      this.map.fitBounds(bounds, {
        padding: 50
      }) */

      // add new markers to map
      p.map(mapFeatures, async f => {
        const assetId = f.properties.assetId
        const asset = this.searchedAssets.find(a => a.id === assetId)
        const markerId = `marker-${assetId}`
        const imgSrc = this.getBaseImageUrl(asset)

        if (!imgSrc) return

        const el = document.createElement('div')
        el.id = markerId
        el.className = 'stl-map-marker'
        el.style.backgroundImage = `url('${imgSrc}')`

        let marker = get(window.stlMapMarkers, assetId)

        if (!marker) {
          const popupId = `map-popup-${assetId}`
          const popup = new mapboxgl.Popup({
            closeButton: false,
            className: 'stl-map-search-popup'
          }).setHTML(`<div id="${popupId}"></div>`)

          // Use render function to spare vue compiler
          const PopupContent = Vue.extend({
            components: { AssetCard },
            router: this.$router,
            store: this.$store,
            render: h => h(AssetCard, {
              props: { asset },
              attrs: { id: popupId },
              on: {
                click: () => this.openMissionDialog(assetId)
              }
            })
          })

          marker = new mapboxgl.Marker(el)
            .setLngLat(f.geometry.coordinates)
            .addTo(this.map)
            .setPopup(popup)

          set(window.stlMapMarkers, assetId, marker)
          this.assetCoordinates[assetId] = f.geometry.coordinates

          popup.on('open', async () => {
            // Mount PopupContent once
            const isPopupEmpty = !this.populatedMapMarkers[assetId]

            if (isPopupEmpty) {
              // can only mount Vue component once mapbox injects popup in DOM
              new PopupContent().$mount(`#${popupId}`)
              this.populatedMapMarkers[assetId] = document.getElementById(markerId)
              // Hack to force appropriate initial positionning
              marker.togglePopup()
              marker.togglePopup()
            }

            this.populatedMapMarkers[assetId].style.display = 'none'
          })
          popup.on('close', () => {
            // all popups (even empty ones) get closed when markers are destroyed
            if (this.populatedMapMarkers[assetId]) this.populatedMapMarkers[assetId].style.display = ''
          })
        }

        const markerEl = marker.getElement()
        const statusClass = this.getStatusClass(asset)
        if (markerEl) markerEl.classList.remove('-busy', '-visitor-mission')
        if (markerEl && statusClass) markerEl.classList.add(statusClass)

        const coordinates = this.assetCoordinates[assetId]
        const coordinatesChanged = !coordinates || coordinates.some(
          (c, i) => c !== f.geometry.coordinates[i]
        )

        const previousCoordinates = coordinates
        const intermediateCoordinates = coordinates.slice(0)
        if (coordinatesChanged) {
          this.assetCoordinates[assetId] = f.geometry.coordinates // new coordinates
        }

        // Adding some random moves to make our heroes look more natural (think about Marauder's Map)
        const moveDirection = 2 * Math.floor(Math.random() * 2) - 1
        // Mapbox docs example: https://docs.mapbox.com/mapbox-gl-js/example/animate-marker/
        // TODO: make movementSpeed depend on hero
        const moveSteps = 100
        let moveStepsRemaining = moveSteps
        // Update the data to a new position based on the animation timestamp.
        const animateHero = (timestamp) => {
          const radius = 0.0005
          // the higher the divisor, the slower the animation
          const randomMoveSpeed = 1 / 500

          if (coordinatesChanged && moveStepsRemaining) {
            moveStepsRemaining--
            const multiplier = easeInOutCubic(1 - moveStepsRemaining / moveSteps)
            intermediateCoordinates[0] = previousCoordinates[0] +
              (f.geometry.coordinates[0] - previousCoordinates[0]) * multiplier
            intermediateCoordinates[1] = previousCoordinates[1] +
              (f.geometry.coordinates[1] - previousCoordinates[1]) * multiplier
            marker.setLngLat(intermediateCoordinates)
          } else if (!get(this.populatedMapMarkers[assetId], 'style.display')) {
          // Stop random moves when hero popup is opened
            marker.setLngLat([
              f.geometry.coordinates[0] + moveDirection * Math.cos(timestamp * randomMoveSpeed) * radius,
              f.geometry.coordinates[1] + Math.sin(timestamp * randomMoveSpeed) * radius
            ])
          }

          // Request the next frame of the animation.
          requestAnimationFrame(animateHero)
        }

        // Spread animations over time
        if (coordinates && coordinatesChanged) {
          await new Promise(resolve => {
            setTimeout(resolve, 1000 + Math.round(Math.random() * (debounceMovesDuration - 1000)))
          })
        }
        requestAnimationFrame(animateHero)
      }, { concurrency: 2 }) // p.map
    },
    destroyMarkers ({ keep } = {}) {
      // Don’t keep all markers in memory when results change
      const assetMarkersToKeep = keep || []
      keys(window.stlMapMarkers).forEach(assetId => {
        if (!assetMarkersToKeep.includes(assetId)) {
          window.stlMapMarkers[assetId].remove()
          // Mapbox marker.remove destroys attached listeners and popups internally
          delete window.stlMapMarkers[assetId]
          delete this.populatedMapMarkers[assetId]
        }
      })
    },
    animateMarker (assetId, animate = true) {
      const marker = get(window.stlMapMarkers, assetId)
      const el = marker && marker.getElement()

      if (!el) return

      if (animate) el.classList.add('stl-map-marker--bounce')
      else el.classList.remove('stl-map-marker--bounce')
    },
    openDescription () {
      this.descriptionOpened = true
    },
    closeDescription () {
      this.openDescriptionTimeout = setTimeout(() => {
        this.descriptionOpened = false
      }, 300)
    },
    flagHero (assetId) {
      const cb = async () => {
        await this.$store.dispatch('sendCustomEvent', {
          type: 'flag_hero',
          objectId: assetId
        })
        this.notify('notification.flagged_content')
      }

      // Moving on if demo mode is disabled,
      // otherwise suspend action with callback
      if (!this.showDemoIntroDialog('workflow', cb)) cb()
    }
  }
}
</script>

<template>
  <QPage class="row items-stretch">
    <div :class="['col-12 q-pa-md', isSearchMapVisible ? 'col-md-7' : '']">
      <div class="row q-col-gutter-md items-start">
        <AssetCard
          v-for="asset of searchedAssets"
          :key="asset.id"
          :class="[
            'col-12 asset-card-col-xs-6 col-sm-4',
            isSearchMapVisible
              ? 'col-md-4 col-lg-3 col-xl-3'
              : 'col-md-3 col-lg-2 col-xl-2'
          ]"
          :asset="asset"
          :show-ratings="true"
          @click="openMissionDialog(asset.id)"
          @keyup.enter="openMissionDialog(asset.id)"
          @mouseenter="animateMarker(asset.id)"
          @mouseleave="animateMarker(asset.id, false)"
        >
          <template v-slot:caption>
            <div
              :class="[
                'mission-status-triangle',
                getStatusClass(asset)
              ]"
            >
              <AppContent
                tag="QTooltip"
                content-class="text-body2"
                entry="instant"
                :field="getMissionTooltipField(asset)"
                :options="{
                  requester: (asset && asset.metadata.requesterName) || undefined
                }"
              />
            </div>
          </template>
        </AssetCard>
      </div>
      <div class="row justify-center q-my-lg q-py-md">
        <QPagination
          v-show="searchedAssets.length && search.paginationMeta.nbPages > 1"
          :value="search.searchFilters.page"
          :max="search.paginationMeta.nbPages"
          :max-pages="5"
          color="grey"
          direction-links
          @input="changePage"
        />
      </div>
      <div class="q-my-lg text-center">
        <AppContent
          tag="span"
          entry="stelace"
          field="made_with_love"
        />
        <AppLink to="https://stelace.com">
          <AppMiniLogo class="with-love" />
        </AppLink>
      </div>
    </div>
    <!-- Rebuilding the map with v-if for appropriate sizing
    https://github.com/mapbox/mapbox-gl-js/issues/3265 -->
    <QPageSticky
      v-if="mapSized || isSearchMapVisible"
      v-show="isSearchMapVisible"
      class="gt-sm col-md-5 full-height"
      position="top-right"
    >
      <QNoSsr>
        <AppMap
          class="absolute-full"
          :map-options="{ interactive: false }"
          @map-resize="mapResized"
          @map-load="mapLoaded"
        />
      </QNoSsr>
    </QPageSticky>

    <QDialog
      ref="missionDialog"
      :value="!!missionDialogAsset"
      :maximized="$q.screen.lt.sm"
      @hide="onCloseMissionDialog"
    >
      <div v-if="missionDialogAsset" class="row justify-between bg-white rounded-borders mission-card">
        <div
          :class="[
            'col-12 q-pa-lg relative-position',
            !descriptionOpened ? 'col-md-7' : ''
          ]"
        >
          <AppContent
            class="q-mb-lg text-h6"
            entry="asset"
            field="checkout_intro"
            :options="{ hero: missionDialogAsset.name }"
          />
          <div v-if="isMissionDialogAssetAvailable">
            <div class="row q-pb-lg">
              <QInput
                class="col-8"
                :value="auth.requesterName"
                :label="$t({ id: 'heroes_theme.requester_name_label' })"
                :hint="$t({ id: 'heroes_theme.requester_name_context' }, { hero: missionDialogAsset.name })"
                @input="setRequesterName"
              />
            </div>
            <div class="text-center">
              <AppContent
                v-if="missionDialogAsset.price"
                tag="div"
                entry="heroes_theme"
                field="fees_comment"
                class="q-mb-md"
              />
              <QBtn
                v-close-popup
                color="primary"
                class="text-bold"
                :label="$t({ id: 'asset.checkout_action' }, {
                  price: (missionDialogAsset.price * missionDuration * 60) || undefined,
                  nbHours: missionDuration
                })"
                @click="sendMissionCustomEvent"
              />
            </div>
          </div>
          <AppContent
            v-else
            entry="notification"
            field="on_mission_until"
            :options="{
              hero: missionDialogAsset.name,
              endDate: missionDialogAsset.metadata.endOfMission
                ? new Date(missionDialogAsset.metadata.endOfMission + 60 * 1000) : undefined,
              fullDate: new Date().getUTCDate()
                !== new Date(missionDialogAsset.metadata.endOfMission + 60 * 1000).getUTCDate()
                || undefined,
              requester: missionDialogAsset.metadata.requesterName || undefined
            }"
            class="q-my-md"
          />

          <div class="text-center q-my-lg">
            <AppRunningOn link="https://stelace.com" :flat="isMissionDialogAssetAvailable">
              <AppContent entry="stelace" field="api" />
            </AppRunningOn>
          </div>

          <QExpansionItem
            :value="descriptionOpened"
            :label="$t({ id: 'asset.description_label' })"
            class="q-mt-lg"
            @show="openDescription"
            @hide="closeDescription"
          >
            <div class="text-body q-pa-md">
              {{ missionDialogAsset.description }}

              <div v-if="missionDialogAsset.customAttributes.history">
                <AppContent
                  tag="div"
                  entry="asset"
                  field="history_label"
                  class="text-italic q-my-md"
                />
                <div>
                  {{ missionDialogAsset.customAttributes.history }}
                </div>
              </div>
            </div>
          </QExpansionItem>
          <div class="text-center q-my-md">
            <QBtn
              v-close-popup
              class="flag-text text-grey"
              flat
              no-caps
              :icon="icons.matFlag"
              @click="flagHero(missionDialogAsset.id)"
            >
              <AppContent class="q-pl-sm" entry="prompt" field="flag_content" />
            </QBtn>
          </div>
          <QBtn
            v-close-popup
            flat
            class="absolute-top-right xs text-h6"
            label="X"
            :aria-label="$t({ id: 'navigation.close' })"
          />
        </div>
        <div
          v-show="!descriptionOpened"
          class="col-12 col-md-5 relative-position"
        >
          <QImg
            v-if="missionDialogAsset"
            class="mission-image"
            :src="getUnresizedImageUrl(missionDialogAsset, {
              index: missionDialogAsset.metadata.images.length > 1 ? 1 : 0
            })"
            :alt="missionDialogAsset.name"
          />
        </div>
      </div>
    </QDialog>

    <DemoIntroDialog v-if="isDemoMode" ref="introDialog" />
  </QPage>
</template>

<style lang="stylus" scoped>
.asset-card-col-xs-6
  @media (min-width: 480px) and (max-width: $breakpoint-xs-max)
    width: 50%
.mission-card
  min-width: 65vw
  min-height: 15vw
  @media (max-width: $breakpoint-xs-max)
    align-content: flex-start
  .mission-image
    @media (min-width: $breakpoint-md-min)
      position: absolute
      top: 0
      right: 0
      bottom: 0
      left: 0
</style>
