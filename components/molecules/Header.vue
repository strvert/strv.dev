<template>
  <div class="header-main">
    <nav class="header-nav">
      <ul>
        <li class="strvdevlogo">
          <nuxt-link to="/">
            <strvdev-logo
              :transformed="logoTransformed"
              :logoScale="17"
              :animEffectTiming="logoAnimEffectTiming"
            />
          </nuxt-link>
        </li>
        <li class="textlink blogposts">
          <span>BLOG POSTS</span>
        </li>
        <li class="textlink about">
          <span>ABOUT</span>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, useContext, onBeforeUnmount } from '@nuxtjs/composition-api';
import StrvdevLogo from '@/components/atoms/StrvdevLogo.vue';
import { useScrollDirectionEvent } from '@/composables/utils/ScrollEvents';

export default defineComponent({
  components: { StrvdevLogo },
  setup(props) {
    const logoAnimEffectTiming: EffectTiming = {
      duration: 900,
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
    const { app } = useContext();
    console.log(app.$repositories.navContent.get());

    return { logoAnimEffectTiming, logoTransformed };
  },
});
</script>

<style lang="scss" scoped>
.header-main {
  --header-height: 44px;
  background-color: var(--strvdev-palette-1);
  box-shadow: 0px 0px 3px 0px var(--strvdev-palette-3);
  inline-size: 100%;
  block-size: var(--header-height);
}

.header-nav {
  max-inline-size: 800px;
  block-size: var(--header-height);
  margin: 0 auto;

  > ul {
    display: grid;
    margin: 0;
    grid-template-columns: repeat(5, 1fr);
    grid-template-areas: 'a b c d e';
    align-content: center;
    justify-items: center;

    > .textlink {
      font-size: 20px;
      font-weight: bold;
      line-height: var(--header-height);
    }

    > .blogposts {
      justify-self: left;
      grid-area: a;
    }
    > .strvdevlogo {
      grid-area: c;
      margin: auto 0;
    }
    > .about {
      justify-self: right;
      grid-area: e;
    }
  }
}
</style>
