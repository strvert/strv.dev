<template>
  <app-frame>
    <nuxt />
  </app-frame>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import AppFrame from '@/components/organisms/AppFrame.vue';

export default defineComponent({
  components: { AppFrame },
  setup() {},
});
</script>
