<template>
  <img @load="loadFinished" :src="src" :alt="alt" :class="{ loaded: loaded, unloaded: !loaded }" />
</template>

<script lang="ts">
import { defineNuxtComponent, ref, onMounted } from '#app';

export default defineNuxtComponent({
  props: {
    src: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: 0.2,
    },
  },
  setup(props) {
    const loaded = ref(false);
    const loadFinished = () => {
      loaded.value = true;
    };

    onMounted(() => {
      const elm = document.querySelector('img') as HTMLImageElement;
      elm.style.setProperty('--duration', `${props.duration}s`);
    });

    return { loadFinished, loaded };
  },
});
</script>

<style lang="scss" scoped>
img {
  transition: {
    property: opacity;
    duration: var(--duration);
  }
}

.unloaded {
  opacity: 0;
}

.loaded {
  opacity: 1;
}
</style>
