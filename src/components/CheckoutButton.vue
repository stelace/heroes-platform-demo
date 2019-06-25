<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {}
  },
  computed: {
    ...mapState([
      'style',
    ])
  },
}
</script>

<template>
  <QBtn
    :rounded="style.roundedTheme"
    :label="$t({ id: 'asset.checkout_action' }, { timeBased: true })"
    color="secondary"
    v-on="$listeners"
  />
</template>

<style>
</style>
