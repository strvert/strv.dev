<template>
  <msg-box :show="copied" class="msgbox" text="コピー完了！">
    <div class="content" @touchstart="copy" @mousedown="copy" @mouseleave="reset">
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
    value: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const copied = ref(false);

    const reset = () => {
      window.setTimeout(() => {
        copied.value = false;
      }, 200);
    };

    const copy = () => {
      copied.value = true;
      navigator.clipboard.writeText(props.value);
      window.setTimeout(() => {
        reset();
      }, 1000);
    };
    return { copy, reset, copied };
  },
});
</script>

<style lang="scss" scoped>
.msgbox {
  cursor: pointer;
}

.content {
  @media screen and (min-width: 800px) {
    &:hover {
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
