<template>
  <app-frame>
    <nuxt />
  </app-frame>
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxt2Meta } from '#app';
import AppFrame from '@/components/organisms/AppFrame.vue';

export default defineNuxtComponent({
  name: 'defaultLayout',
  components: { AppFrame },
  setup() {
    useNuxt2Meta({ meta: process.env.defaultMeta, link: process.env.defaultLink });
  },
});
</script>
