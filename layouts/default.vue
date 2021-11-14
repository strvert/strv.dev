<template>
  <app-frame>
    <nuxt />
  </app-frame>
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';
import AppFrame from '@/components/organisms/AppFrame.vue';

export default defineNuxtComponent({
  name: 'defaultLayout',
  components: { AppFrame },
});
</script>
