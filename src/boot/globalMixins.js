import Notify from 'src/mixins/notify'
import Demo from 'src/mixins/demo'

export default async ({ Vue }) => {
  Vue.mixin(Notify)
  Vue.mixin(Demo)
}
