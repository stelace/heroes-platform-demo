<script>
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'
import { debounce, groupBy, isEmpty, isPlainObject, pickBy, values } from 'lodash'
import { date } from 'quasar'

import CustomAttributesEditor from 'src/components/CustomAttributesEditor'
// import DateRangePicker from 'src/components/DateRangePicker'

export default {
  components: {
    CustomAttributesEditor,
    // DateRangePicker,
    DemoIntroDialog: () => import(/* webpackChunkName: 'demo' */ 'src/components/DemoIntroDialog')
  },
  data () {
    return {
      debounceSearchAssets: debounce(this.searchAssets, 500),
      selectedCustomAttributes: {},
      sortVariables: [{
        price: 'pricing.price_short_label'
      }, {
        speed: 'instant.config.customAttributes.speed_label'
      }],
      sortBy: null,
      sortOrder: null
    }
  },
  computed: {
    selectedSearchModeLabel () {
      if (!this.search.searchMode) {
        return ''
      }
      return this.$t({ id: `form.search.modes.${this.search.searchMode}` })
    },
    sortLabel () {
      if (this.sortBy) {
        return this.$t({ id: values(this.sortBy)[0] })
      }
      return this.$t({ id: 'form.search.sort' })
    },
    isSearch () {
      return this.route.name === 'search'
    },
    searchLocationName () {
      return this.search.queryLocation
    },
    showPriceRangeFilter () {
      return this.search.priceRange.min !== this.search.priceDefaultMin ||
        this.search.priceRange.max !== this.search.priceDefaultMax
    },
    showFilterDialog () {
      return this.search.showFilterDialog
    },
    datePickerDate () {
      if (!this.search.startDate) return null
      return date.formatDate(this.search.startDate, 'YYYY/MM/DD')
    },
    displayCustomAttributes () {
      return this.search.displayCustomAttributes
    },
    customAttributes () {
      const attrs = this.common.customAttributesById
      const activeNames = this.displayCustomAttributes

      return values(attrs).filter((ca) => activeNames.includes(ca.name))
    },
    customAttributesByType () {
      const customAttributes = this.customAttributes // ensure Vue reactivity
      return groupBy(customAttributes, ca => ca.type)
    },
    nbActiveCustomAttributes () {
      let nb = Object.keys(pickBy(this.search.searchFilters.customAttributesFilters)).length
      const speed = this.search.searchFilters.customAttributesFilters.speed
      const isDefaultSpeedRange = isPlainObject(speed) &&
        (!speed.gte || speed.gte === this.search.minSpeed) &&
        (!speed.lte || speed.lte === this.search.maxSpeed)
      const abilities = this.search.searchFilters.customAttributesFilters.abilities

      if (isDefaultSpeedRange) nb--
      if (abilities && isEmpty(abilities)) nb--

      return nb
    },
    displayStartDate () {
      if (!this.search.startDate) return
      return this.$t({ id: 'time.date_short' }, { date: new Date(this.search.startDate) })
    },
    displayEndDate () {
      if (!this.search.endDate) return
      return this.$t({ id: 'time.date_short' }, { date: new Date(this.search.endDate) })
    },
    ...mapState([
      'layout',
      'route',
      'search',
      'style',
      'common',
    ]),
    ...mapGetters([
      'isDemoMode',
      'isSearchMapVisible',
      'searchOptions',
      'searchModes'
    ])
  },
  methods: {
    toggleSearchMap (visible) {
      this.$store.commit(mutationTypes.TOGGLE_SEARCH_MAP, { visible, save: true })
    },
    toggleFilterDialog () {
      this.$store.commit(mutationTypes.TOGGLE_FILTER_DIALOG)
      if (this.search.showFilterDialog) this.showDemoIntroDialog('search')
    },
    hideFilterDialog () {
      this.$store.commit(mutationTypes.HIDE_FILTER_DIALOG)
    },
    hideStartDatePopup () {
      this.$refs.startDatePopup.hide()
    },
    setDates ({ startDate, endDate }) {
      const dates = {}

      if (startDate || startDate === null) {
        dates.startDate = startDate ? new Date(startDate).toISOString() : null
      }
      if (endDate || endDate === null) {
        dates.endDate = endDate ? new Date(endDate).toISOString() : null
      }

      this.$store.commit({
        type: mutationTypes.SET_SEARCH_DATES,
        ...dates
      })

      this.hideStartDatePopup()

      this.searchAssets()
    },
    resetPriceRange () {
      this.setDisplayPriceRange()
      this.setPriceRange()
      this.searchAssets()
    },
    setPriceRange () {
      this.$store.commit(mutationTypes.SET_PRICE_RANGE, {
        min: this.search.displayPriceRange.min,
        max: this.search.displayPriceRange.max
      })
    },
    setDisplayPriceRange ({ min, max } = {}) {
      this.$store.commit(mutationTypes.SET_DISPLAY_PRICE_RANGE, {
        min: Number.isFinite(min) ? min : this.search.priceDefaultMin,
        max: Number.isFinite(max) ? max : this.search.priceDefaultMax
      })
    },
    setDisplaySpeedRange ({ min, max } = {}) {
      this.$store.commit(mutationTypes.SET_DISPLAY_SPEED_RANGE, {
        min: Number.isFinite(min) ? min : this.search.minSpeed,
        max: Number.isFinite(max) ? max : this.search.maxSpeed
      })
      this.changeCustomAttributes({
        speed: { gte: min, lte: max }
      })
    },
    selectSearchMode (searchMode) {
      if (searchMode === this.search.searchMode) return

      this.$store.dispatch('selectSearchMode', { searchMode })
      this.searchAssets()
    },
    changeCustomAttributes (customAttributes) {
      this.selectedCustomAttributes = Object.assign({}, this.selectedCustomAttributes, customAttributes)
    },
    resetCustomAttributes () {
      this.selectedCustomAttributes = {}
      this.setDisplaySpeedRange()
    },
    setCustomAttributes () {
      this.$store.commit(mutationTypes.SEARCH__SET_SEARCH_FILTERS, {
        customAttributesFilters: this.selectedCustomAttributes
      })
    },
    sort (v) {
      this.sortBy = v

      if (!v || !this.sortOrder) this.sortOrder = 'desc'

      this.$store.commit(mutationTypes.SEARCH__SET_SEARCH_FILTERS, {
        orderBy: !isEmpty(v) ? [Object.keys(v)[0]] : null,
        order: this.sortOrder
      })
      this.triggerSearch()
    },
    toggleSortOrder () {
      this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
      this.$store.commit(mutationTypes.SEARCH__SET_SEARCH_FILTERS, {
        order: this.sortOrder
      })
      this.triggerSearch()
    },
    triggerSearch () {
      this.setPriceRange()
      this.setCustomAttributes()

      this.searchAssets()
    },
    async resetSearchLocation () {
      this.$store.commit({
        type: mutationTypes.UNSET_SEARCH_LOCATION
      })

      this.searchAssets()
    },
    async searchAssets () {
      if (this.isSearch) {
        await this.$store.dispatch('searchAssets')
      } else {
        this.$router.push({ name: 'search' })
      }
    }
  }
}
</script>

<template>
  <QToolbar
    v-if="isSearch && !layout.isMenuOpened"
    class="search-filters-toolbar text-weight-medium"
  >
    <QBtnDropdown
      v-if="searchModes.length > 1"
      class="q-ml-xs"
      :label="selectedSearchModeLabel"
      :rounded="style.roundedTheme"
      color="transparent"
      text-color="primary"
      icon="search"
      unelevated
      no-caps
      dense
    >
      <QList>
        <QItem
          v-for="mode in searchModes"
          :key="mode"
          v-close-popup
          clickable
          @click="selectSearchMode(mode)"
        >
          <QItemSection>
            <QItemLabel>
              <AppContent
                entry="form"
                :field="`search.modes.${mode}`"
              />
            </QItemLabel>
          </QItemSection>
        </QItem>
      </QList>
    </QBtnDropdown>

    <QChip
      v-show="displayStartDate"
      clickable
      outline
      :removable="!!search.startDate"
      :square="!style.roundedTheme"
      color="primary"
      @remove="setDates({ startDate: null, endDate: null })"
    >
      {{ displayStartDate || $t({ id: 'time.start_date_label' }) }}
      <QPopupProxy
        ref="startDatePopup"
        :offset="[0,8]"
      >
        <div>
          <QDate
            :value="datePickerDate"
            @input="startDate => setDates({ startDate })"
          />
        </div>
      </QPopupProxy>
    </QChip>

    <QIcon
      v-show="displayStartDate && displayEndDate"
      name="arrow_forward"
      color="default-color"
    />

    <QChip
      v-show="displayEndDate"
      clickable
      outline
      :removable="!!search.endDate"
      :square="!style.roundedTheme"
      color="primary"
      @remove="setDates({ endDate: null })"
    >
      {{ displayEndDate || $t({ id: 'time.end_date_label' }) }}
      <QPopupProxy
        ref="endDatePopup"
        :offset="[0,8]"
      >
        <QDate
          :value="datePickerDate"
          @input="endDate => setDates({ endDate })"
        />
      </QPopupProxy>
    </QChip>

    <QChip
      v-show="showPriceRangeFilter"
      clickable
      removable
      outline
      :square="!style.roundedTheme"
      color="primary"
      @remove="resetPriceRange()"
    >
      <AppContent
        entry="pricing"
        field="price_range_short"
        :options="{ lower_price: search.priceRange.min, upper_price: search.priceRange.max }"
      />
    </QChip>

    <QChip
      v-show="searchLocationName"
      clickable
      removable
      outline
      :square="!style.roundedTheme"
      color="primary"
      @remove="resetSearchLocation"
    >
      {{ searchLocationName }}
    </QChip>

    <QChip
      clickable
      outline
      :removable="nbActiveCustomAttributes > 0"
      :square="!style.roundedTheme"
      color="primary"
      @click="toggleFilterDialog"
      @remove="resetCustomAttributes(); triggerSearch()"
    >
      <AppContent
        entry="form"
        field="search.filters"
      />
      <QBadge
        v-show="nbActiveCustomAttributes"
        class="filter-count-badge q-ml-sm"
        color="primary"
      >
        {{ nbActiveCustomAttributes || '' }}
      </QBadge>
    </QChip>

    <QBtn
      v-show="sortBy"
      class="sort-button"
      :icon="sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'"
      color="primary"
      flat
      dense
      @click.stop="toggleSortOrder"
    />
    <QBtnDropdown
      class="q-ml-xs"
      :label="sortLabel"
      :rounded="style.roundedTheme"
      color="transparent"
      text-color="primary"
      icon="sort"
      icon-right=""
      unelevated
      no-caps
      dense
    >
      <QList>
        <QItem
          v-for="(v, i) in sortVariables"
          :key="i"
          v-close-popup
          clickable
          @click="sort(v)"
        >
          <QItemSection>
            <QItemLabel>
              {{ $t({ id: v[Object.keys(v)[0]] }) }}
            </QItemLabel>
          </QItemSection>
        </QItem>
        <QItem
          v-show="sortBy"
          v-close-popup
          clickable
          @click="sort(null)"
        >
          <QItemSection>
            <QItemLabel>
              <AppContent
                tag="div"
                entry="form"
                field="search.default_sorting_details"
              />
              <AppContent
                tag="div"
                class="text-grey"
                entry="form"
                field="search.default_sorting"
              />
            </QItemLabel>
          </QItemSection>
        </QItem>
      </QList>
    </QBtnDropdown>

    <QDialog
      :value="showFilterDialog"
      maximized
      transition-show="slide-left"
      transition-hide="slide-right"
      content-class="filter-dialog"
      @hide="hideFilterDialog"
    >
      <div class="row">
        <div class="dialog-filters col-12 col-md-8 bg-white q-pa-lg">
          <div class="row justify-between">
            <AppContent
              class="text-subtitle1"
              tag="div"
              entry="pricing"
              field="price_label"
            />
            <AppContent
              entry="pricing"
              field="price_range_short"
              :options="{
                lower_price: search.displayPriceRange.min,
                upper_price: search.displayPriceRange.max
              }"
            />
          </div>
          <QRange
            :value="search.displayPriceRange"
            :min="search.priceDefaultMin"
            :max="search.priceDefaultMax"
            :step="200"
            snap
            @input="setDisplayPriceRange"
          />

          <!-- Uncomment this to enable date search filters -->
          <!-- <DateRangePicker
            class="q-my-lg"
            :start-date="search.startDate"
            :end-date="search.endDate"
            :missing-end-date-meaning="$t({ id: 'time.missing_end_date_meaning' })"
            bottom-slots
            @changeStartDate="startDate => setDates({ startDate })"
            @changeEndDate="endDate => setDates({ endDate })"
          /> -->

          <div
            v-if="displayCustomAttributes.length"
            class="q-mt-md"
          >
            <AppContent
              class="text-subtitle1"
              tag="div"
              entry="form"
              field="search.features_label"
            />
            <CustomAttributesEditor
              :definitions="customAttributes.filter(ca => ca.name !== 'speed')"
              :values="search.searchFilters.customAttributesFilters"
              @change="changeCustomAttributes"
            />

            <div class="q-pt-lg">
              <div class="row justify-between q-my-md">
                <AppContent
                  class="text-subtitle1"
                  tag="div"
                  entry="instant"
                  field="config.customAttributes.speed_label"
                />

                <AppContent
                  entry="number"
                  field="range"
                  :options="{
                    lower: search.displaySpeedRange.min,
                    upper: search.displaySpeedRange.max
                  }"
                />
              </div>

              <QRange
                :value="search.displaySpeedRange"
                :min="0"
                :max="100"
                snap
                @input="setDisplaySpeedRange"
              />
            </div>
          </div>

          <div class="text-center q-my-lg">
            <AppRunningOn link="https://stelace.com/docs/search/" flat>
              <AppContent entry="stelace" field="search_api" />
            </AppRunningOn>
          </div>

          <div class="row justify-end items-center q-mt-lg">
            <QBtn
              v-close-popup
              class="text-weight-medium q-mr-md"
              :label="$t({ id: 'navigation.close' })"
              :rounded="style.roundedTheme"
              color="primary"
              flat
              no-caps
            />

            <QBtn
              v-close-popup
              class="text-weight-medium'"
              :label="$t({ id: 'navigation.search' })"
              :to="{ name: 'search' }"
              :rounded="style.roundedTheme"
              color="secondary"
              size="lg"
              no-caps
              @click="triggerSearch"
            />
          </div>
        </div>
        <div
          v-close-popup
          class="gt-sm col-md-4 bg-transparent"
        />
      </div>
    </QDialog>

    <DemoIntroDialog v-if="isDemoMode" ref="introDialog" />

    <QSpace />

    <QToggle
      class="text-default-color gt-sm"
      :value="isSearchMapVisible"
      :label="$t({ id: 'pages.search.show_map' })"
      color="positive"
      checked-icon="check"
      unchecked-icon="close"
      left-label
      @input="toggleSearchMap"
    />
  </QToolbar>
</template>

<style lang="stylus" scoped>
.search-filters-toolbar
  border-top 1px solid #EEE

.sort-button
  margin-right: -0.5rem

.dialog-filters
  max-height: 100%
  overflow: auto
</style>
