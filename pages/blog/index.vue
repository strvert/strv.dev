<template>
  <div><StrvDevLogo :animEffectTiming="logoAnimEffectTiming"></StrvDevLogo></div>
</template>

<script lang="ts">
import { defineComponent, useMeta, useRouter, ref, useContext } from '@nuxtjs/composition-api';
import StrvDevLogo from '@/components/atoms/StrvDevLogo.vue';

export default defineComponent({
  components: { StrvDevLogo },
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
