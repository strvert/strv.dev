<template>
  <div class="outer">
    <blogpost-frame v-if="page !== undefined" :page="page" :path="path">
      <blueprint-graph />
      <blueprint-graph />
      <nuxt-content :document="page" />
    </blogpost-frame>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, useRoute, onMounted } from '#app';
import BlogpostFrame from '@/components/atoms/BlogpostFrame.vue';
import BlueprintGraph from '@/components/atoms/BlueprintGraph.vue';
import { useBlogContent } from '@/composables/utils/BlogContent';
import { useBlogpostMeta } from '@/composables/utils/BlogpostMeta';

export default defineNuxtComponent({
  name: 'blogpost-content',
  components: { BlogpostFrame, BlueprintGraph },
  setup() {
    const route = useRoute();
    const { page, path } = useBlogContent(route.params.blogpost);

    const { setBlogpostMeta } = useBlogpostMeta();
    setBlogpostMeta(page);

    return { page, path };
  },
});
</script>
