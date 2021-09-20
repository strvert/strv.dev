<template>
  <div>
    <Header />
    <container>
      <nuxt />
    </container>
  </div>
</template>

<script lang="ts">
import { defineComponent, useMeta, useRouter, ref, useContext } from '@nuxtjs/composition-api';

import Container from '@/components/atoms/Container.vue';
import Header from '@/components/molecules/Header.vue';

export default defineComponent({
  components: { Container, Header },
  setup() {},
});
</script>
