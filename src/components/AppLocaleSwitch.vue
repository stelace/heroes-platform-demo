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
        <QItemSection :class="['text-center', content.locale === 'en' ? 'text-weight-bold' : '']">
          English
        </QItemSection>
      </QItem>
      <QItem
        v-close-popup
        class="text-center"
        clickable
        @click="switchLang('fr')"
      >
        <QItemSection :class="['text-center', content.locale === 'fr' ? 'text-weight-bold' : '']">
          Français
        </QItemSection>
      </QItem>
      <QItem>
        <QItemSection class="text-center">
          <AppRunningOn link="https://stelace.com/docs/content">
            <AppContent entry="stelace" field="content_api" />
          </AppRunningOn>
        </QItemSection>
      </QItem>
    </QList>
  </QBtnDropdown>
</template>
