<template>
  <app-frame>
    <nuxt />
    <article class="giscus-wrapper">
      <giscus />
    </article>
  </app-frame>
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';
import Giscus from '@/components/atoms/Giscus.vue';
import AppFrame from '@/components/organisms/AppFrame.vue';

export default defineNuxtComponent({
  components: { AppFrame, Giscus },
});
</script>

<style lang="scss" scoped>
.giscus-wrapper {
  max-inline-size: 820px;
  padding-block-start: 1rem;
  @media screen and (max-width: 820px) {
    max-inline-size: 800px;
  }
  margin: 0 auto;
}
</style>
