<script>
import { mapState } from 'vuex'
import prism from 'prismjs'

export default {
  data () {
    return {
      showCode: false,
      isFirstTime: true,
      name: 'asset', // Ensuring we show specific dialog content only once
      opened: false,
      highligthedCode: '',
      onCloseCb: _ => _
    }
  },
  computed: {
    code () {
      return this.demo.code[this.name]
    },
    ...mapState([
      'demo'
    ])
  },
  methods: {
    open (name, cb) {
      this.name = name || this.name
      this.isFirstTime = !this.demo.dialogsOpened[this.name]

      if (!this.isFirstTime) return

      this.$store.commit({
        type: 'DEMO_DIALOG_OPENED',
        name: this.name
      })

      this.highligthedCode = prism.highlight(
        this.demo.code[name],
        prism.languages.javascript,
        'javascript'
      )
      this.opened = true

      this.onCloseCb = () => {
        if (typeof cb === 'function') cb()
        this.opened = false
      }
    }
  }
}
</script>

<template>
  <QDialog
    v-show="isFirstTime"
    :value="opened"
    :maximized="$q.screen.lt.sm"
    @hide="onCloseCb"
  >
    <div class="row justify-between bg-white rounded-borders intro-card">
      <div
        ref="test"
        :class="[
          'col-12 q-pa-lg relative-position',
          !showCode ? 'col-md-6' : ''
        ]"
      >
        <AppContent
          class="text-body1 code-intro q-pl-sm"
          entry="heroes_theme"
          :field="`demo_intro.${name}`"
        />

        <div class="text-center q-my-md">
          <QBtn
            v-close-popup
            color="primary"
            class=" text-weight-bold"
          >
            <AppContent class="q-pl-sm" entry="prompt" field="continue_button" />
          </QBtn>
        </div>

        <div class="text-center q-my-lg">
          <AppRunningOn link="https://stelace.com" flat>
            <AppContent entry="stelace" field="api" />
          </AppRunningOn>
        </div>

        <QBtn
          v-close-popup
          flat
          class="absolute-top-right xs text-h6"
          label="X"
          :aria-label="$t({ id: 'navigation.close' })"
        />
      </div>
      <div
        v-show="!showCode"
        class="col-12 col-md-6 relative-position"
      >
        <div ref="codeContainer" class="code-container">
          <!-- eslint-disable vue/no-v-html -->
          <pre class="language-js"><code class="language-js" v-html="highligthedCode" /></pre>
          <!-- eslint-enable vue/no-v-html -->
        </div>
      </div>
    </div>
  </QDialog>
</template>

<style lang="stylus" scoped>
.intro-card
  min-width: 70vw
  min-height: 35vw
  max-width: none!important
  @media (max-width: $breakpoint-xs-max)
    align-content: flex-start
  .code-container
    overflow: hidden
    @media (min-width: $breakpoint-md-min)
      position: absolute
      top: 0
      right: 0
      bottom: 0
      left: 0
    pre
      margin: 0
      padding: 1.5rem
      height: 100%
</style>

<style lang="stylus">
.code-intro h2
  font-size: 1.25rem
  font-weight: 400
  margin: 0.5rem auto
</style>

<style>
/**
 * prism.js tomorrow night eighties for JavaScript, CoffeeScript, CSS and HTML
 * Based on https://github.com/chriskempson/tomorrow-theme
 * @author Rose Pritchard
 */

code[class*="language-"],
pre[class*="language-"] {
  color: #ccc;
  background: none;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 1em;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;

  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;

  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;

}

/* Code blocks */
pre[class*="language-"] {
  padding: 1em;
  margin: .5em 0;
  overflow: auto;
}

:not(pre) > code[class*="language-"], pre[class*="language-"] {
  background: #2d2d2d;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
  padding: .1em;
  border-radius: .3em;
  white-space: normal;
}

.token.comment,
.token.block-comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #999;
}

.token.punctuation {
  color: #ccc;
}

.token.tag,
.token.attr-name,
.token.namespace,
.token.deleted {
  color: #e2777a;
}

.token.function-name {
  color: #6196cc;
}

.token.boolean,
.token.number,
.token.function {
  color: #f08d49;
}

.token.property,
.token.class-name,
.token.constant,
.token.symbol {
  color: #f8c555;
}

.token.selector,
.token.important,
.token.atrule,
.token.keyword,
.token.builtin {
  color: #cc99cd;
}

.token.string,
.token.char,
.token.attr-value,
.token.regex,
.token.variable {
  color: #7ec699;
}

.token.operator,
.token.entity,
.token.url {
  color: #67cdcc;
}

.token.important,
.token.bold {
  font-weight: bold;
}
.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

.token.inserted {
  color: green;
}
</style>
