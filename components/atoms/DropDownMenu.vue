<template>
  <select>
    <option v-for="option in options" :key="option"></option>
  </select>
</template>

<script lang="ts">
import { defineNuxtComponent, PropType } from '#app';

// type PropsType = {
//   options: Array<string>;
//   getDisplayName: (key: string) => string;
// };

export default defineNuxtComponent({
  props: {
    options: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    getDisplayName: {
      type: Object as PropType<(key: string) => string>,
      default: () => {
        return (key: string) => key;
      },
    },
  },
  setup() {},
});
</script>

