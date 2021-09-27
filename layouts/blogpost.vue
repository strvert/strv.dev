<template>
  <div>
    <Header class="header" />
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

import Container from '@/components/atoms/Container.vue';
import Header from '@/components/molecules/Header.vue';
import Giscus from '@/components/atoms/Giscus.vue';

export default defineComponent({
  components: { Container, Header, Giscus },
  setup() {},
});
</script>

<style lang="scss" scoped>
.header {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
}

.content {
  max-inline-size: 800px;
  margin: 0 auto;

  @media screen and (max-width: 800px) {
    margin-left: 10px;
    margin-right: 10px;
  }
}

.giscus-wrapper {
  max-inline-size: 800px;
  margin: 0 auto;
}
</style>
