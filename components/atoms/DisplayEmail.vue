<template>
  <text-copy-wrapper :value="`${head}@${tail}`">
    <span
      ><span class="head">{{ head }}</span
      ><span class="tail">{{ tail }}</span></span
    >
  </text-copy-wrapper>
</template>

<script lang="ts">
import { defineNuxtComponent } from '#app';
import TextCopyWrapper from '@/components/atoms/TextCopyWrapper.vue';

export default defineNuxtComponent({
  name: 'display-email',
  components: { TextCopyWrapper },
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
