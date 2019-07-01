<script>
import { mapState } from 'vuex'

export default {
  computed: {
    isHome () {
      return this.route.name === 'home'
    },
    ...mapState([
      'content',
      'style',
      'route',
    ]),
  },
  methods: {
    switchLang () {
      this.$store.dispatch('fetchAppContent', { locale: this.content.locale === 'fr' ? 'en' : 'fr' })
    }
  }
}
</script>

<template>
  <QBtnDropdown
    class="q-mr-md text-uppercase text-weight-bold"
    :label="content.locale"
    :rounded="style.roundedTheme"
    :text-color="isHome ? 'white' : 'primary'"
    color="transparent"
    unelevated
    no-caps
    dense
  >
    <QList>
      <QItem
        v-close-popup
        clickable
        @click="switchLang('en')"
      >
        <QItemSection>
          <QItemLabel>
            EN
          </QItemLabel>
        </QItemSection>
      </QItem>
      <QItem
        v-close-popup
        clickable
        @click="switchLang('fr')"
      >
        <QItemSection>
          <QItemLabel>
            FR
          </QItemLabel>
        </QItemSection>
      </QItem>
    </QList>
  </QBtnDropdown>
</template>
