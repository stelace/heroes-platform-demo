<template>
  <QPage class="stl-footer--bottom">
    <section class="hero hero__background-container">
      <div class="hero__background bg-accent" />
      <div class="hero__content text-center text-white">
        <slot name="heroContent" />
      </div>
    </section>

    <slot />
  </QPage>
</template>

<style lang="stylus" scoped>
.hero__background-container
  position: relative

.hero__background
  transform: skewY(-3.43deg) // matching footer triangle slope (6%)
  position: absolute
  top: -3vw
  right: 0
  bottom: 0
  left: 0
  z-index: -1

.hero__content
  padding: $spaces.sm.x
  @media (min-width $breakpoint-sm-min)
    padding: $spaces.xl.y $spaces.xl.x
</style>
