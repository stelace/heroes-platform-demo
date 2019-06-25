import Vue from 'vue'
import Vuex from 'vuex'

import asset from './asset'
import auth from './auth'
import content from './content'
import common from './common'
import layout from './layout'
import search from './search'
import style from './style'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      asset,
      auth,
      content,
      common,
      layout,
      search,
      style,
    }
  })

  return Store
}
