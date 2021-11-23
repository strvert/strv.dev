<template>
  <section class="top">
    <div class="logo">
      <lazy-load-image :duration="0.3" src="/images/logo/stonriver_1200.webp" />
      <header>
        <p>{{ message }}</p>
        <h1><strv-dev-logo :logoScale="logoScale" /></h1>
        <!--<h1>strv.dev</h1>-->
      </header>
    </div>
  </section>
</template>

<script lang="ts">
import { defineNuxtComponent, ref, onMounted, onBeforeUnmount } from '#app';
import StrvDevLogo from '@/components/atoms/StrvdevLogo.vue';
import LazyLoadImage from '@/components/atoms/LazyLoadImage.vue';

export default defineNuxtComponent({
  components: { StrvDevLogo, LazyLoadImage },
  setup() {
    const message = ref('Welcome to');
    const logoScale = ref(75);
    const resized = () => {
      const logoElm = document.querySelector('.logo') as HTMLDivElement;
      logoElm.style.setProperty('--blur', `${logoElm.clientWidth * 0.01}px`);
      logoScale.value = logoElm.clientWidth * 0.1;
    };
    onMounted(() => {
      window.addEventListener('resize', resized);
      resized();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resized);
    });

    return { message, logoScale };
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

    @keyframes logo-in {
      from {
        filter: blur(0) grayscale(0);
      }
      50% {
        filter: blur(0) grayscale(0);
      }

      to {
        filter: blur(var(--blur)) grayscale(20%);
      }
    }

    --anim-duration: 1s;
    transition-duration: 0.5s;
    transition-property: width inline-size font-size;
    padding-bottom: 80px;
    margin: 0 auto;
    position: relative;
    display: grid;
    grid-template-areas: 'one';
    width: var(--logo-size);
    height: 98vh;
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
}
</style>
