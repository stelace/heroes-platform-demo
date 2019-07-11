<script>
export default {
  props: {
    color: {
      type: String,
      default: 'info'
    },
    flat: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: 'https://stelace.com/docs/'
    },
    linkProperties: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<template>
  <div>
    <AppContent
      tag="div"
      entry="stelace"
      field="powered_by"
      class="text-grey"
    />
    <div>
      <AppLink :to="link" v-bind="linkProperties">
        <QBtn
          class="text-weight-bold q-ma-xs"
          :color="color"
          :flat="flat"
          square
        >
          <slot>
            <AppContent entry="stelace" field="api" />
          </slot>
        </QBtn>
      </AppLink>
    </div>
  </div>
</template>
