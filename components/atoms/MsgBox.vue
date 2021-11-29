<template>
  <div class="container">
    <div class="msgbox" :class="{ hide: !show }">
      <span>{{ text }}</span>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, ref } from '#app';

export default defineNuxtComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    }
  },
});
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  .msgbox {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 3px;
    left: 50%;
    transform: translateY(-100%) translateX(-50%);
    block-size: 2.5rem;
    inline-size: auto;
    white-space: nowrap;
    background: var(--strvdev-blogpost-code);
    border-radius: 5px;

    transition-property: opacity;
    transition-duration: 0.1s;

    padding: 0.3rem;
    span {
      margin: 0;
      font-size: 1.1rem;
    }

    &.hide {
      opacity: 0;
    }
  }
}
</style>
