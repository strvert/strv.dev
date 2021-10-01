<template>
  <content-list-container :listTitle="`シリーズ: ${seriesName}`">
    <article-list :articles="pages" />
  </content-list-container>
</template>

<script lang="ts">
import { defineComponent, computed, useMeta, useContext } from '@nuxtjs/composition-api';
import ArticleList from '@/components/molecules/ArticleList.vue';
import ContentListContainer from '@/components/molecules/ContentListContainer.vue';
import { useSearchBlogContent } from '@/composables/utils/SearchBlogContent';

export default defineComponent({
  head: {},
  components: { ContentListContainer, ArticleList },
  setup() {
    useMeta({ title: 'blog' });
    const { route } = useContext();
    const seriesName = route.value.params.series;
    const { pages: foundPages } = useSearchBlogContent({ series: seriesName });
    const pages = computed(() => {
      return foundPages.value.sort((p1, p2) => {
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
