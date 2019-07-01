<script>
export default {
  props: {
    color: {
      type: String,
      default: 'info'
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
        <QChip
          class="text-weight-bold"
          :color="color"
          text-color="white"
          square
        >
          <slot>
            <AppContent entry="stelace" field="api" />
          </slot>
        </QChip>
      </AppLink>
    </div>
  </div>
</template>
