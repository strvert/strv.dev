<template>
  <article>
    <div class="logos">
      <top-large-logo />
      <nuxt-link class="jump" to="#main-message"><i class="im im-eject"></i></nuxt-link>
    </div>
    <h1 id="main-message">{{ first ? 'はじめまして！' : 'また会いましたね！' }}</h1>
    <div class="content">
      <p>私は<strong>すとんりばー</strong>です。すこしだけ自己紹介を見ていってください。</p>
      <basic-profile />
      <skill-profile />
    </div>
  </article>
</template>

<script lang="ts">
import { defineNuxtComponent, ref, useNuxt2Meta, onMounted } from '#app';
import TopLargeLogo from '@/components/atoms/TopLargeLogo.vue';
import BasicProfile from '@/components/atoms/BasicProfile.vue';
import SkillProfile from '@/components/atoms/SkillProfile.vue';

export default defineNuxtComponent({
  name: 'top',
  components: { TopLargeLogo, BasicProfile, SkillProfile },
  setup() {
    useNuxt2Meta({ titleTemplate: 'strv.dev' });
    const first = ref(true);
    onMounted(() => {
      const v = localStorage.getItem('visited');
      if (v === 'true') {
        first.value = false;
      } else {
        localStorage.setItem('visited', 'true');
      }
    });
    return { first };
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
    .jump {
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
      display: block;
      position: absolute;
      bottom: 23vh;
      left: 50%;
      transform: translateX(-50%);
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
