<template>
  <div>
    <blogpost-frame v-if="page !== undefined" :page="page" :path="path">
      <nuxt-content :document="page" />
    </blogpost-frame>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, useRoute } from '#app';
import BlogpostFrame from '@/components/atoms/BlogpostFrame.vue';
import { useBlogContent } from '@/composables/utils/BlogContent';
import { useBlogpostMeta } from '@/composables/utils/BlogpostMeta';

export default defineNuxtComponent({
  components: { BlogpostFrame },
  setup() {
    const route = useRoute();
    const { page, path } = useBlogContent(route.params.blogpost);

    const { setBlogpostMeta } = useBlogpostMeta();
    setBlogpostMeta(page);

    return { page, path };
  },
});
</script>
