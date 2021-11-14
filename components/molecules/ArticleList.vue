<template>
  <content-list>
    <li v-for="article in articles" :key="article.path">
      <article-list-entry :article="article" />
    </li>
  </content-list>
</template>

<script lang="ts">
import { defineNuxtComponent, PropType, watch } from '#app';
import ContentList from '@/components/atoms/ContentList.vue';
import ArticleListEntry from '@/components/atoms/ArticleListEntry.vue';
import { IArticle } from '@/composables/stores/Article';

export const articleSortKeys = ['updatedDate', 'postedDate'] as const;
export type ArticleSortBy = typeof articleSortKeys[number];
export const getDisplayNameOfArticalSortBy = (sortBy: ArticleSortBy) => {
  const dict = new Map<ArticleSortBy, string>([
    ['postedDate', '投稿日時'],
    ['updatedDate', '更新日時'],
  ]);
  return dict.has(sortBy) ? dict.get(sortBy) : '';
};

export default defineNuxtComponent({
  components: { ContentList, ArticleListEntry },
  props: {
    articles: {
      type: Array as PropType<Array<IArticle>>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
[v-cloak] {
  opacity: 0;
}
</style>
