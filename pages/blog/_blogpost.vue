<template>
  <div class="outer">
    <blogpost-frame v-if="page !== undefined" :page="page" :path="path">
      <nuxt-content :document="page" />
    </blogpost-frame>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, useRoute } from '#app';
import BlogpostFrame from '@/components/atoms/BlogpostFrame.vue';
// import BlueprintGraph from '@/components/atoms/BlueprintGraph.vue';
import { useBlogContent } from '@/composables/utils/BlogContent';
import { buildHead } from '@/composables/utils/BlogpostMeta';
import { slugToPath } from '@/composables/utils/ConvertArticlePath';
// import 'blueprint-renderer-webcomponents';

export default defineNuxtComponent({
  name: 'blogpost-content',
  components: { BlogpostFrame },
  head() {
    return buildHead(this.page);
  },
  async asyncData(param: any) {
    const route = param.route;
    const path = slugToPath(route.params.blogpost);
    const page = await (async () => {
      const p = await param.$content(path).fetch();
      if (Array.isArray(p)) {
        return p[0];
      }
      return p;
    })();
    // const { setBlogpostMeta } = useBlogpostMeta();
    // setBlogpostMeta(page);
    return { page, path };
  },
  // setup() {
  //   // const route = useRoute();
  //   // const { page, path } = useBlogContent(route.params.blogpost);
  //   const { setBlogpostMeta } = useBlogpostMeta();
  //   setBlogpostMeta(this.page);
  // },
});
</script>
