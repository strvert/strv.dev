<template>
  <div class="list-wrapper">
    <span class="material-icons">local_offer</span>
    <ul class="tag-list">
      <li v-for="tag in tags" :key="tag">
        <nuxt-link :to="`/blog/search?tags=${encodeURIComponent(tag)}`">{{ tag }}</nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
export default defineComponent({
  props: {
    tags: {
      type: Array as PropType<Array<string>>,
      default: () => {
        return new Array();
      },
    },
  },
});
</script>

<style lang="scss" scoped>
.list-wrapper {
  display: flex;
  gap: 0.3em;
  align-items: center;
  align-content: center;

  > .material-icons {
    color: inherit;
    font-size: 1.3em;
  }
  > .tag-list {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    margin: 0;
    padding: 0;

    gap: 0.7em;

    li {
      background-color: var(--strvdev-blogpost-tag);
      border-radius: 4px;
      padding: 0 0.2em;
      font-size: 0.9em;
    }
  }
}
</style>
