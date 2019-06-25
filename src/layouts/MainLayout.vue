<script>
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'

import EventBus from 'src/utils/event-bus'

import MainLayoutHeader from 'src/layouts/MainLayoutHeader'

import AuthDialog from 'src/components/AuthDialog'

import AuthDialogMixin from 'src/mixins/authDialog'

export default {
  components: {
    MainLayoutHeader,

    AuthDialog,
  },
  mixins: [
    AuthDialogMixin,
  ],
  data () {
    return {
      routeTransitionName: '',
      actionAfterAuthentication: null,
    }
  },
  computed: {
    isOwnerCurrentUser () {
      return this.currentUser.id === this.asset.activeAsset.ownerId
    },
    redirectUrl () {
      const { redirect } = this.$route.query
      return (this.isHome && redirect) || null
    },
    isHome () {
      return this.route.name === 'home'
    },
    isAssetPage () {
      return this.route.name === 'asset'
    },
    isProfilePage () {
      return this.route.name === 'publicProfile'
    },
    hasLeftDrawer () {
      return this.route.meta.hasLeftDrawer
    },
    blurredPage () {
      return (this.auth.authDialogOpened && this.auth.authDialogPersistent) ||
        this.layout.isPageBlurred
    },
    ...mapState([
      'asset',
      'auth',
      'layout',
      'route',
      'style',
    ]),
    ...mapGetters([
      'currentUser',
      'selectedUser',
      'activeAsset',
    ]),
  },
  watch: {
    '$route' (to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length

      this.routeTransitionName =
        (!this.style.pageTransitions || ['home', 'search'].includes(to.name)) ? ''
          : toDepth < fromDepth ? 'fadeInLeft' : 'fadeInRight'
    },
  },
  async mounted () {
    EventBus.$on('authStatusChanged', (status) => this.onAuthChange(status))
  },
  beforeDestroy () {
    EventBus.$off('authStatusChanged', (status) => this.onAuthChange(status))
  },
  methods: {
    onAuthChange (status) {
      if (status === 'success' && this.actionAfterAuthentication) {
        if (this.actionAfterAuthentication === 'contactUser') {
          this.contactUserAfterAuth()
        }
        this.actionAfterAuthentication = null
      } else if (status === 'closed') {
        this.actionAfterAuthentication = null
      }
    },
    toggleLeftDrawer (visible = !this.isLeftDrawerOpened) {
      this.$store.commit(mutationTypes.LAYOUT__TOGGLE_LEFT_DRAWER, { visible })
    },
    async contactUser () {
      if (!this.currentUser.id) {
        this.actionAfterAuthentication = 'contactUser'
        this.openAuthDialog()
        return
      }

      if (this.canContactUser) {
        this.contactUserAfterAuth()
      } else {
        this.showContactUserPrerequisiteDialog()
      }
    },
    async contactUserAfterAuth () {
      if (!this.currentUser.id) {
        this.actionAfterAuthentication = 'contactUser'
        this.openAuthDialog()
        return
      }

      // cannot contact herself
      if (this.isOwnerCurrentUser) return

      const asset = this.asset.activeAsset

      const message = await this.$store.dispatch('sendMessage', {
        content: ' ',
        topicId: asset.id,
        receiverId: asset.ownerId,
        metadata: {
          isHiddenMessage: true
        }
      })

      await this.$store.dispatch('fetchMessages', { forceRefreshAll: true })

      this.$router.push({
        name: 'conversation',
        params: { id: message.conversationId }
      })
    },
    showContactUserPrerequisiteDialog () {
      this.$q.dialog({
        title: this.$t({ id: 'user.account.contact_user_prerequisite_header' }),
        message: this.$t({ id: 'user.account.contact_user_prerequisite_message' }),
        ok: {
          label: this.$t({ id: 'prompt.continue_button' }),
          color: 'positive',
          class: 'q-ma-sm'
        }
      })
    },
  },
}
</script>

<template>
  <QLayout
    :class="blurredPage ? 'app--blur' : ''"
    view="hhr LpR fFr"
  >
    <MainLayoutHeader />
    <QAjaxBar
      ref="loadingBar"
      position="top"
      color="secondary"
      size="3px"
    />

    <QDrawer
      v-if="hasLeftDrawer"
      :value="layout.isLeftDrawerOpened"
      bordered
      show-if-above
      side="left"
      content-class="no-scroll"
      @input="toggleLeftDrawer"
    >
      <!-- drawer content -->
      <TheContextCard
        :load="layout.isLeftDrawerOpened"
        :in-drawer="true"
      />
    </QDrawer>

    <!-- <QDrawer v-model="right" side="right" elevated content-class="bg-accent">
    </QDrawer> -->

    <QPageContainer :class="{ 'header--overlay': isHome }">
      <transition :enter-active-class="`animated ${routeTransitionName}`">
        <router-view />
      </transition>
    </QPageContainer>

    <AuthDialog :redirect-url="redirectUrl" />
  </QLayout>
</template>

<style lang="stylus" scoped>
.header--overlay
  padding-top: 0 !important

</style>
