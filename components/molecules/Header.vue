<template>
  <div class="header-main" :style="cssVariables">
    <div class="site-content-list">
      <nav class="sitenav">
        <site-content-list :wrap="siteContentWrap" row-height="44px" :contents="siteContent" />
      </nav>
    </div>
    <div class="header-grid">
      <div class="strvdevlogo">
        <strvdev-logo
          :transformed="logoTransformed"
          :logoScale="33"
          :animEffectTiming="logoAnimEffectTiming"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  useContext,
  onBeforeUnmount,
  computed,
} from '@nuxtjs/composition-api';
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

    const { app } = useContext();
    const { navContent } = app.$repositories;
    const siteContent = navContent.get();
    const headerRowHeight = 44; // px
    const cssVariables = { '--header-row-height': `${headerRowHeight}px` };

    return { logoAnimEffectTiming, logoTransformed, siteContent, cssVariables, siteContentWrap };
  },
});
</script>

<style lang="scss" scoped>
.header-main {
  background-color: var(--strvdev-palette-1);
  box-shadow: 0px 0px 3px 0px var(--strvdev-palette-3);
  inline-size: 100%;
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
    grid-area: c;
    padding-top: 5px;
  }

  > .sitenav {
    grid-area: c;

    position: absolute;
    top: 0;

    &.open {
      background-color: red;
    }
  }
}
</style>
