<template>
  <section class="top">
    <div class="logo">
      <img src="~/assets/images/top/stonriver_1200.webp" />
      <header>
        <p>Welcome to</p>
        <!--<h1><strv-dev-logo :logoScale="90" /></h1>-->
        <h1>strv.dev</h1>
      </header>
    </div>
  </section>
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxtApp, onMounted, onBeforeUnmount } from '#app';
import StrvDevLogo from '@/components/atoms/StrvdevLogo.vue';

export default defineNuxtComponent({
  components: { StrvDevLogo },
  setup() {
    const setFillHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    onMounted(() => {
      window.addEventListener('resize', setFillHeight);
      setFillHeight();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', setFillHeight);
    });
  },
});
</script>

<style lang="scss" scoped>
.top {
  @media screen and (min-width: 800px) {
    --logo-size: 100%;
  }
  @media screen and (max-width: 800px) {
    --logo-size: 90%;
  }
  .logo {
    --anim-duration: 1s;
    transition-duration: 0.2s;
    transition-property: width inline-size;
    padding-bottom: calc(8 * var(--vh));
    margin: 0 auto;
    position: relative;
    display: grid;
    grid-template-areas: 'one';
    width: var(--logo-size);
    height: calc(98 * var(--vh));
    img {
      grid-area: one;
      display: block;
      width: 100%;
      margin: auto 0;
      animation: {
        name: logo-in;
        duration: var(--anim-duration);
        fill-mode: forwards;
      }
      // filter: blur(10px) grayscale(20%);
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
        position: absolute;
        margin: 0;
        left: 0;
        top: -60px;
        text-align: center;
        font-weight: 600;
      }
      p {
        width: 100%;
        position: absolute;
        margin: 0;
        left: 0;
        top: -80px;
        text-align: center;
        font-weight: 500;
      }

      @media screen and (min-width: 800px) {
        h1 {
          font-size: 7rem;
        }
        p {
          font-size: 3rem;
        }
      }
      @media screen and (max-width: 800px) {
        top: calc(3 * var(--vh));
        h1 {
          font-size: 12vw;
        }
        p {
          font-size: 5.5vw;
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
}

@keyframes top-text-in {
  from {
    filter: blur(8px) grayscale(20%);
  }
  50% {
    filter: blur(8px) grayscale(20%);
  }

  to {
    filter: blur(0) grayscale(0);
  }
}

@keyframes logo-in {
  from {
    filter: blur(0) grayscale(0);
  }
  50% {
    filter: blur(0) grayscale(0);
  }

  to {
    filter: blur(8px) grayscale(20%);
  }
}
</style>
