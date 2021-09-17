<template>
  <container>
    <nuxt-link to="/">
      <strvdev-logo :logoScale="20" :animEffectTiming="logoAnimEffectTiming" />
    </nuxt-link>
    <nuxt />
  </container>
</template>

<script lang="ts">
import { defineComponent, useMeta, useRouter, ref, useContext } from '@nuxtjs/composition-api';

import Container from '@/components/atoms/Container.vue';
import StrvdevLogo from '@/components/atoms/StrvdevLogo.vue';

export default defineComponent({
  components: { Container, StrvdevLogo },
  setup() {
    const logoAnimEffectTiming: EffectTiming = {
      duration: 500,
      easing: 'ease',
      fill: 'forwards',
    };

    return { logoAnimEffectTiming };
  },
});
</script>
