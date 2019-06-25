<template>
  <div class="map-container">
    <Mapbox
      v-bind="$attrs"
      :map-options="options"
      :nav-control="control"
      :access-token="accessToken"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import 'mapbox-gl/dist/mapbox-gl.css'
import { uniqueId } from 'lodash'

export default {
  components: {
    Mapbox: () => import(/* webpackChunkName: 'mapbox' */ 'mapbox-gl-vue')
  },
  props: {
    mapOptions: {
      type: Object,
      default: () => ({}),
    },
    navControl: {
      type: Object,
      default: () => ({}),
    },
    accessToken: {
      type: String,
      default: process.env.VUE_APP_MAPBOX_TOKEN || '',
    }
  },
  data () {
    const defaultMapOptions = {
      container: uniqueId('stl-app-map-'), // ensuring that coexisting maps have unique Ids
      // Note: Update component map style rule if changing this pattern
      style: process.env.VUE_APP_MAPBOX_STYLE,
      center: [-73.95, 40.70], // Hard coded. Could get this from config
      zoom: 11,
      minZoom: 11, // same for zoom levels
      maxZoom: 11,
    }

    const defaultNavControl = {
      show: false
    }

    return {
      options: defaultMapOptions,
      control: defaultNavControl
    }
  },
  beforeMount () {
    if (Object.keys(this.mapOptions || {}).length) {
      this.options = Object.assign({}, this.options, this.mapOptions)
    }
  }
}
</script>

<style lang="stylus" scoped>
.map-container
  background-color: $map-background-color
  &:not([class*="absolute-"])
    position relative

[id^="stl-app-map-"]
  position absolute
  top 0
  right 0
  bottom 0
  left 0
</style>

<style lang="stylus">
$stl-map-marker-height = 27px
$stl-map-marker-border-bottom-width = 2px
$stl-map-marker-triangle-height = 6px
$stl-map-marker-z-index = 1
$stl-map-marker-border-color = $positive
$stl-map-marker-border-busy-color = $warning
$stl-map-marker-border-mission-color = $negative

// Pulling top by for accurate triangle position
// Note that quasar-inherited box-sizing is 'border-box' so we can ignore top border
// but we need to deduce bottom border since triangle comes on top of it.
$stl-map-marker-margin-top = - floor(($stl-map-marker-height - $stl-map-marker-border-bottom-width) / 2) \
  - $stl-map-marker-triangle-height

.stl-map-marker
  background-position: center center
  background-size: cover
  width: $stl-map-marker-height * (4 / 3)
  height: 27px
  margin-top: $stl-map-marker-margin-top
  border-radius: 3px
  border: 1px solid $stl-map-marker-border-color
  border-bottom: $stl-map-marker-border-bottom-width solid $stl-map-marker-border-color
  cursor: pointer
  z-index: $stl-map-marker-z-index

  &.-busy
    border: 1px solid $stl-map-marker-border-busy-color
    border-bottom: $stl-map-marker-border-bottom-width solid $stl-map-marker-border-busy-color
    &:after
      border-top-color: $stl-map-marker-border-busy-color
  &.-visitor-mission
    border: 1px solid $stl-map-marker-border-mission-color
    border-bottom: $stl-map-marker-border-bottom-width solid $stl-map-marker-border-mission-color
    &:after
      border-top-color: $stl-map-marker-border-mission-color

  &:after // triangle
    content: ""
    display: block
    width: 0
    height: 0
    border: inset 6px
    border-color: $stl-map-marker-border-color transparent transparent transparent
    border-top-style: solid
    position: relative
    top: 100%
    left: 50%
    transform: translateX(-50%)

.stl-map-search-popup
  width: 13rem
  z-index: $stl-map-marker-z-index + 2
  .mapboxgl-popup-content
    padding: 0 0 5px
    width: 100%
  .asset-card-container
    width: 100%
  .asset-card.asset-card // override default asset-card animation
    &:focus, &:hover
      .asset-image, .asset-content
        transform: none

.stl-map-marker--bounce
  animation: mapMarkerBounce 0.35s ease infinite alternate
  z-index: $stl-map-marker-z-index + 1

@keyframes mapMarkerBounce
  from
    margin-top: $stl-map-marker-margin-top
  to
    margin-top: $stl-map-marker-margin-top * 1.4
</style>
