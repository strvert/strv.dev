<template>
  <content-list-container listTitle="記事一覧">
    <article-list :articles="pages" />
  </content-list-container>
</template>

<script lang="ts">
import { defineComponent, useNuxt2Meta } from '#app';
import ArticleList from '@/components/molecules/ArticleList.vue';
// import {
//   getDisplayNameOfArticalSortBy,
//   ArticleSortBy,
// } from '@/components/molecules/ArticleList.vue';
import ContentListContainer from '@/components/molecules/ContentListContainer.vue';
import { useSearchBlogContent } from '@/composables/utils/SearchBlogContent';

export default defineComponent({
  name: 'blog',
  components: { ContentListContainer, ArticleList },
  setup() {
    useNuxt2Meta({ title: '記事一覧' });
    const { pages } = useSearchBlogContent();
    return { pages };
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
