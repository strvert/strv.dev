<template>
  <div>
    <ul>
      <slot />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({});
</script>

<style lang="scss" scoped>
ul {
  list-style: none;
  padding: 0;
  li {
    margin-block-end: 2em;
  }
}
</style>
