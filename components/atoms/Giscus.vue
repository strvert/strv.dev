<template>
  <div>
    <div class="giscus"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useMeta } from '@nuxtjs/composition-api';

export default defineComponent({
  head: {},
  setup() {
    const { script } = useMeta();
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
        'data-theme': 'https://cdn.jsdelivr.net/gh/strvert/giscus-strv.dev-style@2.0/style.css',
        crossorigin: 'anonymous',
        async: true,
      },
    ];
  },
});
</script>

<style lang="scss">
.giscus-frame {
  inline-size: calc(100% + 20px);
  transform: translateX(-10px);
}
</style>
