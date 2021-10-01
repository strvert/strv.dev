<template>
  <section>
    <header>
      <h1>{{ listTitle }}</h1>
    </header>

    <div>
      <slot />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import SeriesList from '@/components/molecules/SeriesList.vue';

export default defineComponent({
  head: {},
  components: { SeriesList },
  props: {
    listTitle: {
      type: String,
      required: true,
    },
  },
  setup() {},
});
</script>

<style lang="scss" scoped>
h1 {
  @media screen and (max-width: 800px) {
    font-size: 1.4em;
  }
}
</style>
