<template>
  <div
    class="header-main"
    @mouseenter="openPc"
    @mousedown="openPc"
    @mouseleave="menuLeavePc"
    :class="{ open: menuOpened }"
    :style="{
      '--header-row-height': `${rowHeight}px`,
      '--header-row-count': `${siteContentWrap ? siteContent.length : 1}`,
    }"
  >
    <div class="site-content-list">
      <nav @click="menuLeavePc" class="sitenav">
        <site-content-list :wrap="siteContentWrap" row-height="44px" :contents="siteContent" />
      </nav>
    </div>
    <div class="header-grid">
      <button class="strvdevlogo">
        <strvdev-logo
          :transformed="logoTransformed"
          :logoScale="33"
          :animEffectTiming="logoAnimEffectTiming"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useNuxtApp, ref, computed } from '#app';
import StrvdevLogo from '@/components/atoms/StrvdevLogo.vue';
import SiteContentList from '@/components/atoms/SiteContentList.vue';
import { useScrollDirectionEvent } from '@/composables/utils/ScrollEvents';
import { useResizeEvent } from '@/composables/utils/ResizeEvent';

export default defineComponent({
  components: { StrvdevLogo, SiteContentList },
  setup() {
    const logoAnimEffectTiming: EffectTiming = {
      duration: 900,
      easing: 'ease',
      fill: 'forwards',
    };

    const { state: logoTransformed } = useScrollDirectionEvent();
    const { width } = useResizeEvent();

    const siteContentWrap = computed(() => {
      if (width.value !== undefined) {
        return width.value <= 800;
      }
      return false;
    });

    const { $repositories } = useNuxtApp();
    const { navContent } = $repositories;
    const siteContent = navContent.get();
    const rowHeight = 44; // px

    const menuOpened = ref<boolean>(false);
    const openPc = () => {
      console.log('open');
      menuOpened.value = true;
    };
    const close = () => {
      const headerElm = document.querySelector('header-main') as HTMLDivElement;
    };
    const menuLeavePc = () => {
      console.log('leave');
      menuOpened.value = false;
    };

    return {
      logoAnimEffectTiming,
      logoTransformed,
      siteContent,
      rowHeight,
      siteContentWrap,
      openPc,
      menuLeavePc,
      menuOpened,
    };
  },
});
</script>

<style lang="scss" scoped>
.header-main {
  background-color: var(--strvdev-palette-1);
  box-shadow: 0px 0px 3px 0px var(--strvdev-palette-3);
  inline-size: 100%;

  transition-property: transform;
  transition-duration: 0.3s;

  transform: translateY(calc(-1 * var(--header-row-height) * var(--header-row-count)));

  &.open {
    transform: translateY(0);
  }
}

.site-content-list {
  display: flex;
  justify-content: center;
}

.header-grid {
  block-size: var(--header-row-height);
  max-inline-size: 800px;
  margin: 0 auto;

  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-areas: 'a b c d e';
  align-items: start;
  justify-items: center;

  > .strvdevlogo {
    background-color: inherit;
    border-style: none;
    grid-area: c;
    padding-top: 5px;

    &:hover {
      cursor: pointer;
    }
  }

  > .sitenav {
    grid-area: c;
  }
}
</style>
