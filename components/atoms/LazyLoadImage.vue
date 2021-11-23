<template>
  <img @load="loadFinished" :src="src" :class="{ loaded: loaded, unloaded: !loaded }" />
</template>

<script lang="ts">
import { defineNuxtComponent, ref } from '#app';

export default defineNuxtComponent({
  props: {
    src: {
      type: String,
      default: '',
    },
  },
  setup() {
    const loaded = ref(false);
    const loadFinished = () => {
      loaded.value = true;
    };

    return { loadFinished, loaded };
  },
});
</script>

<style lang="scss" scoped>
img {
  transition: {
    property: opacity;
    duration: 0.2s;
  }
}

.unloaded {
  opacity: 0;
}

.loaded {
  opacity: 1;
}
</style>
