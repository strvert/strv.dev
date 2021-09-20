<template>
  <div class="header-main">
    <nuxt-link to="/">
      <strvdev-logo class="strvdev-logo" :logoScale="20" :animEffectTiming="logoAnimEffectTiming" />
    </nuxt-link>
    <nuxt />
  </div>
</template>

<script lang="ts">
import { defineComponent, useMeta, useRouter, ref, useContext } from '@nuxtjs/composition-api';
import StrvdevLogo from '@/components/atoms/StrvdevLogo.vue';
export default defineComponent({
  components: { StrvdevLogo },
  setup(props) {
    const logoAnimEffectTiming: EffectTiming = {
      duration: 500,
      easing: 'ease',
      fill: 'forwards',
    };

    return { logoAnimEffectTiming };
  },
});
</script>

<style lang="scss" scoped>
.header-main {
  inline-size: 100%;
  block-size: 80px;
  // border-block-end: ;

  position: fixed;
}

.strvdev-logo {
  display: block;
  margin-block-start: 10px;
  margin-block-end: 10px;
  inline-size: 300px;
}
</style>
