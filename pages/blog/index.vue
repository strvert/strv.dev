<template>
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
