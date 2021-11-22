<template>
  <div>
    <top-large-logo />
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxt2Meta } from '#app';
import TopLargeLogo from '@/components/atoms/TopLargeLogo.vue';

export default defineNuxtComponent({
  name: 'top',
  components: { TopLargeLogo },
  setup() {
    useNuxt2Meta({ titleTemplate: 'strv.dev' });
  },
});
</script>

