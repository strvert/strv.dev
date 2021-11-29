<template>
  <article>
    <div class="logos">
      <top-large-logo class="logo" />
    </div>
    <button @click="scroll('#main-message')" class="jump" href="#main-message">
      <i class="im im-eject"></i>
    </button>
    <h1 id="main-message">{{ first ? 'はじめまして！' : 'また会いましたね！' }}</h1>
    <div class="content">
      <p>
        ここは<strong>すとんりばー</strong>のポートフォリオ兼<nuxt-link to="/blog"
          ><strong>ブログ</strong></nuxt-link
        >サイトです。すこしだけ自己紹介を見ていってください。
      </p>
      <basic-profile />
      <contact-profile />
      <skill-profile />
    </div>
  </article>
</template>

<script lang="ts">
import { defineNuxtComponent, ref, useNuxt2Meta, onMounted } from '#app';
import TopLargeLogo from '@/components/atoms/TopLargeLogo.vue';
import BasicProfile from '@/components/atoms/BasicProfile.vue';
import ContactProfile from '@/components/atoms/ContanctProfile.vue'
import SkillProfile from '@/components/atoms/SkillProfile.vue';

export default defineNuxtComponent({
  name: 'top',
  components: { TopLargeLogo, BasicProfile, ContactProfile, SkillProfile },
  setup() {
    useNuxt2Meta({ titleTemplate: 'strv.dev' });
    const first = ref(true);
    onMounted(() => {
      const initialVh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--initial-vh', `${initialVh}px`);

      const v = localStorage.getItem('visited');
      if (v === 'true') {
        first.value = false;
      } else {
        localStorage.setItem('visited', 'true');
      }
    });

    const scroll = (selector: string) => {
      document.querySelector(selector)?.scrollIntoView(true);
    };

    return { first, scroll };
  },
});
</script>

<style lang="scss" scoped>
article {
  transition-property: font-size;
  transition-duration: 0.2s;
  #main-message {
    padding-top: 44px;
    margin-top: -44px;
  }

  .logos {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    .logo {
      width: 80%;
    }
  }

  .jump {
    display: block;
    position: relative;
    // top: calc(70 * var(--initial-vh));
    transition-property: bottom;
    transition-duration: 0.2s;
    @media screen and (max-width: 800px) {
      bottom: 25vh;
    }
    @media screen and (min-width: 800px) {
      bottom: 10vh;
    }
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;
    border-style: none;
    background-color: rgba(0, 0, 0, 0);
    color: black;
    filter: drop-shadow(0px 0px 3px white);
    opacity: 0.6;
    i {
      font-size: 4em;
      font-weight: 700;
      animation: {
        name: updown-shake;
        duration: 0.9s;
        fill-mode: forwards;
        iteration-count: infinite;
        direction: alternate;
        timing-function: cubic-bezier();
      }
    }
  }

  .content {
    min-block-size: 100vh;
    font-size: 1.3rem;
    @media screen and (max-width: 800px) {
      font-size: 1.1rem;
    }
  }

  h1 {
    transition: inherit;
    font-size: 2.8rem;
    font-weight: 700;
    @media screen and (max-width: 800px) {
      font-size: 2.4rem;
    }
  }

  @keyframes updown-shake {
    from {
      transform: translateY(-10px) rotateZ(180deg);
    }

    to {
      transform: translateY(10px) rotateZ(180deg);
    }
  }
}
</style>
