<template>
  <div>
    <div class="giscus"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useNuxt2Meta, ref } from '#app';

export default defineComponent({
  setup() {
  const script = ref([]);
    useNuxt2Meta({ script });
    script.value = [
      {
        src: 'https://giscus.app/client.js',
        'data-repo': 'strvert/strv.dev',
        'data-repo-id': 'MDEwOlJlcG9zaXRvcnk0MDQ5MTk0NDI=',
        'data-category': 'Blog comments',
        'data-category-id': 'DIC_kwDOGCKUks4B_Jo8',
        'data-mapping': 'pathname',
        'data-reactions-enabled': '1',
        'data-emit-metadata': '0',
        'data-theme': 'https://cdn.jsdelivr.net/gh/strvert/giscus-strv.dev-style@2.0.6/style.css',
        crossorigin: 'anonymous',
        async: true,
      },
    ];
  },
});
</script>

<style lang="scss">
.giscus-frame {
  width: 100%;
}
</style>
