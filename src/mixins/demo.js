export default {
  methods: {
    showDemoIntroDialog (name, cb) {
      const introDialog = this.$refs.introDialog
      if (introDialog) introDialog.open(name, cb)
      return !!introDialog
    }
  }
}
