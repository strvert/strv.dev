<template>
  <div class="frame">
    <Header class="header" />
    <main>
      <div class="content">
        <container>
          <nuxt />
        </container>
      </div>
      <article>
        <div class="giscus-wrapper">
          <giscus />
        </div>
      </article>
    </main>
    <Footer class="footer" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

import Container from '@/components/atoms/Container.vue';
import Header from '@/components/molecules/Header.vue';
import Footer from '@/components/molecules/Footer.vue';
import Giscus from '@/components/atoms/Giscus.vue';

export default defineComponent({
  components: { Container, Header, Footer, Giscus },
  setup() {},
});
</script>

<style lang="scss" scoped>
.frame {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .header {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
  }

  main {
    flex: 1;

    .content {
      max-inline-size: 800px;
      margin: 0 auto;

      @media screen and (max-width: 820px) {
        margin-left: 10px;
        margin-right: 10px;
      }
    }

    .giscus-wrapper {
      max-inline-size: 820px;
      @media screen and (max-width: 820px) {
        max-inline-size: 800px;
      }
      margin: 0 auto;
    }
  }
}
</style>
