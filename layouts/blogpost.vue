<template>
  <app-frame>
    <nuxt />
    <article>
      <div class="giscus-wrapper">
        <giscus />
      </div>
    </article>
  </app-frame>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import Giscus from '@/components/atoms/Giscus.vue';
import AppFrame from '@/components/organisms/AppFrame.vue';

export default defineComponent({
  components: { AppFrame, Giscus },
  setup() {},
});
</script>

<style lang="scss" scoped>
.giscus-wrapper {
  max-inline-size: 820px;
  @media screen and (max-width: 820px) {
    max-inline-size: 800px;
  }
  margin: 0 auto;
}
</style>
