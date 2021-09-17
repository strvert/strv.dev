<template>
  <div>
    <div class="sun"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useMeta, useRouter, ref, useContext } from '@nuxtjs/composition-api';

export default defineComponent({
  head: {},
  setup() {
    useMeta({ title: 'blog' });
    const config = useContext();
  },
});
</script>

<style lang="scss" scoped>

.sun {
  --size: 2300px;

  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 20px auto;

  background: radial-gradient(#0434a322 65%, #22a5fb22);

  inline-size: var(--size);
  block-size: var(--size);
  border-radius: var(--size);
}
</style>
