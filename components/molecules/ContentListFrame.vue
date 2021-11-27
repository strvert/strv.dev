<template>
  <article>
    <header>
      <h1>{{ listTitle }}</h1>
    </header>

    <transition name="content-list">
      <div v-if="ready">
        <slot />
      </div>
    </transition>
  </article>
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';
import SeriesList from '@/components/molecules/SeriesList.vue';
import DropDownMenu from '@/components/atoms/DropDownMenu.vue';

export default defineNuxtComponent({
  name: 'content-list-frame',
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
});
</script>

<style lang="scss" scoped>
article {
  margin-block-start: var(--default-margin-block-start);
}

h1 {
  @media screen and (max-width: 800px) {
    font-size: 1.4em;
  }
}

.content-list-enter-active,
.content-list-leave-active {
  transition: opacity 0.2s;
}

.content-list-enter,
.content-list-leave-to {
  opacity: 0;
}
</style>
