<template>
  <div v-cloak>
    <ul>
      <slot />
    </ul>
  </div>
</template>

<style lang="scss" scoped>
ul {
  list-style: none;
  padding: 0;
  li {
    margin-block-end: 2em;
  }
}
</style>
