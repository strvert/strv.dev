<template>
  <content-list-container :listTitle="`シリーズ: ${seriesName}`">
    <article-list :articles="pages" />
  </content-list-container>
</template>

<script lang="ts">
import { defineComponent, computed, useNuxt2Meta, useRoute } from '#app';
import ArticleList from '@/components/molecules/ArticleList.vue';
import ContentListContainer from '@/components/molecules/ContentListContainer.vue';
import { useSearchBlogContent } from '@/composables/utils/SearchBlogContent';
import { IArticle } from '@/composables/stores/Article';

export default defineComponent({
  components: { ContentListContainer, ArticleList },
  setup() {
    useNuxt2Meta({ title: 'blog' });
    const route = useRoute();
    const seriesName = route.params.series;
    const { pages: foundPages } = useSearchBlogContent({ series: seriesName });
    const pages = computed(() => {
      return foundPages.value.sort((p1: IArticle, p2: IArticle) => {
        return p1.seriesIndex! - p2.seriesIndex!;
      });
    });
    return { pages, seriesName };
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
