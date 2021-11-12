<template>
  <div>
    <content-list-container listTitle="検索結果">
      <article-list :articles="pages" />
    </content-list-container>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, useRoute, useNuxt2Meta } from '#app';
import ContentListContainer from '@/components/molecules/ContentListContainer.vue';
import ArticleList from '@/components/molecules/ArticleList.vue';
import { useSearchBlogContent } from '@/composables/utils/SearchBlogContent';
import { SearchParam } from '@/composables/utils/SearchParam';

export default defineNuxtComponent({
  name: 'search',
  components: {
    ContentListContainer,
    ArticleList,
  },
  setup() {
    useNuxt2Meta({ title: '記事検索' });
    const route = useRoute();
    const tag = route.query.t;
    const param: SearchParam = {
      tags: [tag],
    };
    const { pages } = useSearchBlogContent(param);
    return { pages, tag };
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
