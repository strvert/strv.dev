<template>
  <div class="frame">
    <Header class="header" />
    <main>
      <div class="content">
        <slot />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';

import Header from '@/components/molecules/Header.vue';
import Footer from '@/components/molecules/Footer.vue';

export default defineNuxtComponent({
  components: { Header, Footer },
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

      @media screen and (max-width: 800px) {
        margin-left: 10px;
        margin-right: 10px;
      }
    }
  }
}
</style>
