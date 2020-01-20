<script>
import { get, values, groupBy } from 'lodash'
import { mapState, mapGetters } from 'vuex'
import { date } from 'quasar'
import { event as gaEvent } from 'vue-analytics'

import EventBus from 'src/utils/event-bus'
import { isValidDateString } from 'src/utils/time'

import BasicHeroLayout from 'src/layouts/BasicHeroLayout'

import AppGalleryUploader from 'src/components/AppGalleryUploader'
import CustomAttributesEditor from 'src/components/CustomAttributesEditor'
import DateRangePicker from 'src/components/DateRangePicker'
import SelectCategories from 'src/components/SelectCategories'

import PageComponentMixin from 'src/mixins/pageComponent'

export default {
  components: {
    BasicHeroLayout,

    AppGalleryUploader,
    CustomAttributesEditor,
    DateRangePicker,
    SelectCategories,
  },
  mixins: [
    PageComponentMixin,
  ],
  data () {
    return {
      name: '',
      nameMaxLength: 70,
      description: '',
      descriptionMaxLength: 2000,
      price: 0,
      startDate: '',
      endDate: '',
      quantity: 1,
      locations: [],
      randomLocationBounds: { // ~ NYC center bounds
        sw: { latitude: 40.632256, longitude: -73.886490 }, // south-west
        ne: { latitude: 40.813502, longitude: -74.013432 } // north-east
      },
      options: ['option1'],
      selectedCategory: null,
      visibleStep: 1,
      requestAuthentication: false,
      editingCustomAttributes: {},
      assetImages: [],
      uploaderFiles: [],
      creatingAsset: false,
    }
  },
  computed: {
    defaultAssetType () {
      return this.defaultActiveAssetType
    },
    selectedAssetType () {
      if (!this.asset.asset.id) return this.defaultAssetType || {}
      else return this.common.assetTypesById[this.asset.asset.assetTypeId] || {}
    },
    priceLabel () {
      const defaultPriceLabel = this.$t({ id: 'pricing.price_label' })
      if (!this.selectedAssetType || !this.selectedAssetType.timeBased) return defaultPriceLabel

      const timeUnit = get(this.selectedAssetType, 'timing.timeUnit')
      return this.$t({ id: 'pricing.price_per_time_unit_label' }, { timeUnit })
    },
    categoryRequired () {
      const categories = values(this.common.categoriesById)
      return !!categories.length
    },
    showCategory () { // could depend on some env variable or config
      return this.categoryRequired
    },
    editableCustomAttributeNames () {
      if (!this.selectedAssetType) return []

      const config = this.common.config
      const assetTypesConfig = get(config, 'stelace.instant.assetTypes')

      if (!assetTypesConfig) return []

      const assetTypeConfig = assetTypesConfig[this.selectedAssetType.id]
      if (!assetTypeConfig) return []

      return assetTypeConfig.customAttributes || []
    },
    customAttributes (type) {
      const attrs = this.common.customAttributesById
      const activeNames = this.editableCustomAttributeNames

      return values(attrs).filter((ca) => activeNames.includes(ca.name))
    },
    customAttributesByType () {
      const customAttributes = this.customAttributes // ensure Vue reactivity
      return groupBy(customAttributes, ca => ca.type)
    },
    showAvailabilityDates () {
      if (!this.selectedAssetType) return false

      return false // Holidays (unavailabilities) can’t be created so soon :)
      // return this.selectedAssetType.timeBased && !this.selectedAssetType.infiniteStock
    },
    locationName () {
      const locations = this.locations
      return get(locations, '[0].shortDisplayName', '')
    },
    step () {
      const steps = [
        true, // fictive step 0
        true,
        false,
        false,
        false,
      ]

      if (this.name.length >= 1) { // with high debounce to reduce distraction while typing
        steps[2] = true
      }

      const validCategory = this.selectedCategory && this.selectedCategory.name
      if (steps[2] && (!this.categoryRequired || validCategory) && !isNaN(parseInt(this.price))) {
        steps[3] = true
      }

      let isValidStartDate = true
      let isValidEndDate = true
      if (this.startDate) {
        isValidStartDate = isValidDateString(this.startDate)
      }
      if (this.endDate) {
        isValidEndDate = isValidDateString(this.endDate)
      }

      if (steps[2] && (
        !this.showAvailabilityDates ||
        (this.showAvailabilityDates && this.startDate && isValidStartDate && isValidEndDate)
      )) {
        // endDate is optional, so is quantity
        steps[4] = true
      }

      // Last valid step
      return steps.reduce((previous, step, i) => step ? i : previous, 1)
    },
    ...mapState([
      'asset',
      'common',
      'content',
      'style',
    ]),
    ...mapGetters([
      'currentUser',
      'defaultActiveAssetType',
    ]),
  },
  async preFetch ({ store }) {
    await store.dispatch('initEditAssetPage')
  },
  async mounted () {
    EventBus.$on('authStatusChanged', (status) => this.onAuthChange(status))
  },
  beforeDestroy () {
    EventBus.$off('authStatusChanged', (status) => this.onAuthChange(status))
  },
  methods: {
    afterAuth () {
      if (this.currentUser.id && this.currentUser.locations.length) {
        this.locations = [this.currentUser.locations[0]]
      }
    },
    changeCustomAttributes (customAttributes) {
      this.editingCustomAttributes = Object.assign({}, this.editingCustomAttributes, customAttributes)
    },
    selectCategory (category) {
      this.selectedCategory = category
    },
    onAuthChange (status) {
      if (status === 'success' && this.requestAuthentication) {
        this.requestAuthentication = false

        this.createAsset()
      } else if (status === 'closed') {
        this.requestAuthentication = false
      }
    },
    uploaderFilesChanged (files) {
      this.uploaderFiles = files
      this.assetImages = files
    },
    uploadCompleted ({ transformedUploadedFiles, uploadedOrReused }) {
      this.assetImages = uploadedOrReused

      if (this.creatingAsset) this.createAsset()
    },
    async createAsset () {
      if (!this.currentUser.id) {
        this.requestAuthentication = true
        this.openAuthDialog({ action: 'createAsset' })
        return
      }

      // autogrow on name QInput makes it a textarea, with potential line return
      const name = this.name.replace('\n', '')

      gaEvent({
        eventCategory: 'Interaction',
        eventAction: 'createAsset',
        eventLabel: name
      })

      if (this.step > 3) {
        try {
          const uploadPending = this.uploaderFiles.length && this.assetImages.length < this.uploaderFiles.length
          this.creatingAsset = true

          // if upload is processing, do not perform the asset creation logic right now
          // the logic will be triggered at the end of the upload from afterUploadCompleted
          if (uploadPending) return

          const images = this.assetImages
          /* .map(img => { // clean reused images
              delete img.reused
              return img
            }) */

          let assetQuantity = this.quantity

          const shouldCreateAvailability = this.showAvailabilityDates && this.startDate

          const availabilityAttrs = {}

          if (shouldCreateAvailability) {
            const isAnUnavailability = !this.endDate

            if (!isAnUnavailability) {
              availabilityAttrs.startDate = this.startDate
              availabilityAttrs.endDate = this.endDate
              availabilityAttrs.quantity = this.quantity

              // we want the asset to be available only during the availability period
              assetQuantity = 0
            } else {
              availabilityAttrs.startDate = date.addToDate(new Date(), { year: -1 }).toISOString()
              availabilityAttrs.endDate = this.startDate
              availabilityAttrs.quantity = 0
            }
          }

          if (this.randomLocationBounds) {
            const b = this.randomLocationBounds
            this.locations = [{
              latitude: b.sw.latitude + Math.random() * (b.ne.latitude - b.sw.latitude),
              longitude: b.ne.longitude + Math.random() * (b.sw.longitude - b.ne.longitude)
            }]
          }

          const attrs = {
            name,
            assetTypeId: (this.selectedAssetType && this.selectedAssetType.id) || undefined, // `null` not allowed
            description: this.description,
            price: this.price,
            quantity: assetQuantity,
            locations: this.locations,
            categoryId: this.selectedCategory ? this.selectedCategory.id : null,
            customAttributes: this.editingCustomAttributes,
            active: true,
            validated: true,
            metadata: {
              images,
              // Save dates to create custom availabilities with Workflows
              startDate: this.startDate,
              endDate: this.endDate
            }
          }

          if (this.content.currency) {
            attrs.currency = this.content.currency
          }

          const asset = await this.$store.dispatch('createAsset', { attrs })

          if (shouldCreateAvailability) {
            availabilityAttrs.assetId = asset.id
            await this.$store.dispatch('createAvailability', { attrs: availabilityAttrs })
          }

          this.notifySuccess('notification.saved')
          // this.resetForm() // useful when not keeping the user on the current page

          this.creatingAsset = false

          await new Promise(resolve => setTimeout(resolve, 1000))
          // New asset should be ready for search 🚀
          this.$router.push({ name: 'search' })
        } catch (err) {
          this.creatingAsset = false

          this.notifyWarning('error.unknown_happened_header')
        }
      }
    },
    /* resetForm () {
      this.name = ''
      this.description = ''
      this.price = 0
      this.startDate = ''
      this.endDate = ''
      this.quantity = 1
      this.locations = []
      this.selectedCategory = null
      this.editingCustomAttributes = {}

      // TODO: expose a method on AppGalleryUploader to reset form
      // this.resetUploader()
    }, */
    selectStartDate (startDate) {
      this.startDate = startDate
    },
    selectEndDate (endDate) {
      this.endDate = endDate
    },
    forceEndDateAfterStartDate (date) {
      return new Date(date).toISOString() >= this.startDate
    },
  }
}
</script>

<template>
  <BasicHeroLayout>
    <template v-slot:heroContent>
      <AppContent
        class="text-h4"
        tag="h1"
        entry="pages"
        field="new_asset.header"
      />
      <AppContent
        class="text-h6"
        tag="h2"
        entry="pages"
        field="new_asset.subheader"
      />
    </template>

    <section class="q-pa-xl">
      <QForm
        class="text-center stl-content-container stl-content-container--large margin-h-center q-mb-xl"
        name="newAsset"
        @submit="createAsset"
      >
        <div class="step-1 q-py-lg">
          <div class="text-h5">
            {{ $t({ id: 'pages.new_asset.form_header' }) }}
          </div>
          <div class="row justify-center">
            <QInput
              v-model="name"
              class="row-input"
              :label="$t({ id: 'asset.name_label' })"
              :counter="name.length > nameMaxLength / 2"
              :maxlength="nameMaxLength"
              :rules="[
                name => !!name ||
                  $t({ id: 'form.error.missing_title' })
              ]"
              debounce="500"
              autogrow
              required
            />
          </div>
        </div>

        <transition enter-active-class="animated fadeInUp">
          <div
            v-if="step > 1"
            class="step-2 q-py-lg"
          >
            <div class="row justify-around">
              <div v-if="showCategory" class="flex-item--grow-shrink-auto q-pr-lg">
                <SelectCategories
                  :initial-category="selectedCategory"
                  :autocomplete-min-chars="0"
                  :label="$t({ id: 'asset.category_label' })"
                  :show-search-icon="false"
                  :rules="[
                    selectedCategory => categoryRequired
                      ? (!!selectedCategory || $t({ id: 'form.error.missing_field' }))
                      : true
                  ]"
                  bottom-slots
                  @change="selectCategory"
                />
              </div>
              <div :style="showCategory ? 'flex: 1 2 auto;' : ''">
                <AppInputNumber
                  v-model="price"
                  :label="priceLabel"
                  :rules="[
                    price => Number.isFinite(parseFloat(price)) ||
                      $t({ id: 'form.error.missing_price' })
                  ]"
                  required
                  bottom-slots
                />
              </div>
            </div>
          </div>
        </transition>

        <transition enter-active-class="animated fadeInUp">
          <div
            v-if="step > 2"
            v-show="showAvailabilityDates"
            class="step-3 q-py-lg"
          >
            <DateRangePicker
              :start-date="startDate"
              :end-date="endDate"
              :missing-end-date-meaning="$t({ id: 'time.missing_end_date_meaning' })"
              :start-date-required="showAvailabilityDates"
              bottom-slots
              @changeStartDate="selectStartDate"
              @changeEndDate="selectEndDate"
            />
          </div>
        </transition>

        <transition enter-active-class="animated fadeInUp">
          <div
            v-if="step > 3"
            class="step-4 q-py-lg"
          >
            <div class="row justify-around">
              <div class="col-12 col-md-7">
                <QInput
                  v-model="description"
                  class="q-mb-md"
                  :label="$t({ id: 'asset.description_label' })"
                  :maxlength="descriptionMaxLength"
                  :counter="description.length > (descriptionMaxLength / 2)"
                  :rules="[
                    description => !!description ||
                      $t({ id: 'form.error.missing_description' })
                  ]"
                  type="textarea"
                  required
                />
              </div>
              <div
                v-if="customAttributesByType['boolean']"
                class="col-12 col-sm-6 col-md-5 q-pl-md"
              >
                <CustomAttributesEditor
                  :definitions="customAttributesByType['boolean']"
                  :values="editingCustomAttributes"
                  @change="changeCustomAttributes"
                />
              </div>
            </div>

            <div class="row q-py-lg">
              <CustomAttributesEditor
                :definitions="customAttributesByType['select']"
                :values="editingCustomAttributes"
                class="col-12 col-sm-6 q-pr-lg"
                @change="changeCustomAttributes"
              />
              <CustomAttributesEditor
                :definitions="customAttributesByType['number']"
                :values="editingCustomAttributes"
                class="col-12 col-sm-6"
                @change="changeCustomAttributes"
              />
            </div>

            <div class="row q-py-lg">
              <CustomAttributesEditor
                :definitions="customAttributesByType['tags']"
                :values="editingCustomAttributes"
                class="col-12"
                @change="changeCustomAttributes"
              />
            </div>

            <div class="step-asset-picture q-py-lg">
              <AppContent
                class="text-h5"
                tag="h3"
                entry="pages"
                field="new_asset.picture_incentive"
              />
              <AppGalleryUploader
                @uploader-files-changed="uploaderFilesChanged"
                @upload-completed="uploadCompleted"
              />
            </div>

            <QBtn
              class="q-my-md text-weight-bold"
              :loading="creatingAsset"
              :label="$t( { id: 'prompt.create_button' })"
              :rounded="style.roundedTheme"
              :disabled="step < 4 || !uploaderFiles.length"
              color="secondary"
              size="lg"
              type="submit"
            />
            <AppContent
              v-show="!uploaderFiles.length"
              tag="div"
              class="text-body2 text-center text-grey q-pa-sm"
              entry="form"
              field="error.missing_image"
            />
          </div>
        </transition>
      </QForm>
    </section>
  </BasicHeroLayout>
</template>

<style lang="stylus" scoped>
.row-input
  flex: 1 0
  min-width: 0
  @media (min-width $breakpoint-sm-min)
    // Using flex-basis instead of max-width for IE11
    // https://github.com/philipwalton/flexbugs#flexbug-17
    flex: 0 0 30rem
</style>
