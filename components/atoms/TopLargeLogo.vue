<template>
    <section class="largelogo">
      <lazy-load-image
        class="large-icon"
        :duration="3"
        alt="大きなすとんりばーのアイコン"
        src="/images/logo/stonriver_640.webp"
      />
      <header :class="{ unmounted: !mounted }">
        <p>{{ message }}</p>
        <h1><strv-dev-logo :logoScale="logoScale" /></h1>
      </header>
    </section>
</template>

<script lang="ts">
import { defineNuxtComponent, ref, onMounted, onBeforeUnmount } from '#app';
import StrvDevLogo from '@/components/atoms/StrvdevLogo.vue';
import LazyLoadImage from '@/components/atoms/LazyLoadImage.vue';
import { useParallaxElement } from '@/composables/utils/ParallaxElement';

export default defineNuxtComponent({
  components: { StrvDevLogo, LazyLoadImage },
  setup() {
    const message = ref('Welcome to');
    const logoScale = ref(75);
    const resized = () => {
      const logoElm = document.querySelector('.largelogo') as HTMLDivElement;
      logoElm.style.setProperty('--blur', `${logoElm.clientWidth * 0.01}px`);
      logoScale.value = logoElm.clientWidth * 0.1;
    };

    const mounted = ref(false);
    onMounted(() => {
      window.addEventListener('resize', resized);
      resized();
      mounted.value = true;

      const elm = document.querySelector('.large-icon') as HTMLImageElement;
      elm.style.setProperty('animation-name', '');
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resized);
    });

    return { message, logoScale, mounted };
  },
});
</script>

<style lang="scss" scoped>
.largelogo {
  --blur: 8px;
  @keyframes top-text-in {
    from {
      filter: blur(var(--blur)) grayscale(20%);
    }
    50% {
      filter: blur(var(--blur)) grayscale(20%);
    }

    to {
      filter: blur(0) grayscale(0);
    }
  }

  @keyframes logo-in-1 {
    from {
      filter: blur(0) grayscale(0);
      transform: none;
    }
    50% {
      filter: blur(0) grayscale(0);
      transform: none;
    }

    to {
      filter: blur(var(--blur)) grayscale(20%);
      transform: rotateZ(360deg);
    }
  }

  --anim-duration: 2s;
  transition-duration: 0.5s;
  transition-property: width inline-size font-size opacity;
  position: relative;
  display: grid;
  grid-template-areas: 'one';
  img {
    grid-area: one;
    display: block;
    width: 100%;
    margin: auto 0;
    animation: {
      name: logo-in-1;
      duration: var(--anim-duration);
      fill-mode: forwards;
    }
    z-index: 0;
  }
  header {
    --center-block-size: 65%;
    grid-area: one;
    width: var(--center-block-size);
    margin: auto auto;
    display: block;
    position: relative;
    top: 0;
    left: 0;
    transition: inherit;

    animation: {
      name: top-text-in;
      duration: var(--anim-duration);
      fill-mode: forwards;
    }
    h1 {
      width: 100%;
      position: relative;
      margin: 0;
      left: 0;
      top: -20px;
      text-align: center;
      font-weight: 600;
    }
    p {
      width: 100%;
      position: relative;
      margin: 0;
      left: 0;
      top: -30px;
      text-align: center;
      font-weight: 500;
    }

    &.unmounted {
      opacity: 0;
    }

    @media screen and (min-width: 800px) {
      p {
        font-size: 3rem;
      }
    }
    @media screen and (max-width: 800px) {
      p {
        font-size: 6.5vw;
      }
    }
  }
}

// .top-bg-pattern {
//   display: block;
//   background-color: #aaaaaa;
//   block-size: 300px;
//   width: 100%;
// }
</style>
