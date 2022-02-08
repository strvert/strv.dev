<template>
  <content-list-frame :listTitle="`シリーズ: ${seriesName}`" :ready="completed">
    <article-list :articles="pages" />
  </content-list-frame>
</template>

<script lang="ts">
import { defineComponent, computed, ref, useNuxt2Meta, useRoute } from '#app';

import ArticleList from '@/components/molecules/ArticleList.vue';
import ContentListFrame from '@/components/molecules/ContentListFrame.vue';

import { StaticParamBuilder } from '@/composables/utils/SearchParamBuilder/StaticParamBuilder';
import { useSearchBlogContent } from '@/composables/utils/SearchBlogContent';
import { IArticle } from '@/composables/stores/Article';

export default defineComponent({
  components: { ContentListFrame, ArticleList },
  setup() {
    const title = ref('シリーズ: ');
    useNuxt2Meta({ title });
    const route = useRoute();
    const seriesName = route.params.series;
    title.value = `シリーズ: ${seriesName}`;
    const { pages: foundPages, completed } = useSearchBlogContent(
      new StaticParamBuilder({ series: seriesName })
    );
    const pages = computed(() => {
      return foundPages.value.sort((p1: IArticle, p2: IArticle) => {
        return p1.seriesIndex! - p2.seriesIndex!;
      });
    });
    return { pages, seriesName, completed };
  },
});
</script>

<style lang="scss" scoped>
h1 {
  @media screen and (max-width: 800px) {
    font-size: 1.4em;
  }
}
</style>
