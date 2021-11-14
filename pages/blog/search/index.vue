<template>
  <div>
    <content-list-container listTitle="検索結果" :ready="completed">
      <article-list :articles="pages" />
    </content-list-container>
  </div>
</template>

<script lang="ts">
import { defineNuxtComponent, useNuxt2Meta } from '#app';
import ContentListContainer from '@/components/molecules/ContentListContainer.vue';
import ArticleList from '@/components/molecules/ArticleList.vue';
import { useSearchBlogContent } from '@/composables/utils/SearchBlogContent';
import { URLParamBuilder } from '@/composables/utils/SearchParamBuilder/URLParamBuilder';

export default defineNuxtComponent({
  name: 'search',
  components: {
    ContentListContainer,
    ArticleList,
  },
  setup() {
    useNuxt2Meta({ title: '記事検索' });
    const { pages, completed } = useSearchBlogContent(new URLParamBuilder());
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

.fetch-completed {
  opacity: 0;
  color: red;
}
</style>
