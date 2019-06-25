import AssetCard from 'src/components/AssetCard'
import AppAvatar from 'src/components/AppAvatar'
import AppContent from 'src/components/AppContent'
import AppFooter from 'src/components/AppFooter'
import AppLink from 'src/components/AppLink'
import AppRatingStars from 'src/components/AppRatingStars'

export default async ({ Vue }) => {
  Vue.component('AssetCard', AssetCard)
  Vue.component('AppAvatar', AppAvatar)
  Vue.component('AppContent', AppContent)
  Vue.component('AppFooter', AppFooter)
  Vue.component('AppLink', AppLink)
  Vue.component('AppRatingStars', AppRatingStars)
}
