<template>
  <div><strvdev-logo :animEffectTiming="logoAnimEffectTiming"></strvdev-logo></div>
</template>

<script lang="ts">
import { defineComponent, useMeta, useRouter, ref, useContext } from '@nuxtjs/composition-api';
import StrvdevLogo from '@/components/atoms/StrvdevLogo.vue';

export default defineComponent({
  components: { StrvdevLogo },
  head: {},
  setup() {
    useMeta({ title: 'blog' });
    const config = useContext();

    const logoAnimEffectTiming: EffectTiming = {
      duration: 500,
      easing: 'ease',
      fill: 'forwards',
    };

    return { logoAnimEffectTiming };
  },
});
</script>
