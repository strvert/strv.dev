<template>
  <blogpost-frame :page="page" :path="path">
    <nuxt-content :document="page" />
  </blogpost-frame>
</template>

<script lang="ts">
import { defineNuxtComponent, useRoute, useNuxt2Meta } from '#app';
import BlogpostFrame from '@/components/atoms/BlogpostFrame.vue';
import { useBlogContent } from '@/composables/utils/BlogContent';
import { useBlogpostMeta } from '@/composables/utils/BlogpostMeta';

export default defineNuxtComponent({
  components: { BlogpostFrame },
  setup() {
    const route = useRoute();
    const { page, path } = useBlogContent(route.params.blogpost);

    const { makeBlogpostMeta } = useBlogpostMeta();
    const { title, meta } = makeBlogpostMeta(page);

    useNuxt2Meta({ title, meta });

    return { page, path };
  },
});
</script>
