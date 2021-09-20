<template>
  <div class="header-main">
    <div class="strvdev-logo">
      <nuxt-link to="/">
        <strvdev-logo
          :transformed="logoTransformed"
          :logoScale="17"
          :animEffectTiming="logoAnimEffectTiming"
        />
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  useMeta,
  useRouter,
  ref,
  useContext,
  onMounted,
  onBeforeUnmount,
} from '@nuxtjs/composition-api';
import StrvdevLogo from '@/components/atoms/StrvdevLogo.vue';
import { useScrollAmountEvent, useScrollDirectionEvent } from '@/composables/utils/ScrollEvents';

export default defineComponent({
  components: { StrvdevLogo },
  setup(props) {
    const logoAnimEffectTiming: EffectTiming = {
      duration: 500,
      easing: 'ease',
      fill: 'forwards',
    };

    const { state: logoTransformed, addEvent, removeEvent } = useScrollDirectionEvent();

    onMounted(() => {
      addEvent();
    });
    onBeforeUnmount(() => {
      removeEvent();
    });

    return { logoAnimEffectTiming, logoTransformed };
  },
});
</script>

<style lang="scss" scoped>
.header-main {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;

  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-areas: 'a b c d e';
  align-content: center;

  background-color: var(--strvdev-palette-1);
  box-shadow: 0px 0px 3px 0px var(--strvdev-palette-3);
  inline-size: 100%;
  block-size: 44px;
}

.strvdev-logo {
  grid-area: c;
}
</style>
