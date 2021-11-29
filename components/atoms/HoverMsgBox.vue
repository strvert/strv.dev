<template>
  <msg-box :show="!hide" :text="text">
    <div @mouseenter="showMsgBox" @mouseleave="hideMsgBox">
      <slot />
    </div>
  </msg-box>
</template>

<script lang="ts">
import { defineNuxtComponent, ref } from '#app';
import MsgBox from '@/components/atoms/MsgBox.vue';

export default defineNuxtComponent({
  components: { MsgBox },
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  setup() {
    const hide = ref(true);

    const showMsgBox = () => {
      hide.value = false;
    };

    const hideMsgBox = () => {
      hide.value = true;
    };

    return { showMsgBox, hideMsgBox, hide };
  },
});
</script>

<style lang="scss" scoped>
</style>
