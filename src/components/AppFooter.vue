<script>
import { mapState, mapGetters } from 'vuex'

export default {
  data () {
    return {}
  },
  computed: {
    footerLinks () { // return URLs to render as plain <a> tag if name is missing
      return [
      ]
    },
    socialIconFooterLinks () {
      const links = []
      if (this.socialInfo.facebookUrl) {
        links.unshift({
          url: this.socialInfo.facebookUrl,
          icon: 'statics/images/custom-icons.svg#fb',
          label: this.$t({ id: 'social.facebook_page' })
        })
      }
      return links
    },
    ...mapState([
      'content',
      'route',
    ]),
    ...mapGetters([
      'socialInfo',
    ])
  },
  methods: {
    switchLang () { // Move this to some SelectLanguage component when needed
      this.$store.dispatch('fetchAppContent', { locale: this.content.locale === 'fr' ? 'en' : 'fr' })
    }
  },
}
</script>

<template>
  <footer class="stl-footer bg-accent text-white">
    <div class="shape-container">
      <svg
        class="full-width shape"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          fill="#0f1d34"
          points="100,0 100,100 0,100"
        />
      </svg>
    </div>
    <div class="row q-col-gutter-sm text-center q-px-lg">
      <!-- "Instant Pages" fetched from Stelace Content API -->
      <AppLink
        v-for="(target, i) in footerLinks"
        :key="`${i}-${target.name}`"
        class="anchor-text--reset col-12 col-md-4 flex flex-center"
        :to="target.name ? { name: target.name } : target.url"
      >
        <AppContent
          v-if="target.entry && target.field"
          :entry="target.entry"
          :field="target.field"
        />
      </AppLink>
      <div class="col-12 col-md-4">
        <AppLink
          v-for="net in socialIconFooterLinks"
          :key="net.url"
          :to="net.url"
          :aria-label="net.label"
          class="anchor-text--reset s-icon-link"
        >
          <svg class="s-icon q-pa-sm">
            <use
              :xlink:href="net.icon"
              xmlns:xlink="http://www.w3.org/1999/xlink"
            />
          </svg>
        </AppLink>
      </div>
    </div>
    <h3 class="text-subtitle1 text-center q-my-lg">
      <AppContent
        tag="a"
        href="https://stelace.com/?utm_campaign=powered-by&utm_medium=galaxy&utm_content=footer"
        class="anchor-text--reset"
        entry="stelace"
        field="service_powered_by_stelace"
      />
    </h3>
  </footer>
</template>

<style lang="stylus" scoped>
.stl-footer
  position: relative
  padding: 2vw $spaces.lg.x 4vw
  font-size: 1.25em
  z-index: 2

.shape-container
  position: absolute
  left: 0
  right: 0
  top: -6vw
.shape
  position: relative
  bottom: -1px // ensure we get no top border due to pixel rounding
  height: 6vw

.s-icon
  fill: currentColor
  height: 4rem
  width: 4rem
</style>

<style lang="stylus">
// stl-footer--bottom class on QPage parent component makes footer stick to bottom when page is empty
$stl-footer-height = 10rem // Adjust to footer content length

.q-page.stl-footer--bottom
  padding-bottom: $stl-footer-height + 2rem
  .stl-footer
    position: absolute
    right: 0
    bottom: 0
    right: 0
    width: 100%
    height: $stl-footer-height
</style>
