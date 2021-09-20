<template>
  <div>
    <Header class="header" />
    <container>
      <nuxt />
    </container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

import Container from '@/components/atoms/Container.vue';
import Header from '@/components/molecules/Header.vue';

export default defineComponent({
  components: { Container, Header },
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
</style>
