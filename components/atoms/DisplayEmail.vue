<template>
  <span
    ><span class="head">{{ head }}</span><span class="tail">{{ tail }}</span></span
  >
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';
export default defineNuxtComponent({
  name: 'display-email',
  props: {
    mail: {
      type: String,
      required: true,
    },
  },
  setup(prop) {
    const [head, tail] = prop.mail.split('<at>');

    return { head, tail };
  },
});
</script>

<style lang="scss" scoped>
  .tail {
    &:before {
      content: '@';
    }
  }
</style>
