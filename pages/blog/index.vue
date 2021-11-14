<template>
  <content-list-container listTitle="記事一覧" :ready="completed">
    <article-list :articles="pages" />
  </content-list-container>
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxt2Meta } from '#app';
import ArticleList from '@/components/molecules/ArticleList.vue';
import { StaticParamBuilder } from '@/composables/utils/SearchParamBuilder/StaticParamBuilder';
import ContentListContainer from '@/components/molecules/ContentListContainer.vue';
import { useSearchBlogContent } from '@/composables/utils/SearchBlogContent';

export default defineNuxtComponent({
  name: 'blog',
  components: { ContentListContainer, ArticleList },
  setup() {
    useNuxt2Meta({ title: '記事一覧' });
    const { pages, completed } = useSearchBlogContent(new StaticParamBuilder({}));
    return { pages, completed };
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
