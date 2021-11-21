<template>
  <div>
    <blogpost-frame v-if="page !== undefined" :page="page" :path="path">
      <nuxt-content :document="page" />
    </blogpost-frame>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, useRoute } from '#app';
import { useFetch } from '@nuxtjs/composition-api';
import BlogpostFrame from '@/components/atoms/BlogpostFrame.vue';
import { useBlogContent } from '@/composables/utils/BlogContent';
import { useBlogpostMeta } from '@/composables/utils/BlogpostMeta';

export default defineNuxtComponent({
  components: { BlogpostFrame },
  setup() {
    const route = useRoute();
    const { page, path, fetch } = useBlogContent(route.params.blogpost, true);

    const { setBlogpostMeta } = useBlogpostMeta();
    useFetch(async () => {
      await fetch();
      setBlogpostMeta(page.value);
    });

    return { page, path };
  },
});
</script>
