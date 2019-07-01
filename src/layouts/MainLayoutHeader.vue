<script>
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'

import AppLocaleSwitch from 'src/components/AppLocaleSwitch'
import AppLogo from 'src/components/AppLogo'
import AppMiniLogo from 'src/components/AppMiniLogo'
import SearchToolbar from 'src/components/SearchToolbar'
import SelectCategories from 'src/components/SelectCategories'

import AuthDialogMixin from 'src/mixins/authDialog'

export default {
  components: {
    AppLocaleSwitch,
    AppLogo,
    AppMiniLogo,
    SearchToolbar,
    SelectCategories,
  },
  mixins: [
    AuthDialogMixin,
  ],
  data () {
    return {
      priceInputTouched: false,
      searchByCategory: process.env.VUE_APP_SEARCH_BY_CATEGORY === 'true',
      creatingOrganization: false,
      aboutDialogOpened: false
    }
  },
  computed: {
    isMenuOpened () {
      return this.layout.isMenuOpened
    },
    isHome () {
      return this.route.name === 'home'
    },
    isSearch () {
      return this.route.name === 'search'
    },
    selectedCategory () {
      const selectedCategoryId = this.search.searchFilters.filters.categoryId
      if (!selectedCategoryId) return null

      const category = this.common.categoriesById[selectedCategoryId]
      return category
    },
    maximumPrice () {
      if (!this.priceInputTouched) return ''

      return this.search.priceRange.max
    },
    accountName () {
      return this.currentUser.firstName // TODO: i18n for name/familyName order
        ? `${this.currentUser.firstName} ${this.currentUser.lastName || ''}` : this.currentUser.displayName
    },
    showAccountAvatar () {
      return this.$q.screen.gt.xs
    },
    ...mapState([
      'common',
      'content',
      'layout',
      'search',
      'style',
      'route',
      'auth',
    ]),
    ...mapGetters([
      'currentUser',
      'defaultSearchMode'
    ]),
  },
  methods: {
    toggleMenu (visible = !this.isMenuOpened) {
      this.$store.commit(mutationTypes.LAYOUT__TOGGLE_MENU, { visible })
    },
    logout () {
      this.$store.dispatch('logout')

      if (this.$route.meta.mustBeLogged) {
        this.$router.push({ path: '/' })
      }
    },
    async searchAssets () {
      if (this.isSearch) {
        await this.$store.dispatch('searchAssets')
      } else {
        this.$router.push({ name: 'search' })
      }
    },
    updateQuery (query) {
      this.$store.commit(mutationTypes.SET_SEARCH_QUERY, { query })

      this.searchAssets()
    },
    selectCategory (category) {
      this.$store.commit({
        type: mutationTypes.SEARCH__SET_SEARCH_FILTERS,
        filters: {
          categoryId: category && category.id
        }
      })

      this.searchAssets()
    },
    selectPlace (place) {
      if (place) {
        this.$store.commit({
          type: mutationTypes.SET_SEARCH_LOCATION,
          queryLocation: place.shortDisplayName,
          latitude: place.latitude,
          longitude: place.longitude
        })
      } else {
        this.$store.commit({
          type: mutationTypes.UNSET_SEARCH_LOCATION
        })
      }

      this.searchAssets()
    },
    updateMaxPrice (maximumPrice) {
      if (isNaN(maximumPrice)) return

      this.priceInputTouched = true

      let maxPrice
      if (maximumPrice === '') {
        maxPrice = this.search.priceDefaultMax
        this.priceInputTouched = false
      } else {
        maxPrice = maximumPrice
      }

      this.$store.commit(mutationTypes.SET_PRICE_RANGE, {
        min: this.search.priceRange.min,
        max: maxPrice
      })

      this.searchAssets()
    },
    resetMaxPrice () {
      this.priceInputTouched = false

      this.$store.commit(mutationTypes.SET_PRICE_RANGE, {
        min: this.search.priceRange.min,
        max: this.search.priceDefaultMax
      })

      this.searchAssets()
    }
  }
}
</script>

<template>
  <QHeader
    reveal
    :bordered="!isHome && !isMenuOpened"
    :reveal-offset="100"
    :class="[
      isHome ? 'q-pa-md transparent-header' : 'bg-white',
      isMenuOpened ? 'header--raise-above-menu-dialog' : ''
    ]"
  >
    <QToolbar>
      <AppLink
        v-if="showAccountAvatar"
        :class="[
          isHome ? '' : 'text-primary',
          'logo-container anchor-text--reset cursor-pointer q-mr-sm flex flex-center'
        ]"
        :to="{ name: 'home' }"
        :aria-label="$t({ id: 'navigation.home' })"
        flat
      >
        <AppLogo class="company-logo q-mr-sm" />
      </AppLink>

      <QBtn
        v-else
        :class="[isHome ? '' : 'text-primary', 'logo-container q-mr-sm']"
        :aria-label="$t({ id: 'navigation.menu' })"
        flat
        @click="toggleMenu"
      >
        <AppMiniLogo class="company-mini-logo xs" />
      </QBtn>

      <div
        v-show="!isHome && !isMenuOpened"
        class="header__search-bar row no-wrap shadow-2 q-px-sm q-mr-md"
      >
        <QInput
          v-if="!searchByCategory"
          :value="search.query"
          :input-class="search.query ? 'text-right' : ''"
          :placeholder="$t({ id: 'form.search.query_placeholder' })"
          :debounce="500"
          dense
          @input="updateQuery"
        >
          <template v-slot:prepend>
            <QBtn
              :aria-label="$t({ id: 'form.search.query_placeholder' })"
              color="primary"
              icon="search"
              flat
              dense
              rounded
              @click="searchAssets"
            />
          </template>
          <template v-slot:append>
            <QIcon
              v-show="search.query.length"
              class="cursor-pointer"
              name="close"
              @click="updateQuery('')"
            />
          </template>
        </QInput>
        <SelectCategories
          v-if="searchByCategory"
          :initial-category="selectedCategory"
          :hide-input-on-select="true"
          :label="$t({ id: 'form.search.query_placeholder' })"
          :icon-button-action="searchAssets"
          dense
          icon-color="primary"
          search-icon-position="left"
          @change="selectCategory"
        />

        <QInput
          :value="maximumPrice"
          :label="$t({ id: 'form.search.maximum_price' })"
          class="gt-md"
          input-class="text-right"
          type="number"
          min="0"
          dense
          @input="updateMaxPrice"
        >
          <template v-slot:prepend>
            <QIcon
              :name="content.currency === 'EUR' ? 'euro_symbol' : 'attach_money'"
              color="grey-4"
            />
          </template>
          <template v-slot:append>
            <QIcon
              :class="['cursor-pointer', maximumPrice ? '' : 'hidden']"
              name="close"
              @click="resetMaxPrice"
            />
          </template>
        </QInput>
      </div>

      <QSpace />

      <!-- <QBtn
        v-show="!currentUser.id"
        flat
        no-caps
        :class="[
          'flex-item--auto q-mx-md text-weight-medium gt-xs text-weight-bold',
          isHome ? 'text-white' : 'text-default-color',
          isMenuOpened ? 'invisible' : ''
        ]"
        @click="openAuthDialog({ redirectAfterSignup: true })"
      >
        {{ $t({ id: 'authentication.log_in_button' }) }}
      </QBtn> -->

      <QBtn
        v-if="isSearch"
        class="about-button q-mr-md q-px-sm text-weight-bold"
        :label="$t({ id: 'heroes_theme.about_button' })"
        color="primary"
        align="between"
        dense
        flat
        @click="aboutDialogOpened = true"
      />

      <AppLocaleSwitch />

      <AppLink
        to="https://github.com/stelace/heroes-platform-demo"
        class="q-mr-md flex-item--auto"
      >
        <QBtn
          class="github-button gt-sm q-px-sm text-weight-bold"
          :loading="content.fetchingContentStatus"
          :rounded="style.roundedTheme"
          color="accent"
          align="between"
          dense
        >
          <svg class="q-icon on-left">
            <use xlink:href="assets/icons.svg#github" />
          </svg>
          <AppContent entry="heroes_theme" field="github_button" />
        </QBtn>
      </AppLink>

      <QBtn
        class="create-assset-button q-px-sm flex-item--auto text-weight-bold"
        :to="{ name: 'newAsset' }"
        :loading="content.fetchingContentStatus"
        :rounded="style.roundedTheme"
        :label="$t({ id: 'navigation.new_listing' })"
        icon="add_box"
        color="secondary"
        align="between"
        dense
      />

      <QBtn
        v-if="currentUser.id && showAccountAvatar"
        class="q-ml-sm"
        flat
      >
        <AppAvatar
          :user="currentUser"
          size="2rem"
        />
        <QMenu ref="accountMenu" content-class="header__account-menu">
          <div class="q-pa-md">
            <div class="text-weight-medium q-mb-md">
              <AppContent
                class="text-h6"
                entry="navigation"
                field="account"
              />
            </div>
            <div class="text-center text-body1 text-weight-medium q-mb-md">
              {{ accountName }}
            </div>

            <div class="column items-stretch">
              <QBtn
                class="q-mb-sm"
                align="left"
                flat
                @click="openAuthDialog({ formType: 'changePassword' })"
              >
                <QIcon
                  name="lock"
                  :left="true"
                />
                <AppContent
                  entry="user"
                  field="account.new_password_label"
                />
              </QBtn>
              <QBtn
                v-close-popup
                align="left"
                flat
                @click="logout"
              >
                <QIcon
                  name="power_settings_new"
                  :left="true"
                />
                <AppContent
                  entry="authentication"
                  field="log_out_button"
                />
              </QBtn>
            </div>
          </div>
        </QMenu>
      </QBtn>
    </QToolbar>

    <QDialog
      :value="isMenuOpened"
      maximized
      transition-show="slide-down"
      transition-hide="slide-up"
      @input="toggleMenu"
    >
      <div class="bg-white navigation-menu">
        <QList>
          <QItem
            v-close-popup
            :to="{ name: 'home' }"
            exact-active-class="text-weight-medium"
            clickable
          >
            <QItemSection>{{ $t({ id: 'navigation.home' }) }}</QItemSection>
          </QItem>

          <QItem
            v-close-popup
            :to="{ name: 'search' }"
            exact-active-class="text-weight-medium"
            clickable
          >
            <QItemSection>{{ $t({ id: 'navigation.search' }) }}</QItemSection>
          </QItem>

          <div v-if="!showAccountAvatar">
            <QSeparator />

            <QItem
              v-show="!currentUser.id"
              v-close-popup
              clickable
              @click="openAuthDialog({ redirectAfterSignup: true })"
            >
              <QItemSection>{{ $t({ id: 'authentication.log_in_button' }) }}</QItemSection>
            </QItem>

            <QItem
              v-show="currentUser.id"
              v-close-popup
              :to="{ name: 'publicProfile', params: { id: currentUser.id }}"
              exact-active-class="text-weight-medium"
              clickable
            >
              <QItemSection>{{ $t({ id: 'navigation.profile' }) }}</QItemSection>
            </QItem>
            <QItem
              v-show="currentUser.id"
              v-close-popup
              clickable
              @click="logout"
            >
              <QItemSection>{{ $t({ id: 'authentication.log_out_button' }) }}</QItemSection>
            </QItem>
          </div>
        </QList>
      </div>
    </QDialog>

    <QDialog
      ref="aboutDialog"
      v-model="aboutDialogOpened"
      :maximized="$q.screen.lt.sm"
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <QCard>
        <QCardSection class="q-pa-lg">
          <AppContent
            tag="div"
            entry="heroes_theme"
            field="about"
          />
          <div class="text-center q-mt-md">
            <AppLink to="https://stelace.com/pricing">
              <QBtn
                color="primary"
                class="text-weight-bold text-body1"
                no-caps
                flat
                :label="$t({ id: 'heroes_theme.get_api_key' })"
              />
            </AppLink>
          </div>
          <div class="q-mt-md text-center">
            <AppContent
              tag="span"
              entry="stelace"
              field="made_with_love"
            />
            <AppMiniLogo class="with-love" />
          </div>
        </QCardSection>
        <QBtn
          v-close-popup
          flat
          class="absolute-top-right text-h6"
          label="X"
          :aria-label="$t({ id: 'navigation.close' })"
        />
      </QCard>
    </QDialog>

    <SearchToolbar />
  </QHeader>
</template>

<style lang="stylus" scoped>
$header-min-breakpoint = 359px

.transparent-header
  background: linear-gradient(180deg, rgba(0,0,0,0.8) -80%, rgba(0,0,0,0) 100%), \
              linear-gradient(170deg, rgba(0,0,0,0.8) -80%, rgba(0,0,0,0) 18%)

.header--raise-above-menu-dialog
  z-index: $z-fullscreen + 1

.logo-container svg
  max-height: $toolbar-min-height
.company-logo
  width: 9rem
.company-mini-logo
  height: 1.8rem
  fill: currentColor

// Form
.header__search-bar
  border-radius: $generic-border-radius
  // Handle long input
  max-width: calc(100% - 4rem) // Make place for logo
  @media (min-width $header-min-breakpoint)
    max-width: calc(100% - 8rem) // and inbox icon
  @media (min-width $breakpoint-sm-min)
    max-width: 50%

.header__inbox
  @media (max-width: $header-min-breakpoint)
    display: none
.inbox-badge
  position: absolute
  top: 0
  right: 0
  pointer-events: none
  border-radius: $badge-rounded-border-radius

.about-button
  @media (max-width: 840px)
    display: none
.create-assset-button
  @media (max-width: $breakpoint-xs-max)
    display: none

// Menu Dialog
.navigation-menu
  padding-top: 1.5 * $toolbar-min-height
</style>

<style lang="stylus">
.filter-dialog .fixed-full
  top: 2 * $toolbar-min-height

// Local quasar override
.header__search-bar
  .q-field__label
    color: $font-color
    opacity: inherit
    font-weight: 500

// Ensuring button text does not wrap
// Don’t set it too high though due to Quasar automatic sizing
.header__account-menu
  min-width: 260px

.organizations-select
  max-height: 8rem
</style>
