<template>
  <div>
    <top-large-logo />
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxt2Meta } from '#app';
import Redirector from '@/components/atoms/Redirector.vue';
import TopLargeLogo from '@/components/atoms/TopLargeLogo.vue';

export default defineNuxtComponent({
  components: { Redirector, TopLargeLogo },
  setup() {
    useNuxt2Meta({ titleTemplate: 'strv.dev' });
  },
});
</script>

