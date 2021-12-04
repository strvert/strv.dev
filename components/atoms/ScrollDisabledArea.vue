<template>
  <div @mouseenter="disable" @mouseleave="enable">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, ref, onMounted } from '#app';

export default defineNuxtComponent({
  name: 'scroll-disabled-area',
  setup() {
    function notscroll(e: any) {
      e.preventDefault();
    }
    return { disable, enable };
  },
});
</script>
