<template>
  <div>{{ temp }}</div>
</template>

<script lang="ts">
import { defineComponent, useMeta, useRouter, ref, useContext } from '@nuxtjs/composition-api';

export default defineComponent({
  head: {},
  props: {},
  setup() {
    useMeta({ title: 'blog' });
    const { route } = useContext();
    const temp = ref(route.value.params.blogpost);

    return { temp };
  },
});
</script>
