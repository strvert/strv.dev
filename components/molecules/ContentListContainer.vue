<template>
  <section>
    <header>
      <h1>{{ listTitle }}</h1>
    </header>

    <div class="list" v-bind:class="classObject">
      <slot />
    </div>
  </section>
</template>

<script lang="ts">
import { defineNuxtComponent, computed } from '#app';
import SeriesList from '@/components/molecules/SeriesList.vue';
import DropDownMenu from '@/components/atoms/DropDownMenu.vue';

export default defineNuxtComponent({
  components: { SeriesList, DropDownMenu },
  props: {
    listTitle: {
      type: String,
      required: true,
    },
    ready: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const classObject = computed(() => {
      return { ready: props.ready };
    });
    return { classObject };
  },
});
</script>

<style lang="scss" scoped>
h1 {
  @media screen and (max-width: 800px) {
    font-size: 1.4em;
  }
}

.list {
  transition-property: opacity;
  transition-duration: 0.3s;
  opacity: 0;
}

.ready {
  opacity: 1;
}
</style>
